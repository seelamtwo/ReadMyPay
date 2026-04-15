"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Props = { measurementId: string };

/**
 * GA4 only records the first full page load via the inline gtag config. Next.js App Router
 * navigations are client-side, so we send an updated `config` with `page_path` on each route
 * change (skipping the first run to avoid double-counting the landing page).
 */
export function GoogleAnalyticsPageView({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    const search = searchParams?.toString();
    const pagePath =
      pathname + (search ? `?${search}` : "") || "/";

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    if (typeof window.gtag !== "function") return;

    window.gtag("config", measurementId, {
      page_path: pagePath,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}
