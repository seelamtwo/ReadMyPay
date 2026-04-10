import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { logAdminAudit } from "@/lib/admin-audit";
import {
  adminMutationLimiter,
  rateLimitOr429,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const BodySchema = z.object({
  userId: z.string().min(1),
  chargeId: z
    .string()
    .min(1)
    .refine((s) => s.startsWith("ch_"), "Must be a Stripe Charge id (ch_…)"),
  /** Partial refund in cents (USD). Omit for full remaining amount. */
  amountCents: z.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const authz = await requireAdminApi();
  if (!authz.ok) return authz.response;

  const blocked = await rateLimitOr429(
    adminMutationLimiter,
    `admin-refund:${authz.session.user!.id}`
  );
  if (blocked) return blocked;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { userId, chargeId, amountCents } = parsed.data;
  const adminId = authz.session.user!.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  if (!sub?.stripeCustomerId || sub.stripeCustomerId.startsWith("pending_")) {
    return NextResponse.json(
      { error: "User has no real Stripe customer id on file." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  try {
    const charge = await stripe.charges.retrieve(chargeId);
    const c = charge.customer;
    const chargeCustomerId =
      typeof c === "string" ? c : c && "id" in c ? c.id : null;
    if (chargeCustomerId !== sub.stripeCustomerId) {
      await logAdminAudit({
        adminUserId: adminId,
        targetUserId: userId,
        action: "REFUND_CHARGE_REJECTED",
        payload: {
          chargeId,
          reason: "customer_mismatch",
          expectedCustomer: sub.stripeCustomerId,
          chargeCustomer: chargeCustomerId,
        },
      });
      return NextResponse.json(
        { error: "Charge does not belong to this user's Stripe customer." },
        { status: 403 }
      );
    }

    if (charge.status !== "succeeded" || !charge.paid) {
      return NextResponse.json(
        { error: "Charge is not in a refundable succeeded state." },
        { status: 400 }
      );
    }

    const remaining =
      charge.amount - (charge.amount_refunded ?? 0);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Charge is already fully refunded." },
        { status: 400 }
      );
    }

    if (amountCents != null && amountCents > remaining) {
      return NextResponse.json(
        {
          error: `amountCents exceeds remaining refundable (${remaining} cents).`,
        },
        { status: 400 }
      );
    }

    const idempotencyKey = `admin-refund-${chargeId}-${crypto.randomUUID()}`;
    const refund = await stripe.refunds.create(
      {
        charge: chargeId,
        ...(amountCents != null ? { amount: amountCents } : {}),
        metadata: {
          adminUserId: adminId,
          targetUserId: userId,
        },
      },
      { idempotencyKey }
    );

    await logAdminAudit({
      adminUserId: adminId,
      targetUserId: userId,
      action: "REFUND_CHARGE",
      payload: {
        chargeId,
        amountRequestedCents: amountCents ?? null,
        refundAmount: refund.amount,
        currency: refund.currency,
      },
      stripeRefundId: refund.id,
    });

    return NextResponse.json({
      ok: true,
      refundId: refund.id,
      amount: refund.amount,
      currency: refund.currency,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Stripe refund failed.";
    await logAdminAudit({
      adminUserId: adminId,
      targetUserId: userId,
      action: "REFUND_CHARGE_FAILED",
      payload: { chargeId, error: message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
