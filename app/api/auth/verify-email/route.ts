import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  const origin = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", origin));
  }

  const row = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!row || row.expires < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", origin));
  }

  const email = row.identifier.trim().toLowerCase();

  await prisma.user.updateMany({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/login?verified=1", origin));
}
