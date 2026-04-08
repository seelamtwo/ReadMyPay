import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { docLimitForTier } from "@/lib/usage";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const tier = subscription?.tier ?? "FREE";
  const used = subscription?.docsUsedThisMonth ?? 0;
  const limit = docLimitForTier(tier);

  return NextResponse.json({
    tier,
    used,
    limit,
  });
}
