import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { isDocsUsageLimitDisabled, isOverLimit } from "@/lib/usage";
import {
  isPlausibleBankOrCardStatement,
  MULTI_NON_STATEMENT_MESSAGE,
} from "@/lib/statement-detect";
import { UNCATEGORIZED_LABEL } from "@/types/spending";
import { z } from "zod";

export const runtime = "nodejs";

const MAX_TEXT_PER_DOC = 45_000;
const MAX_TOTAL_TEXT = 120_000;
const MAX_DOCUMENTS = 12;
const MAX_IMAGES = 16;

const TxSchema = z.object({
  date: z.union([z.string(), z.null()]).optional(),
  description: z.string(),
  amount: z.number(),
  category: z.string(),
});

const AnalysisSchema = z.object({
  transactions: z.array(TxSchema),
  overallSummary: z.string().optional(),
});

const ImageGroupSchema = z.object({
  name: z.string().max(512),
  urls: z.array(z.string()).max(MAX_IMAGES),
});

const BodySchema = z
  .object({
    documents: z
      .array(
        z.object({
          name: z.string().max(512),
          text: z.string().max(MAX_TEXT_PER_DOC),
        })
      )
      .max(MAX_DOCUMENTS)
      .optional(),
    imageUrls: z.array(z.string()).max(MAX_IMAGES).optional(),
    imageGroups: z.array(ImageGroupSchema).max(MAX_DOCUMENTS).optional(),
  })
  .superRefine((val, ctx) => {
    const groups = val.imageGroups?.length
      ? val.imageGroups
      : val.imageUrls?.length
        ? [{ name: "Statement", urls: val.imageUrls }]
        : [];
    const total = groups.reduce((n, g) => n + g.urls.length, 0);
    if (total > MAX_IMAGES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `At most ${MAX_IMAGES} images total across all statements`,
      });
    }
  });

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey: key });
}

function stripJsonFence(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return s.trim();
}

function filterValidDataUrls(urls: string[]): string[] {
  return urls.filter(
    (u) =>
      typeof u === "string" &&
      u.startsWith("data:image/") &&
      u.length < 6_000_000
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { documents: documentsIn = [] } = parsed.data;
  const imageGroupsRaw = parsed.data.imageGroups?.length
    ? parsed.data.imageGroups
    : parsed.data.imageUrls?.length
      ? [{ name: "Statement", urls: parsed.data.imageUrls }]
      : [];

  const imageGroups = imageGroupsRaw.map((g) => ({
    name: g.name,
    urls: filterValidDataUrls(g.urls),
  }));

  const textDocs = documentsIn.filter((d) => d.text.trim().length > 0);
  const imageGroupsNonEmpty = imageGroups.filter((g) => g.urls.length > 0);
  const sourceCount = textDocs.length + imageGroupsNonEmpty.length;
  const multiSource = sourceCount > 1;

  if (multiSource) {
    for (const d of textDocs) {
      if (!isPlausibleBankOrCardStatement(d.name, d.text)) {
        return Response.json({ error: MULTI_NON_STATEMENT_MESSAGE }, { status: 400 });
      }
    }
    for (const g of imageGroupsNonEmpty) {
      if (!isPlausibleBankOrCardStatement(g.name, "")) {
        return Response.json({ error: MULTI_NON_STATEMENT_MESSAGE }, { status: 400 });
      }
    }
  }

  let combinedText = textDocs
    .map((d) => `### Statement file: ${d.name}\n${d.text.trim()}`)
    .join("\n\n---\n\n");

  if (combinedText.length > MAX_TOTAL_TEXT) {
    combinedText =
      combinedText.slice(0, MAX_TOTAL_TEXT) + "\n\n[...truncated for length]";
  }

  const totalImages = imageGroups.reduce((n, g) => n + g.urls.length, 0);
  if (combinedText.trim().length === 0 && totalImages === 0) {
    return Response.json(
      { error: "No text or images to analyze" },
      { status: 400 }
    );
  }

  const skipUsageLimit = isDocsUsageLimitDisabled();

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const tier = subscription?.tier;
    const used = subscription?.docsUsedThisMonth ?? 0;

    if (!skipUsageLimit && isOverLimit(tier, used)) {
      return Response.json({ error: "Usage limit reached" }, { status: 429 });
    }

    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: { docsUsedThisMonth: { increment: 1 } },
      create: {
        userId: session.user.id,
        stripeCustomerId: `pending_${session.user.id}`,
        docsUsedThisMonth: 1,
      },
    });

    const openai = getOpenAI();

    const system = `You extract structured transaction data from one or more bank statements or credit card statements supplied together (text exports and/or scanned pages as images).
Rules:
- For each transaction: date (ISO YYYY-MM-DD or null if unknown), short description, amount as a NUMBER (use negative for money going OUT: purchases, fees, debits, withdrawals; positive for money IN: deposits, salary, refunds credited as positive).
- Assign a spending category for each line: Groceries, Dining, Transport, Shopping, Utilities, Entertainment, Healthcare, Travel, Subscriptions, Fees, Transfer, Income (only for clear inflows), Other.
- When you cannot confidently pick a category for a transaction, use the exact category string "${UNCATEGORIZED_LABEL}" (not a guess).
- Combine ALL statements into one transactions array across files. Do not duplicate the same obvious repeated header rows; real transaction lines from every file should appear.
- If the inputs are not financial statements (e.g. random documents), return an empty transactions array and explain in overallSummary.
- Return ONLY valid JSON, no markdown.`;

    const intro =
      sourceCount > 1
        ? `Extract every transaction from ALL ${sourceCount} statement file(s) below and return one consolidated list.\n\n`
        : `Extract all transactions from the statement below.\n\n`;

    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: "text",
        text:
          intro +
          (combinedText.trim().length > 0
            ? combinedText
            : "(No text — use images only.)"),
      },
    ];

    for (const g of imageGroups) {
      if (g.urls.length === 0) continue;
      userContent.push({
        type: "text",
        text: `### Statement file (images): ${g.name}\nPages/images that belong to this statement follow.`,
      });
      for (const url of g.urls) {
        userContent.push({
          type: "image_url",
          image_url: { url, detail: "high" },
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      store: false,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      max_tokens: 8192,
      temperature: 0.1,
    });

    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      return Response.json(
        { error: "No analysis returned" },
        { status: 502 }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(stripJsonFence(messageContent));
    } catch {
      return Response.json(
        { error: "Model returned invalid JSON" },
        { status: 502 }
      );
    }

    const out = AnalysisSchema.safeParse(data);
    if (!out.success) {
      return Response.json(
        { error: "Could not parse transaction structure" },
        { status: 502 }
      );
    }

    const transactions = out.data.transactions.map((t) => ({
      date: t.date ?? null,
      description: t.description,
      amount: t.amount,
      category: t.category,
    }));

    return Response.json({
      transactions,
      overallSummary: out.data.overallSummary ?? "",
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Spending analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
