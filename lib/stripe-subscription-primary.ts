import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { isStripeMissingCustomerError } from "@/lib/stripe-missing-resource";

export type PrimarySubscriptionResolution =
  | { kind: "ok"; subscription: Stripe.Subscription | null }
  | { kind: "customer_missing" };

/**
 * When a customer has multiple Stripe subscriptions (e.g. old "cancel at period end"
 * plus a new checkout), pick the one we should store and show in the app:
 * prefer subscriptions that are not scheduled to cancel, then newest by `created`.
 *
 * Returns `customer_missing` if `cus_...` was deleted or belongs to another Stripe account.
 */
export async function resolvePrimaryStripeSubscriptionForCustomer(
  customerId: string
): Promise<PrimarySubscriptionResolution> {
  const stripe = getStripe();
  if (!stripe) return { kind: "ok", subscription: null };

  let list: Stripe.ApiList<Stripe.Subscription>;
  try {
    list = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
  } catch (e) {
    if (isStripeMissingCustomerError(e)) {
      return { kind: "customer_missing" };
    }
    throw e;
  }

  const billable = list.data.filter(
    (s) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "past_due"
  );
  if (billable.length === 0) return { kind: "ok", subscription: null };

  const notCancelling = billable.filter((s) => !s.cancel_at_period_end);
  const pool = notCancelling.length > 0 ? notCancelling : billable;

  pool.sort((a, b) => b.created - a.created);
  return { kind: "ok", subscription: pool[0] ?? null };
}
