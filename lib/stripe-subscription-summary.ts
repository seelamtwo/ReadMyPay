import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { stripeSubscriptionCurrentPeriodEndUnix } from "@/lib/stripe-subscription-period";

export type StripeSubscriptionSummary = {
  currentPeriodEndIso: string;
  cancelAtPeriodEnd: boolean;
  status: string;
};

export async function getStripeSubscriptionSummary(
  stripeSubscriptionId: string | null | undefined
): Promise<StripeSubscriptionSummary | null> {
  const stripe = getStripe();
  if (!stripe || !stripeSubscriptionId) return null;
  try {
    const sub = (await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    )) as Stripe.Subscription;
    const periodEnd = stripeSubscriptionCurrentPeriodEndUnix(sub);
    if (periodEnd === null) return null;
    return {
      currentPeriodEndIso: new Date(periodEnd * 1000).toISOString(),
      cancelAtPeriodEnd: sub.cancel_at_period_end === true,
      status: sub.status,
    };
  } catch {
    return null;
  }
}
