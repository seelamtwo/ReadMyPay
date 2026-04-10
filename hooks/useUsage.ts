"use client";

import { useCallback, useEffect, useState } from "react";

export type UsageState = {
  tier: string;
  used: number;
  limit: number | null;
  /** Documents still available this month (free + prepaid on Free; monthly cap on Monthly plan). */
  remaining?: number;
  prepaidCredits?: number;
  freeMonthlyLimit?: number;
  personalMonthlyLimit?: number;
  /** Present when /api/usage succeeds. */
  canUse?: boolean;
};

export function useUsage() {
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usage", { credentials: "include" });
      if (!res.ok) {
        let msg = "Could not load usage";
        try {
          const err = (await res.json()) as { error?: string };
          if (typeof err?.error === "string" && err.error.trim()) {
            msg = err.error.trim();
          }
        } catch {
          /* ignore */
        }
        setError(msg);
        setUsage(null);
        return;
      }
      const data = (await res.json()) as UsageState;
      setUsage(data);
    } catch {
      setError("Could not load usage");
      setUsage(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { usage, loading, error, refresh };
}
