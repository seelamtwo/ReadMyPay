import Script from "next/script";
import { getGaMeasurementId } from "@/lib/ga-measurement-id";

/**
 * Google Analytics 4 (gtag). Measurement ID defaults in `lib/ga-measurement-id.ts`;
 * override with `GA_MEASUREMENT_ID` or `NEXT_PUBLIC_GA_MEASUREMENT_ID`. See `.env.example`.
 *
 * Rendered once from root layout `<head>` so every route gets a single tag.
 */
export function GoogleAnalytics() {
  const id = getGaMeasurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');
`}
      </Script>
    </>
  );
}
