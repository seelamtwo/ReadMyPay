import type Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { fulfillPrepaidDocCheckoutSession } from "@/lib/fulfill-prepaid-checkout";
import { fulfillSubscriptionFromCheckoutSession } from "@/lib/fulfill-subscription-from-checkout";
import { repairSubscriptionsByStripeCustomerId } from "@/lib/stripe-repair-stale-customer";
import { resolvePrimaryStripeSubscriptionForCustomer } from "@/lib/stripe-subscription-primary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  const pricePersonal = process.env.STRIPE_PRICE_PERSONAL;

  const tierMap: Record<string, "PERSONAL"> = {};
  if (pricePersonal) tierMap[pricePersonal] = "PERSONAL";

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        if (sess.mode === "payment" && sess.payment_status === "paid") {
          if (sess.metadata?.type === "prepaid_doc" && sess.metadata?.userId) {
            await fulfillPrepaidDocCheckoutSession(sess.id, { session: sess });
          }
          break;
        }
        if (sess.mode === "subscription" && sess.status === "complete") {
          await fulfillSubscriptionFromCheckoutSession(sess.id, {
            session: sess,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const eventSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof eventSub.customer === "string"
            ? eventSub.customer
            : eventSub.customer.id;
        const resolved =
          await resolvePrimaryStripeSubscriptionForCustomer(customerId);
        if (resolved.kind === "customer_missing") {
          await repairSubscriptionsByStripeCustomerId(customerId);
          break;
        }
        const primary = resolved.subscription;
        if (!primary) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              tier: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              cancelAtPeriodEndAt: null,
              cancelReasonCategory: null,
              cancelReasonDetail: null,
            },
          });
          break;
        }
        const priceId = primary.items.data[0]?.price?.id;
        const nextTier =
          priceId && tierMap[priceId] ? tierMap[priceId] : null;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: primary.id,
            stripePriceId: priceId ?? null,
            ...(nextTier ? { tier: nextTier } : {}),
            ...(!primary.cancel_at_period_end
              ? {
                  cancelAtPeriodEndAt: null,
                  cancelReasonCategory: null,
                  cancelReasonDetail: null,
                }
              : {}),
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof deletedSub.customer === "string"
            ? deletedSub.customer
            : deletedSub.customer.id;
        const resolved =
          await resolvePrimaryStripeSubscriptionForCustomer(customerId);
        if (resolved.kind === "customer_missing") {
          await repairSubscriptionsByStripeCustomerId(customerId);
          break;
        }
        const primary = resolved.subscription;
        if (!primary) {
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              tier: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              cancelAtPeriodEndAt: null,
              cancelReasonCategory: null,
              cancelReasonDetail: null,
            },
          });
        } else {
          const priceId = primary.items.data[0]?.price?.id;
          const nextTier =
            priceId && tierMap[priceId] ? tierMap[priceId] : null;
          await prisma.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              stripeSubscriptionId: primary.id,
              stripePriceId: priceId ?? null,
              ...(nextTier ? { tier: nextTier } : {}),
              ...(!primary.cancel_at_period_end
                ? {
                    cancelAtPeriodEndAt: null,
                    cancelReasonCategory: null,
                    cancelReasonDetail: null,
                  }
                : {}),
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handler error", e);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
