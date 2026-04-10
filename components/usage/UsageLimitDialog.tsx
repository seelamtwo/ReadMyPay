"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PRICE_MONTHLY_DISPLAY,
  PRICE_PER_DOCUMENT_DISPLAY,
} from "@/lib/pricing";
import type {
  PendingExplainPayload,
  PendingSpendingPayload,
} from "@/lib/pending-upload";
import {
  savePendingExplain,
  savePendingSpending,
} from "@/lib/pending-upload";

type Props = {
  open: boolean;
  onClose: () => void;
  flow: "explain" | "spending";
  pendingExplain: PendingExplainPayload | null;
  pendingSpending: PendingSpendingPayload | null;
};

export function UsageLimitDialog({
  open,
  onClose,
  flow,
  pendingExplain,
  pendingSpending,
}: Props) {
  const [loading, setLoading] = useState<"monthly" | "doc" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sizeHint, setSizeHint] = useState<string | null>(null);

  if (!open) return null;

  const priceMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL?.trim();
  const pricePerDoc =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PER_DOCUMENT?.trim();

  async function startCheckout(mode: "subscription" | "payment") {
    setError(null);
    const priceId =
      mode === "subscription" ? priceMonthly : pricePerDoc;
    if (!priceId) {
      setError("Stripe prices are not configured.");
      return;
    }

    setSizeHint(null);
    if (flow === "explain" && pendingExplain) {
      const saved = savePendingExplain(pendingExplain);
      if (!saved.ok && saved.oversized) {
        setSizeHint(
          "This upload is too large to keep in the browser during checkout. After paying, upload the same file again — your credit will apply."
        );
      }
    } else if (flow === "spending" && pendingSpending) {
      const saved = savePendingSpending(pendingSpending);
      if (!saved.ok && saved.oversized) {
        setSizeHint(
          "These files are too large to keep during checkout. After paying, upload again — your credit will apply."
        );
      }
    }

    const successPath =
      flow === "explain"
        ? "/dashboard?tab=explain&resume=1&paid=1"
        : "/dashboard?tab=spending&resume=1&paid=1";
    const cancelPath =
      flow === "explain"
        ? "/dashboard?tab=explain&cancelled=1"
        : "/dashboard?tab=spending&cancelled=1";

    setLoading(mode === "subscription" ? "monthly" : "doc");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceId,
          mode,
          successPath,
          cancelPath,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Checkout could not start.");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="usage-limit-title"
    >
      <Card className="max-w-md border-emerald-200 shadow-xl">
        <CardHeader className="rounded-t-lg border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-white">
          <CardTitle id="usage-limit-title" className="text-lg text-slate-900">
            Free usage complete
          </CardTitle>
          <CardDescription className="text-slate-600">
            You&apos;ve used your included free document for this month. To
            continue, either pay {PRICE_PER_DOCUMENT_DISPLAY} for one document
            or subscribe for {PRICE_MONTHLY_DISPLAY}/month (up to 20 documents
            per month).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {sizeHint && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {sizeHint}
            </p>
          )}
          <p className="text-sm text-slate-600">
            {pricePerDoc ? (
              <>
                <span className="font-medium text-slate-800">Per document:</span>{" "}
                Secure checkout with Stripe — after payment we&apos;ll continue
                with this upload when possible.
              </>
            ) : null}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={loading !== null || !pricePerDoc}
              onClick={() => startCheckout("payment")}
            >
              {loading === "doc"
                ? "Opening checkout…"
                : `Pay ${PRICE_PER_DOCUMENT_DISPLAY} — one document`}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-emerald-200"
              disabled={loading !== null || !priceMonthly}
              onClick={() => startCheckout("subscription")}
            >
              {loading === "monthly"
                ? "Opening checkout…"
                : `Subscribe ${PRICE_MONTHLY_DISPLAY}/mo`}
            </Button>
          </div>
          <div className="flex justify-between gap-2 border-t border-slate-100 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Not now
            </Button>
            <a
              href="/account"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Account &amp; usage →
            </a>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
