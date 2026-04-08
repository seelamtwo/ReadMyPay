import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import { isDocsUsageLimitDisabled, isOverLimit } from "@/lib/usage";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

/** Node runtime: Prisma is not available on the Edge runtime without Accelerate. */
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a friendly financial literacy assistant. 
Your job is to explain financial documents in plain English to people who are not financial experts.

Rules:
- Use simple, clear language. Avoid jargon.
- Break down every number and explain what it means in practical terms.
- If you see deductions, explain what each one is and why it exists.
- End with 1-3 specific, actionable savings or financial tips based on what you see.
- Never make investment recommendations.
- If you see sensitive data like SSNs or account numbers, acknowledge the document type but do NOT repeat those numbers in your explanation.
- Format your response with clear sections using markdown headings.
- Be warm and reassuring — many users feel anxious about financial documents.`;

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey: key });
}

function parseImageUrls(body: unknown): string[] {
  const raw = (body as { imageUrls?: unknown }).imageUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (u): u is string =>
      typeof u === "string" &&
      u.startsWith("data:image/") &&
      u.length > 80
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const imageUrls = parseImageUrls(body);
  const extractedText =
    typeof (body as { extractedText?: string }).extractedText === "string"
      ? (body as { extractedText: string }).extractedText
      : "";
  const documentType =
    (body as { documentType?: string }).documentType ?? "financial document";
  const isImage = Boolean((body as { isImage?: boolean }).isImage);

  const visionMulti = imageUrls.length > 0;
  const visionSingle =
    isImage && !visionMulti && extractedText.startsWith("data:image/");

  if (visionMulti) {
    if (imageUrls.length > 15) {
      return new Response("Too many pages (max 15)", { status: 413 });
    }
    const total = imageUrls.reduce((s, u) => s + u.length, 0);
    if (total > 28_000_000) {
      return new Response("Image payload too large", { status: 413 });
    }
  } else if (visionSingle) {
    if (extractedText.length > 8_000_000) {
      return new Response("Image payload too large", { status: 413 });
    }
  } else {
    if (!extractedText || extractedText.length < 10) {
      return new Response("No content extracted from document", {
        status: 400,
      });
    }
    if (extractedText.length > 15000) {
      return new Response("Document too large", { status: 413 });
    }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const tier = subscription?.tier;
    const used = subscription?.docsUsedThisMonth ?? 0;

    const skipUsageLimit = isDocsUsageLimitDisabled();

    if (!skipUsageLimit && isOverLimit(tier, used)) {
      return new Response(
        "Read My Pay plan limit: free tier allows 2 documents per month in this app (not your ChatGPT subscription). See /account for usage. For local testing add READMY_PAY_DISABLE_USAGE_LIMIT=true to .env.local (or legacy FINCLEAR_DISABLE_USAGE_LIMIT), or in Supabase SQL run: UPDATE \"Subscription\" SET \"docsUsedThisMonth\" = 0;",
        { status: 429 }
      );
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

    const visionUrls = visionMulti ? imageUrls : visionSingle ? [extractedText] : [];
    const detail: "high" | "auto" =
      visionUrls.length <= 2 ? "high" : "auto";

    const userMessage: OpenAI.Chat.ChatCompletionUserMessageParam =
      visionUrls.length > 0
        ? {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  visionUrls.length > 1
                    ? `Please explain this ${documentType} in plain English. You are viewing ${visionUrls.length} consecutive PDF pages (rendered as images). Summarize the document, key numbers, and dates; mention which page ideas appear on when helpful.`
                    : `Please explain this ${documentType} in plain English. Describe what you see on the document and what it means for the reader.`,
              },
              ...visionUrls.map((url) => ({
                type: "image_url" as const,
                image_url: { url, detail },
              })),
            ],
          }
        : {
            role: "user",
            content: `Please explain this ${documentType} in plain English:\n\n${extractedText}`,
          };

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, userMessage],
      max_tokens: 1500,
      temperature: 0.3,
      store: false,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) controller.enqueue(new TextEncoder().encode(text));
            }
          } catch (e) {
            controller.error(e);
            return;
          }
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Explanation could not be generated.";
    return new Response(message, { status: 500 });
  }
}
