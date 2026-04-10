import { prisma } from "@/lib/db";

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" };

/** Validates token, sets emailVerified, removes token row. */
export async function verifyEmailToken(
  token: string | undefined | null
): Promise<VerifyEmailResult> {
  const t = token?.trim();
  if (!t) return { ok: false, reason: "missing" };

  const row = await prisma.verificationToken.findUnique({
    where: { token: t },
  });

  if (!row || row.expires < new Date()) {
    return { ok: false, reason: "expired" };
  }

  const email = row.identifier.trim().toLowerCase();

  await prisma.user.updateMany({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token: t } });

  return { ok: true };
}
