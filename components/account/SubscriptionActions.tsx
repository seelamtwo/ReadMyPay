"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscriptionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL?.trim();

  async function checkout() {
    if (!priceId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId }),
      });

      const raw = await res.text();
      let data: { error?: string; url?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setError(
          res.ok
            ? "Unexpected response from server."
            : `Server error (${res.status}). Is Stripe configured? Run a fresh build after setting env vars.`
        );
        return;
      }

      if (!res.ok) {
        setError(data.error ?? `Checkout failed (${res.status}).`);
        return;
      }
      if (!data.url) {
        setError("No checkout URL returned. Check Stripe price ID and API key.");
        return;
      }
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Network error. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!priceId) {
    return (
      <div className="space-y-2 text-sm text-slate-600">
        <p>
          Add{" "}
          <code className="rounded bg-slate-100 px-1">
            NEXT_PUBLIC_STRIPE_PRICE_PERSONAL
          </code>{" "}
          to <code className="rounded bg-slate-100 px-1">.env.local</code> with
          your Stripe monthly price ID (e.g.{" "}
          <code className="text-xs">price_...</code>), then run{" "}
          <code className="rounded bg-slate-100 px-1">npm run build</code>{" "}
          again.
        </p>
        <p className="text-slate-500">
          You also need <code className="text-xs">STRIPE_SECRET_KEY</code> on the
          server.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={loading}
        onClick={() => checkout()}
      >
        {loading ? "Redirecting…" : "Monthly"}
      </Button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
