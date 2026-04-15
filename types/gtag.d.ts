/** Google tag (gtag.js) — set by components/analytics/GoogleAnalytics.tsx */
export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
