/**
 * Stripe throws when `stripeCustomerId` in our DB points to a deleted customer
 * or a different Stripe account (test vs live).
 */
export function isStripeMissingCustomerError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    type?: string;
    code?: string;
    param?: string;
    message?: string;
  };
  if (e.code === "resource_missing" && e.param === "customer") return true;
  if (
    e.type === "StripeInvalidRequestError" &&
    typeof e.message === "string" &&
    e.message.includes("No such customer")
  ) {
    return true;
  }
  return false;
}
