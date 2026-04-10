import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

type CheckoutBody = {
  priceId?: string;
  /** `subscription` (monthly) or `payment` (per-document credit). */
  mode?: "subscription" | "payment";
  /** Relative path only, e.g. `/dashboard?tab=explain&resume=1&paid=1` */
  successPath?: string;
  cancelPath?: string;
};

function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.includes("..")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
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

  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { priceId, mode = "subscription", successPath, cancelPath } = body;
  if (!priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }
  if (mode !== "subscription" && mode !== "payment") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId || customerId.startsWith("pending_")) {
      const customer = await stripe.customers.create({
        email: session.user.email,
      });
      customerId = customer.id;
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: { stripeCustomerId: customerId },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
        },
      });
    }

    const baseUrl = getAppBaseUrl().replace(/\/+$/, "");

    const defaultSuccess = `${baseUrl}/account?success=true`;
    const defaultCancel = `${baseUrl}/account`;

    let success_url =
      successPath && isSafeRedirectPath(successPath.split("#")[0] ?? "")
        ? `${baseUrl}${successPath}`
        : defaultSuccess;
    if (
      successPath &&
      isSafeRedirectPath(successPath.split("#")[0] ?? "") &&
      !success_url.includes("{CHECKOUT_SESSION_ID}")
    ) {
      const join = success_url.includes("?") ? "&" : "?";
      success_url = `${success_url}${join}session_id={CHECKOUT_SESSION_ID}`;
    }
    const cancel_url =
      cancelPath && isSafeRedirectPath(cancelPath.split("#")[0] ?? "")
        ? `${baseUrl}${cancelPath}`
        : defaultCancel;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      allow_promotion_codes: mode === "subscription",
      ...(mode === "payment"
        ? {
            metadata: {
              userId: session.user.id,
              type: "prepaid_doc",
            },
          }
        : {}),
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Checkout could not be created.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
