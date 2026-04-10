import type Stripe from "stripe";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { fulfillPrepaidDocCheckoutSession } from "@/lib/fulfill-prepaid-checkout";
import { fulfillSubscriptionFromCheckoutSession } from "@/lib/fulfill-subscription-from-checkout";

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
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer.id;
        const nextTier =
          priceId && tierMap[priceId] ? tierMap[priceId] : null;
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId ?? null,
            ...(nextTier ? { tier: nextTier } : {}),
            ...(!sub.cancel_at_period_end
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
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : sub.customer.id;
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
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handler error", e);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
