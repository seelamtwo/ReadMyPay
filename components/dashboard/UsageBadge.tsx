"use client";

import { useUsage } from "@/hooks/useUsage";

export function UsageBadge() {
  const { usage, loading } = useUsage();

  if (loading || !usage) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
        Loading usage…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{usage.tier}</span>
      <span className="text-slate-500"> · </span>
      {usage.limit != null ? (
        <>
          {usage.used} / {usage.limit} documents this month
        </>
      ) : (
        <>Usage unavailable</>
      )}
    </div>
  );
}
