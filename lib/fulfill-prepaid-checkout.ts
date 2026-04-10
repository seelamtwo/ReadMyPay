import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * Apply one prepaid document credit for a paid Checkout Session (mode=payment,
 * metadata type=prepaid_doc). Idempotent: same session_id only credits once.
 */
export async function fulfillPrepaidDocCheckoutSession(
  sessionId: string,
  opts?: { session?: Stripe.Checkout.Session }
): Promise<{ ok: true } | { ok: false; reason: "not_applicable" | "not_paid" }> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, reason: "not_applicable" };
  }

  const sess =
    opts?.session ??
    (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    }));

  if (sess.mode !== "payment" || sess.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }

  const meta = sess.metadata;
  if (meta?.type !== "prepaid_doc" || !meta.userId?.trim()) {
    return { ok: false, reason: "not_applicable" };
  }

  const userId = meta.userId.trim();
  const customerId =
    typeof sess.customer === "string"
      ? sess.customer
      : sess.customer && typeof sess.customer !== "string"
        ? sess.customer.id
        : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stripePrepaidFulfillment.create({
        data: {
          checkoutSessionId: sessionId,
          userId,
        },
      });
      await tx.subscription.upsert({
        where: { userId },
        update: { prepaidDocCredits: { increment: 1 } },
        create: {
          userId,
          stripeCustomerId: customerId ?? `pending_${userId}`,
          prepaidDocCredits: 1,
        },
      });
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: true };
    }
    throw e;
  }
}
