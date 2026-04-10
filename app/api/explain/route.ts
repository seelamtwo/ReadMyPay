import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";
import {
  canProcessDocument,
  isDocsUsageLimitDisabled,
  planLimitExceededMessage,
} from "@/lib/usage";
import { incrementSubscriptionDocUsage } from "@/lib/document-usage";
import { DocumentUsageFlow } from "@prisma/client";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

/** Node runtime: Prisma is not available on the Edge runtime without Accelerate. */
export const runtime = "nodejs";

/**
 * Plain-text extraction limit (characters), not file bytes. A small PDF can
 * expand to a large amount of text when extracted.
 */
const MAX_EXTRACTED_TEXT_CHARS = 120_000;

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
  const fileNameRaw = (body as { fileName?: unknown }).fileName;
  const fileName =
    typeof fileNameRaw === "string" ? fileNameRaw.trim().slice(0, 512) : "";
  const usageDocumentLabel =
    fileName ||
    (documentType.length > 0 ? documentType.slice(0, 200) : "Document");

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
    if (extractedText.length > MAX_EXTRACTED_TEXT_CHARS) {
      return new Response(
        `Extracted text is too long (${extractedText.length.toLocaleString()} characters; max ${MAX_EXTRACTED_TEXT_CHARS.toLocaleString()}). Try fewer pages, a shorter document, or contact support if you need a higher limit.`,
        { status: 413 }
      );
    }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const skipUsageLimit = isDocsUsageLimitDisabled();

    if (
      !skipUsageLimit &&
      !canProcessDocument(
        subscription
          ? {
              tier: subscription.tier,
              docsUsedThisMonth: subscription.docsUsedThisMonth,
              prepaidDocCredits: subscription.prepaidDocCredits,
            }
          : null
      )
    ) {
      return NextResponse.json(
        {
          code: "USAGE_LIMIT",
          error: planLimitExceededMessage(),
        },
        { status: 429 }
      );
    }

    const userId = session.user.id;

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
            if (!skipUsageLimit) {
              try {
                await incrementSubscriptionDocUsage(userId, {
                  documentName: usageDocumentLabel,
                  flow: DocumentUsageFlow.EXPLAIN,
                });
              } catch (e) {
                console.error("[explain] usage increment failed", e);
              }
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
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
