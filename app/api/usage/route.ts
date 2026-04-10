import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  canProcessDocument,
  docLimitForTier,
  documentsAvailableRemaining,
  FREE_MONTHLY_DOC_LIMIT,
  PERSONAL_MONTHLY_DOC_LIMIT,
} from "@/lib/usage";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const tier = subscription?.tier ?? "FREE";
    const used = subscription?.docsUsedThisMonth ?? 0;
    const prepaidCredits = subscription?.prepaidDocCredits ?? 0;
    const limit = docLimitForTier(tier);

    const subPayload = subscription
      ? {
          tier: subscription.tier,
          docsUsedThisMonth: subscription.docsUsedThisMonth,
          prepaidDocCredits: subscription.prepaidDocCredits,
        }
      : null;

    const canUse = canProcessDocument(subPayload);
    const remaining = documentsAvailableRemaining(subPayload);

    return NextResponse.json({
      tier,
      used,
      limit,
      remaining,
      prepaidCredits,
      freeMonthlyLimit: FREE_MONTHLY_DOC_LIMIT,
      personalMonthlyLimit: PERSONAL_MONTHLY_DOC_LIMIT,
      canUse,
    });
  } catch (e) {
    console.error("[api/usage] database error", e);
    return NextResponse.json(
      {
        error:
          "Could not load usage from the database. If you recently deployed, run `npm run db:push` (or apply the latest SQL migration for Subscription).",
      },
      { status: 503 }
    );
  }
}
