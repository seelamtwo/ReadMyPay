import type Stripe from "stripe";

/** Stripe v21+ exposes billing period bounds on subscription items, not the subscription root. */
export function stripeSubscriptionCurrentPeriodEndUnix(
  sub: Stripe.Subscription
): number | null {
  const end = sub.items.data[0]?.current_period_end;
  return typeof end === "number" ? end : null;
}
