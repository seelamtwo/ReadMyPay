"use client";

import { useCallback, useEffect, useState } from "react";

export type UsageState = {
  tier: string;
  used: number;
  limit: number | null;
};

export function useUsage() {
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usage", { credentials: "include" });
      if (!res.ok) {
        setError("Could not load usage");
        setUsage(null);
        return;
      }
      const data = await res.json();
      setUsage(data);
    } catch {
      setError("Could not load usage");
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { usage, loading, error, refresh };
}
