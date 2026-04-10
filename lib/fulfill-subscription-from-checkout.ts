import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * Apply PERSONAL tier + Stripe subscription ids from a completed Checkout Session
 * (mode=subscription). Idempotent with webhook `customer.subscription.*` handlers.
 *
 * @param forUserId — When set (browser sync), the Checkout customer must belong to this user.
 */
export async function fulfillSubscriptionFromCheckoutSession(
  checkoutSessionId: string,
  opts?: {
    session?: Stripe.Checkout.Session;
    forUserId?: string;
  }
): Promise<
  | { ok: true }
  | { ok: false; reason: "not_applicable" | "not_complete" | "wrong_customer" }
> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "not_applicable" };
  }

  const sess =
    opts?.session ??
    (await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["subscription"],
    }));

  if (sess.mode !== "subscription") {
    return { ok: false, reason: "not_applicable" };
  }

  if (sess.status !== "complete") {
    return { ok: false, reason: "not_complete" };
  }

  const customerId =
    typeof sess.customer === "string"
      ? sess.customer
      : sess.customer &&
          typeof sess.customer !== "string" &&
          "id" in sess.customer
        ? sess.customer.id
        : null;

  if (!customerId) {
    return { ok: false, reason: "wrong_customer" };
  }

  const row = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!row) {
    return { ok: false, reason: "wrong_customer" };
  }
  if (opts?.forUserId && row.userId !== opts.forUserId) {
    return { ok: false, reason: "wrong_customer" };
  }

  const subRef = sess.subscription;
  const stripeSubId =
    typeof subRef === "string"
      ? subRef
      : subRef && typeof subRef === "object" && "id" in subRef
        ? subRef.id
        : null;

  if (!stripeSubId) {
    return { ok: false, reason: "not_complete" };
  }

  let stripeSub: Stripe.Subscription;
  if (
    typeof subRef === "object" &&
    subRef !== null &&
    "items" in subRef &&
    !("deleted" in subRef && (subRef as { deleted?: boolean }).deleted)
  ) {
    stripeSub = subRef as Stripe.Subscription;
  } else {
    stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  }

  const priceId = stripeSub.items.data[0]?.price?.id ?? null;
  const pricePersonal = process.env.STRIPE_PRICE_PERSONAL?.trim();
  const tier =
    priceId && pricePersonal && priceId === pricePersonal
      ? ("PERSONAL" as const)
      : null;

  await prisma.subscription.update({
    where: { userId: row.userId },
    data: {
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: priceId,
      ...(tier ? { tier } : {}),
    },
  });

  return { ok: true };
}
