import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/send-password-reset-email";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";
import { getClientIpFromHeaders } from "@/lib/client-ip";

const bodySchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

const TOKEN_TTL_MS = 60 * 60 * 1000;

/** Same response whether or not the email exists (avoid account enumeration). */
const GENERIC_OK = {
  ok: true,
  message:
    "If an account exists for that email, we sent a link to reset your password.",
} as const;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    const emailInput = parsed.data.email.trim();
    const ip = getClientIpFromHeaders(req.headers);
    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.reason ?? "Captcha verification failed." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: emailInput, mode: "insensitive" } },
    });

    if (!user?.hashedPassword) {
      return NextResponse.json(GENERIC_OK);
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const sent = await sendPasswordResetEmail(user.email, token);

    if (!sent.ok) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      if (sent.code === "not_configured") {
        return NextResponse.json(
          {
            error:
              "Password reset email is not configured. Set RESEND_API_KEY.",
          },
          { status: 503 }
        );
      }
      const resendHint =
        "Typical causes: invalid RESEND_API_KEY, or the From address in lib/transactional-email-from.ts is not allowed in Resend (verify readmypay.com and support@ in Resend → Domains).";
      console.error(
        "[auth/forgot-password] Resend send_failed:",
        sent.message ?? "(no message)"
      );
      const errorBody =
        process.env.NODE_ENV === "development" && sent.message
          ? `Could not send reset email: ${sent.message}`
          : `Could not send reset email. ${resendHint} Check server logs for the provider error.`;
      return NextResponse.json({ error: errorBody }, { status: 502 });
    }

    return NextResponse.json(GENERIC_OK);
  } catch (e) {
    console.error("[auth/forgot-password]", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2021") {
        return NextResponse.json(
          {
            error:
              "Password reset is not set up on the server database (missing PasswordResetToken table). Run `npx prisma db push` or execute the PasswordResetToken section in prisma/supabase-init.sql.",
          },
          { status: 503 }
        );
      }
    }

    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to the database. Check DATABASE_URL and try again.",
        },
        { status: 503 }
      );
    }

    const devMessage =
      process.env.NODE_ENV === "development" && e instanceof Error
        ? e.message
        : null;

    return NextResponse.json(
      {
        error: devMessage
          ? `Something went wrong: ${devMessage}`
          : "Something went wrong. Try again later.",
      },
      { status: 500 }
    );
  }
}
