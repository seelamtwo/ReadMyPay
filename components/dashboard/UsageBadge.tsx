"use client";

import { useDashboardUsage } from "@/components/dashboard/DashboardUsageProvider";

function formatUsageLine(usage: {
  tier: string;
  used: number;
  limit: number | null;
  remaining?: number;
  personalMonthlyLimit?: number;
}): string {
  const remaining =
    typeof usage.remaining === "number" ? usage.remaining : null;
  const personalCap =
    typeof usage.personalMonthlyLimit === "number"
      ? usage.personalMonthlyLimit
      : typeof usage.limit === "number"
        ? usage.limit
        : 20;

  if (usage.tier === "PERSONAL" && remaining !== null) {
    return `${remaining} of ${personalCap} documents available this month`;
  }

  if (usage.tier === "FREE" && remaining !== null) {
    if (remaining === 0) {
      return "No documents available this month";
    }
    if (usage.used === 0 && remaining === 1) {
      return "1 free document available this month";
    }
    return `${remaining} documents available this month`;
  }

  if (usage.limit != null) {
    return `${usage.used} / ${usage.limit} documents used this month`;
  }

  return "Usage unavailable";
}

export function UsageBadge() {
  const { usage, loading, error } = useDashboardUsage();

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
        Loading usage…
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div
        className="max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950"
        role="status"
      >
        {error ?? "Usage unavailable."}{" "}
        {error?.includes("Verify your email") ? (
          <a href="/verify-email" className="font-medium underline">
            Verify email
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">
        {usage.tier === "PERSONAL" ? "Monthly" : "Free"}
      </span>
      <span className="text-slate-500"> · </span>
      <span>{formatUsageLine(usage)}</span>
    </div>
  );
}
