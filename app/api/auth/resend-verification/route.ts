import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/verify-turnstile";
import { sendEmailVerification } from "@/lib/send-verification-email";
import { getClientIpFromHeaders } from "@/lib/client-ip";

const bodySchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
});

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

const GENERIC = {
  ok: true,
  message:
    "If that account needs email verification, we sent a new link. Check your inbox.",
} as const;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip = getClientIpFromHeaders(req.headers);
  const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { error: captcha.reason ?? "Captcha verification failed." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.hashedPassword || user.emailVerified) {
    return NextResponse.json(GENERIC);
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const sent = await sendEmailVerification(email, token);
  if (!sent.ok) {
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return NextResponse.json(
      { error: "Could not send email. Try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json(GENERIC);
}
