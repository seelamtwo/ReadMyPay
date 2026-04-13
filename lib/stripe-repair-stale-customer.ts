import { prisma } from "@/lib/db";

/**
 * Clear invalid Stripe IDs so checkout can create a new customer. Called when
 * Stripe reports `cus_...` no longer exists.
 */
export async function repairSubscriptionAfterMissingStripeCustomer(
  userId: string
): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeCustomerId: `pending_${userId}`,
      stripeSubscriptionId: null,
      stripePriceId: null,
      tier: "FREE",
      cancelAtPeriodEndAt: null,
      cancelReasonCategory: null,
      cancelReasonDetail: null,
    },
  });
}

/** Webhook-only: same repair for rows matched by Stripe customer id. */
export async function repairSubscriptionsByStripeCustomerId(
  stripeCustomerId: string
): Promise<void> {
  const rows = await prisma.subscription.findMany({
    where: { stripeCustomerId },
    select: { userId: true },
  });
  for (const { userId } of rows) {
    await repairSubscriptionAfterMissingStripeCustomer(userId);
  }
}
