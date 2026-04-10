import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { stripeSubscriptionCurrentPeriodEndUnix } from "@/lib/stripe-subscription-period";
import { rejectIfEmailNotVerified } from "@/lib/require-email-verified";

export const runtime = "nodejs";

const REASON_CATEGORIES = [
  "too_expensive",
  "not_using_enough",
  "missing_features",
  "switching_service",
  "other",
] as const;

const BodySchema = z.object({
  reasonCategory: z.enum(REASON_CATEGORIES),
  reasonDetail: z.string().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verifyBlock = rejectIfEmailNotVerified(session.user);
  if (verifyBlock) return verifyBlock;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { reasonCategory, reasonDetail } = parsed.data;
  const detailTrim = reasonDetail.trim().slice(0, 2000);

  const row = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!row || row.tier !== "PERSONAL") {
    return NextResponse.json(
      { error: "No active monthly subscription to cancel." },
      { status: 400 }
    );
  }

  const subId = row.stripeSubscriptionId;
  if (!subId) {
    return NextResponse.json(
      { error: "Subscription is not linked to Stripe." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  try {
    const stripeSub = (await stripe.subscriptions.retrieve(
      subId
    )) as Stripe.Subscription;

    if (
      stripeSub.status !== "active" &&
      stripeSub.status !== "trialing" &&
      stripeSub.status !== "past_due"
    ) {
      return NextResponse.json(
        {
          error: `Subscription cannot be canceled (status: ${stripeSub.status}).`,
        },
        { status: 400 }
      );
    }

    if (stripeSub.cancel_at_period_end) {
      const endUnix = stripeSubscriptionCurrentPeriodEndUnix(stripeSub);
      if (endUnix === null) {
        return NextResponse.json(
          { error: "Could not read subscription billing period." },
          { status: 502 }
        );
      }
      const currentPeriodEndIso = new Date(endUnix * 1000).toISOString();
      return NextResponse.json({
        ok: true,
        alreadyScheduled: true,
        currentPeriodEndIso,
        cancelAtPeriodEnd: true,
      });
    }

    const metaDetail =
      detailTrim.slice(0, 450) ||
      reasonCategory;
    await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
      metadata: {
        cancel_reason_category: reasonCategory,
        ...(metaDetail
          ? { cancel_reason_detail: metaDetail }
          : {}),
      },
    });

    const updated = (await stripe.subscriptions.retrieve(
      subId
    )) as Stripe.Subscription;
    const updatedEnd = stripeSubscriptionCurrentPeriodEndUnix(updated);
    if (updatedEnd === null) {
      return NextResponse.json(
        { error: "Canceled but could not read billing period." },
        { status: 502 }
      );
    }
    const currentPeriodEndIso = new Date(
      updatedEnd * 1000
    ).toISOString();

    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEndAt: new Date(),
        cancelReasonCategory: reasonCategory,
        cancelReasonDetail: detailTrim || null,
      },
    });

    return NextResponse.json({
      ok: true,
      alreadyScheduled: false,
      currentPeriodEndIso,
      cancelAtPeriodEnd: true,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not cancel subscription.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
