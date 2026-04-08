import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { newPasswordSchema } from "@/lib/auth-password-zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: newPasswordSchema,
});

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
    const { password } = parsed.data;

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
        subscription: {
          create: {
            stripeCustomerId: `pending_${crypto.randomUUID()}`,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch {
    return NextResponse.json(
      { error: "Registration failed." },
      { status: 500 }
    );
  }
}
