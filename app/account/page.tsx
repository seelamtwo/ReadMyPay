import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionActions } from "@/components/account/SubscriptionActions";
import {
  documentsAvailableRemaining,
  docLimitForTier,
  FREE_MONTHLY_DOC_LIMIT,
  PERSONAL_MONTHLY_DOC_LIMIT,
} from "@/lib/usage";
import {
  PRICE_MONTHLY_DISPLAY,
  PRICE_PER_DOCUMENT_DISPLAY,
} from "@/lib/pricing";
import { getStripeSubscriptionSummary } from "@/lib/stripe-subscription-summary";
import { repairSubscriptionAfterMissingStripeCustomer } from "@/lib/stripe-repair-stale-customer";
import { resolvePrimaryStripeSubscriptionForCustomer } from "@/lib/stripe-subscription-primary";
import { noIndexFollow } from "@/lib/seo-metadata";
import type { DocumentUsageFlow } from "@prisma/client";

function flowLabel(flow: DocumentUsageFlow): string {
  switch (flow) {
    case "EXPLAIN":
      return "Explain document";
    case "SPENDING":
      return "Spending summary";
    default:
      return flow;
  }
}

function formatProcessedAtUtc(d: Date): string {
  return `${d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  })}`;
}

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage your Read My Pay subscription, usage limits, monthly document allowance, and Stripe billing from your account.",
  robots: noIndexFollow,
};

/** Personalized; avoid stale RSC cache after in-app cancel / Stripe updates. */
export const dynamic = "force-dynamic";

function formatFriendlyLocalDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const sp = searchParams;
  let subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (
    subscription?.stripeCustomerId &&
    !subscription.stripeCustomerId.startsWith("pending_") &&
    (subscription.tier === "PERSONAL" || subscription.stripeSubscriptionId)
  ) {
    const resolved = await resolvePrimaryStripeSubscriptionForCustomer(
      subscription.stripeCustomerId
    );
    if (resolved.kind === "customer_missing") {
      await repairSubscriptionAfterMissingStripeCustomer(session.user.id);
      subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });
    } else if (
      resolved.subscription &&
      resolved.subscription.id !== subscription.stripeSubscriptionId
    ) {
      const primary = resolved.subscription;
      const priceId = primary.items.data[0]?.price?.id ?? null;
      const pricePersonal = process.env.STRIPE_PRICE_PERSONAL?.trim();
      const tierUpdate =
        priceId && pricePersonal && priceId === pricePersonal
          ? ("PERSONAL" as const)
          : undefined;
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          stripeSubscriptionId: primary.id,
          stripePriceId: priceId,
          ...(tierUpdate ? { tier: tierUpdate } : {}),
          ...(!primary.cancel_at_period_end
            ? {
                cancelAtPeriodEndAt: null,
                cancelReasonCategory: null,
                cancelReasonDetail: null,
              }
            : {}),
        },
      });
      subscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });
    }
  }

  const tier = subscription?.tier ?? "FREE";
  const isMonthlyPlan = tier === "PERSONAL";
  const used = subscription?.docsUsedThisMonth ?? 0;
  const prepaid = subscription?.prepaidDocCredits ?? 0;
  const limit = docLimitForTier(tier);
  const remaining = documentsAvailableRemaining(
    subscription
      ? {
          tier: subscription.tier,
          docsUsedThisMonth: subscription.docsUsedThisMonth,
          prepaidDocCredits: subscription.prepaidDocCredits,
        }
      : null
  );

  const hasStripeCustomer = Boolean(
    subscription?.stripeCustomerId &&
      !subscription.stripeCustomerId.startsWith("pending_")
  );

  const subscriptionSummary =
    isMonthlyPlan && subscription?.stripeSubscriptionId
      ? await getStripeSubscriptionSummary(subscription.stripeSubscriptionId)
      : null;

  if (
    subscription &&
    subscriptionSummary &&
    !subscriptionSummary.cancelAtPeriodEnd &&
    subscription.cancelAtPeriodEndAt
  ) {
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        cancelAtPeriodEndAt: null,
        cancelReasonCategory: null,
        cancelReasonDetail: null,
      },
    });
  }

  const monthlyRenewalCancelled =
    isMonthlyPlan &&
    (subscriptionSummary != null
      ? subscriptionSummary.cancelAtPeriodEnd
      : Boolean(subscription?.cancelAtPeriodEndAt));

  const documentUsageLogs = await prisma.documentUsageLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Account</h1>
      <p className="mt-2 text-slate-600">
        Signed in as{" "}
        <span className="font-medium text-slate-900">{session.user.email}</span>
      </p>

      {sp.success === "true" && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Thanks—your payment was received. It may take a moment to show below.
        </p>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Plan & usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-medium text-slate-900">Plan:</span>{" "}
            {isMonthlyPlan
              ? `Monthly (${PRICE_MONTHLY_DISPLAY}/month, up to ${PERSONAL_MONTHLY_DOC_LIMIT} documents per month)`
              : `Free (${FREE_MONTHLY_DOC_LIMIT} document per month included)`}
          </p>
          {monthlyRenewalCancelled && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
              <span className="font-medium">Renewal cancelled.</span> You still
              have Monthly plan benefits for the rest of this billing period
              {subscriptionSummary?.currentPeriodEndIso
                ? ` (through ${formatFriendlyLocalDate(
                    subscriptionSummary.currentPeriodEndIso
                  )})`
                : ""}
              , including your monthly document allowance above. After that your
              plan becomes Free ({FREE_MONTHLY_DOC_LIMIT} included document per
              month). You will not be charged again for the Monthly plan.
            </p>
          )}
          <p>
            <span className="font-medium text-slate-900">
              Documents available this month:
            </span>{" "}
            {remaining > 100_000
              ? "Unlimited (limits off in this environment)"
              : isMonthlyPlan
                ? `${remaining} of ${PERSONAL_MONTHLY_DOC_LIMIT}`
                : remaining === 0
                  ? "0"
                  : remaining === 1 && used === 0
                    ? "1 (your included free document)"
                    : String(remaining)}
          </p>
          <p>
            <span className="font-medium text-slate-900">
              Documents used this month:
            </span>{" "}
            {used}
            {` / ${limit}`}
          </p>
          {!isMonthlyPlan && (
            <p>
              <span className="font-medium text-slate-900">
                Prepaid document credits:
              </span>{" "}
              {prepaid} (each credit covers one document after your free monthly
              one; buy more at {PRICE_PER_DOCUMENT_DISPLAY} each)
            </p>
          )}
          <Link
            href="/dashboard"
            className="inline-block pt-2 text-emerald-700 hover:underline"
          >
            Go to dashboard →
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Document usage history</CardTitle>
        </CardHeader>
        <CardContent>
          {documentUsageLogs.length === 0 ? (
            <p className="text-sm text-slate-600">
              No processed documents yet. Upload a file on the dashboard to see
              it listed here with the date and time.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 font-medium text-slate-900">
                      Date &amp; time (UTC)
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-900">
                      Document name
                    </th>
                    <th className="px-3 py-2 font-medium text-slate-900">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documentUsageLogs.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {formatProcessedAtUtc(row.createdAt)}
                      </td>
                      <td className="max-w-[280px] break-words px-3 py-2 text-slate-800">
                        {row.documentName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">
                        {flowLabel(row.flow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Each row is one billable document run (newest first). Timestamps are
            shown in UTC.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Upgrade or add documents</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionActions
            hasStripeCustomer={hasStripeCustomer}
            isMonthlyPlan={isMonthlyPlan}
            stripeSubscriptionId={subscription?.stripeSubscriptionId ?? null}
            subscriptionSummary={subscriptionSummary}
          />
        </CardContent>
      </Card>
    </>
  );
}
