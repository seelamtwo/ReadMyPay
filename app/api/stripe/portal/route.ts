import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { isStripeMissingCustomerError } from "@/lib/stripe-missing-resource";
import { repairSubscriptionAfterMissingStripeCustomer } from "@/lib/stripe-repair-stale-customer";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

/**
 * Stripe Customer Billing Portal — cancel subscription (end of period), update card, etc.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const customerId = sub?.stripeCustomerId;
  if (!customerId || customerId.startsWith("pending_")) {
    return NextResponse.json(
      { error: "No billing account yet. Subscribe or purchase a document first." },
      { status: 400 }
    );
  }

  try {
    const baseUrl = getAppBaseUrl();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl.replace(/\/+$/, "")}/account`,
    });
    if (!portal.url) {
      return NextResponse.json(
        { error: "Stripe did not return a portal URL." },
        { status: 502 }
      );
    }
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    if (isStripeMissingCustomerError(e)) {
      await repairSubscriptionAfterMissingStripeCustomer(session.user.id);
      return NextResponse.json(
        {
          error:
            "Billing profile was out of sync. Refresh the page, then try again.",
        },
        { status: 409 }
      );
    }
    const message =
      e instanceof Error ? e.message : "Billing portal could not be opened.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
