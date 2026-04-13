import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

/**
 * When a customer has multiple Stripe subscriptions (e.g. old "cancel at period end"
 * plus a new checkout), pick the one we should store and show in the app:
 * prefer subscriptions that are not scheduled to cancel, then newest by `created`.
 */
export async function resolvePrimaryStripeSubscriptionForCustomer(
  customerId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const list = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });

  const billable = list.data.filter(
    (s) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "past_due"
  );
  if (billable.length === 0) return null;

  const notCancelling = billable.filter((s) => !s.cancel_at_period_end);
  const pool = notCancelling.length > 0 ? notCancelling : billable;

  pool.sort((a, b) => b.created - a.created);
  return pool[0] ?? null;
}
