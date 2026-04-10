"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PRICE_MONTHLY_DISPLAY,
  PRICE_PER_DOCUMENT_DISPLAY,
} from "@/lib/pricing";
import type { StripeSubscriptionSummary } from "@/lib/stripe-subscription-summary";
import { CancelSubscriptionDialog } from "@/components/account/CancelSubscriptionDialog";

type Props = {
  /** Real Stripe customer id (not pending_*). */
  hasStripeCustomer: boolean;
  /** User is on paid Monthly plan (PERSONAL tier). */
  isMonthlyPlan: boolean;
  stripeSubscriptionId?: string | null;
  subscriptionSummary?: StripeSubscriptionSummary | null;
};

function formatPeriodEnd(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SubscriptionActions({
  hasStripeCustomer,
  isMonthlyPlan,
  stripeSubscriptionId = null,
  subscriptionSummary = null,
}: Props) {
  const [loading, setLoading] = useState<"monthly" | "doc" | "portal" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const priceMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL?.trim();
  const pricePerDoc =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PER_DOCUMENT?.trim();

  async function checkout(
    mode: "subscription" | "payment",
    priceId: string,
    key: "monthly" | "doc"
  ) {
    setError(null);
    setLoading(key);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId, mode }),
      });

      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError(
          res.ok
            ? "Unexpected response from server."
            : `Server error (${res.status}). Is Stripe configured?`
        );
        return;
      }

      if (!res.ok) {
        setError(data.error ?? `Checkout failed (${res.status}).`);
        return;
      }
      if (!data.url) {
        setError("No checkout URL returned.");
        return;
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error. Try again."
      );
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError("Unexpected response from server.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? `Could not open portal (${res.status}).`);
        return;
      }
      if (!data.url) {
        setError("No portal URL returned.");
        return;
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error. Try again."
      );
    } finally {
      setLoading(null);
    }
  }

  const missingMonthly = !priceMonthly;
  const missingPerDoc = !pricePerDoc;

  const statusBlocksCancel =
    subscriptionSummary &&
    subscriptionSummary.status !== "active" &&
    subscriptionSummary.status !== "trialing" &&
    subscriptionSummary.status !== "past_due";

  const canCancelInApp =
    isMonthlyPlan &&
    Boolean(stripeSubscriptionId) &&
    !statusBlocksCancel &&
    !subscriptionSummary?.cancelAtPeriodEnd;

  if (missingMonthly && missingPerDoc) {
    return (
      <div className="space-y-2 text-sm text-slate-600">
        <p>
          Add Stripe price IDs to{" "}
          <code className="rounded bg-slate-100 px-1">
            NEXT_PUBLIC_STRIPE_PRICE_PERSONAL
          </code>{" "}
          and{" "}
          <code className="rounded bg-slate-100 px-1">
            NEXT_PUBLIC_STRIPE_PRICE_PER_DOCUMENT
          </code>{" "}
          in <code className="rounded bg-slate-100 px-1">.env.local</code>, then
          run <code className="rounded bg-slate-100 px-1">npm run build</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!missingMonthly && (
          <Button
            type="button"
            variant={isMonthlyPlan ? "outline" : "default"}
            disabled={loading !== null}
            onClick={() => checkout("subscription", priceMonthly, "monthly")}
          >
            {loading === "monthly"
              ? "Redirecting…"
              : `Monthly ${PRICE_MONTHLY_DISPLAY}`}
          </Button>
        )}
        {!missingPerDoc && (
          <Button
            type="button"
            variant="outline"
            disabled={loading !== null}
            onClick={() => checkout("payment", pricePerDoc, "doc")}
          >
            {loading === "doc"
              ? "Redirecting…"
              : `One document ${PRICE_PER_DOCUMENT_DISPLAY}`}
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Per-document purchases add one credit to your account after payment.
        The monthly plan includes up to 20 documents per billing month.
      </p>

      {hasStripeCustomer && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-900">
            Subscription &amp; billing
          </p>

          {isMonthlyPlan && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">
                Monthly plan — {PRICE_MONTHLY_DISPLAY}/month
              </p>
              {subscriptionSummary ? (
                <p className="mt-1">
                  Current period ends{" "}
                  <span className="font-medium text-slate-900">
                    {formatPeriodEnd(subscriptionSummary.currentPeriodEndIso)}
                  </span>
                  .
                </p>
              ) : (
                <p className="mt-1 text-slate-600">
                  Billing period details will appear here when available.
                </p>
              )}
              {subscriptionSummary?.cancelAtPeriodEnd ? (
                <p className="mt-2 text-slate-600">
                  Cancellation is scheduled. You keep full access until{" "}
                  {formatPeriodEnd(subscriptionSummary.currentPeriodEndIso)} and
                  won&apos;t be charged again. You can update your payment method
                  below if needed.
                </p>
              ) : (
                <p className="mt-2 text-slate-600">
                  Cancel anytime here — you keep access until the end of the
                  billing period and won&apos;t be charged again. See{" "}
                  <a
                    href="/terms#refunds"
                    className="text-emerald-700 hover:underline"
                  >
                    refund policy
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          {canCancelInApp && (
            <Button
              type="button"
              variant="outline"
              className="mt-3 border-red-200 text-red-800 hover:bg-red-50"
              disabled={loading !== null}
              onClick={() => setCancelOpen(true)}
            >
              Cancel subscription
            </Button>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Need to change your card or view invoices?{" "}
            <button
              type="button"
              className="font-medium text-emerald-700 hover:underline disabled:opacity-50"
              disabled={loading !== null}
              onClick={() => void openPortal()}
            >
              {loading === "portal" ? "Opening Stripe…" : "Open billing portal"}
            </button>{" "}
            (opens Stripe for payment method and invoices — cancellation stays
            on this page.)
          </p>
        </div>
      )}

      <CancelSubscriptionDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
