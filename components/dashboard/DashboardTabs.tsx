"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UploadZone } from "@/components/upload/UploadZone";
import { SpendingUploadZone } from "@/components/spending/SpendingUploadZone";
import { TrustBanner } from "@/components/trust/TrustBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardUsageProvider } from "@/components/dashboard/DashboardUsageProvider";
import { UsageBadge } from "@/components/dashboard/UsageBadge";
import { cn } from "@/lib/utils";

type Tab = "explain" | "spending";

export function DashboardTabs() {
  const [tab, setTab] = useState<Tab>("explain");
  const [resumeExplain, setResumeExplain] = useState(0);
  const [resumeSpend, setResumeSpend] = useState(0);
  const [stripeCheckoutSessionId, setStripeCheckoutSessionId] = useState<
    string | null
  >(null);
  const clearStripeCheckoutSessionId = useCallback(
    () => setStripeCheckoutSessionId(null),
    []
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "explain" || t === "spending") {
      setTab(t);
    }
    const resume = searchParams.get("resume") === "1";
    const paid = searchParams.get("paid") === "1";
    const sid = searchParams.get("session_id");
    if (resume && paid && sid) {
      setStripeCheckoutSessionId(sid);
    }
    if (resume && paid) {
      if (t === "spending") {
        setResumeSpend((n) => n + 1);
      } else {
        setResumeExplain((n) => n + 1);
      }
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <DashboardUsageProvider>
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Explain documents or analyze spending from bank statements.
          </p>
        </div>
        <UsageBadge />
      </div>

      <TrustBanner />

      <div className="mt-6 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:inline-flex">
        <button
          type="button"
          onClick={() => setTab("explain")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "explain"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          Explain document
        </button>
        <button
          type="button"
          onClick={() => setTab("spending")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "spending"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          Spending summary
        </button>
      </div>

      {tab === "explain" ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              One file at a time — plain-English explanation with tips.
            </p>
            <UploadZone
              resumeNonce={resumeExplain}
              stripeCheckoutSessionId={stripeCheckoutSessionId}
              onStripeResumeConsumed={clearStripeCheckoutSessionId}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bank & card statements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Upload one bank or card statement per run. We extract transactions,
              group spending by category, and show totals plus a pie chart. Each
              analysis counts as one document toward your monthly limit.
            </p>
            <SpendingUploadZone
              resumeNonce={resumeSpend}
              stripeCheckoutSessionId={stripeCheckoutSessionId}
              onStripeResumeConsumed={clearStripeCheckoutSessionId}
            />
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardUsageProvider>
  );
}
