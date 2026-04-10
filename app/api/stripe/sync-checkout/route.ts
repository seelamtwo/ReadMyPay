import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { fulfillPrepaidDocCheckoutSession } from "@/lib/fulfill-prepaid-checkout";
import { fulfillSubscriptionFromCheckoutSession } from "@/lib/fulfill-subscription-from-checkout";

export const runtime = "nodejs";

/**
 * After Stripe redirect with `session_id`, apply prepaid credit or PERSONAL tier
 * immediately so the client does not wait on webhooks.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (checkout.mode === "payment") {
      const userId = checkout.metadata?.userId?.trim();
      if (checkout.metadata?.type !== "prepaid_doc" || userId !== session.user.id) {
        return NextResponse.json(
          { error: "This checkout is not for your account." },
          { status: 403 }
        );
      }
      const out = await fulfillPrepaidDocCheckoutSession(sessionId, {
        session: checkout,
      });
      if (!out.ok) {
        return NextResponse.json(
          { error: "Checkout is not paid yet.", reason: out.reason },
          { status: 409 }
        );
      }
      return NextResponse.json({ ok: true, kind: "prepaid_doc" });
    }

    if (checkout.mode === "subscription") {
      const out = await fulfillSubscriptionFromCheckoutSession(sessionId, {
        session: checkout,
        forUserId: session.user.id,
      });
      if (!out.ok) {
        const status =
          out.reason === "wrong_customer"
            ? 403
            : out.reason === "not_complete"
              ? 409
              : 400;
        return NextResponse.json(
          {
            error:
              out.reason === "wrong_customer"
                ? "This checkout is not for your account."
                : out.reason === "not_complete"
                  ? "Subscription is not ready yet."
                  : "Not a subscription checkout.",
            reason: out.reason,
          },
          { status }
        );
      }
      return NextResponse.json({ ok: true, kind: "subscription" });
    }

    return NextResponse.json({ error: "Unsupported checkout mode." }, { status: 400 });
  } catch (e) {
    console.error("[sync-checkout]", e);
    return NextResponse.json(
      { error: "Could not sync checkout." },
      { status: 500 }
    );
  }
}
