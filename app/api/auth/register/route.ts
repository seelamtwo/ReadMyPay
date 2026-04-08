import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { newPasswordSchema } from "@/lib/auth-password-zod";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";
import { sendEmailVerification } from "@/lib/send-verification-email";
import { getClientIpFromHeaders } from "@/lib/client-ip";
import { isResendSandboxSender } from "@/lib/resend-sender";
import { TRANSACTIONAL_EMAIL_FROM } from "@/lib/transactional-email-from";

const registerSchema = z.object({
  email: z.string().email(),
  password: newPasswordSchema,
  turnstileToken: z.string().optional(),
});

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const email = parsed.data.email.trim().toLowerCase();
    const { password, turnstileToken } = parsed.data;
    const ip = getClientIpFromHeaders(req.headers);

    const captcha = await verifyTurnstileToken(turnstileToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.reason ?? "Captcha verification failed." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        emailVerified: null,
        requiresEmailVerification: true,
        subscription: {
          create: {
            stripeCustomerId: `pending_${randomUUID()}`,
          },
        },
      },
    });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + VERIFY_TTL_MS);

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const sent = await sendEmailVerification(email, token);
    if (!sent.ok) {
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      if (sent.code === "not_configured") {
        return NextResponse.json(
          {
            error:
              "Email is not configured. Set RESEND_API_KEY in .env.local or Vercel. For local-only testing without sending mail, set READMY_PAY_DEV_SKIP_EMAIL=true (see .env.example).",
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          error: "Could not send verification email. Try again later.",
          ...(sent.message ? { detail: sent.message } : {}),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      ...(isResendSandboxSender(TRANSACTIONAL_EMAIL_FROM)
        ? { resendSandboxSender: true }
        : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "Registration failed." },
      { status: 500 }
    );
  }
}
