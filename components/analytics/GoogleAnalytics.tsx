import Script from "next/script";
import { getGaMeasurementId } from "@/lib/ga-measurement-id";

/**
 * Google Analytics 4 (gtag). Set `GA_MEASUREMENT_ID` or `NEXT_PUBLIC_GA_MEASUREMENT_ID`
 * (e.g. G-XXXXXXXXXX). See `.env.example`.
 *
 * Uses `beforeInteractive` for the loader so the tag appears in the initial document early
 * (helps Google’s “tag detected” checks and Search Console verification).
 */
export function GoogleAnalytics() {
  const id = getGaMeasurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="beforeInteractive"
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
