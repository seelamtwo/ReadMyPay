"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useUsage, type UsageState } from "@/hooks/useUsage";

type DashboardUsageContextValue = {
  usage: UsageState | null;
  loading: boolean;
  error: string | null;
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
};

const DashboardUsageContext = createContext<DashboardUsageContextValue | null>(
  null
);

export function DashboardUsageProvider({ children }: { children: ReactNode }) {
  const { usage, loading, error, refresh } = useUsage();
  const value = useMemo(
    () => ({ usage, loading, error, refresh }),
    [usage, loading, error, refresh]
  );
  return (
    <DashboardUsageContext.Provider value={value}>
      {children}
    </DashboardUsageContext.Provider>
  );
}

export function useDashboardUsage(): DashboardUsageContextValue {
  const ctx = useContext(DashboardUsageContext);
  if (!ctx) {
    throw new Error(
      "useDashboardUsage must be used within DashboardUsageProvider"
    );
  }
  return ctx;
}
