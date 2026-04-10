"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Refetch on focus keeps multiple tabs aligned after login/logout in another tab.
 * Interval is a light backup (seconds); 0 would disable periodic refetch.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={120}>
      {children}
    </SessionProvider>
  );
}
