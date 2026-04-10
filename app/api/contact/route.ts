import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { sendSupportContactEmail } from "@/lib/send-support-contact-email";
import {
  contactFormLimiter,
  rateLimitOr429,
} from "@/lib/rate-limit";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

const BodySchema = z.object({
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(8000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  const blocked = await rateLimitOr429(
    contactFormLimiter,
    `contact:${session.user.id}`
  );
  if (blocked) return blocked;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const subject =
    parsed.data.subject.trim() || "Support request from Read My Pay";
  const message = parsed.data.message.trim();
  const userEmail =
    typeof session.user.email === "string" ? session.user.email : null;

  const result = await sendSupportContactEmail({
    subject,
    message,
    userEmail,
    userId: session.user.id,
  });

  if (!result.ok) {
    if (result.code === "not_configured") {
      return NextResponse.json(
        {
          error:
            "Email is not configured on the server. Set RESEND_API_KEY and try again later.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: result.message ?? "Could not send message." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
