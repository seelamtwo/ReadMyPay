import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { newPasswordSchema } from "@/lib/auth-password-zod";

const bodySchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: newPasswordSchema,
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const first =
        Object.values(flat.fieldErrors).flat()[0] ??
        flat.formErrors[0] ??
        "Invalid request";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const row = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!row || row.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Request a new one from the login page.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { hashedPassword },
      }),
      prisma.passwordResetToken.delete({ where: { id: row.id } }),
      prisma.session.deleteMany({ where: { userId: row.userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not reset password. Try again." },
      { status: 500 }
    );
  }
}
