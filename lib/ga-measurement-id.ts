/**
 * GA4 measurement ID for gtag. Prefer `GA_MEASUREMENT_ID` (server, read at runtime)
 * or `NEXT_PUBLIC_GA_MEASUREMENT_ID`. If unset, uses the production property ID below
 * so the tag works without env (override via env for staging/other accounts).
 */
const GA_ID_RE = /^G-[A-Z0-9]+$/i;

/** Default GA4 property (public; safe to ship). Override with env when needed. */
const DEFAULT_GA_MEASUREMENT_ID = "G-1QVVVRK9NH";

export function getGaMeasurementId(): string | undefined {
  const fromServer = process.env.GA_MEASUREMENT_ID?.trim();
  const fromPublic = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const raw = fromServer || fromPublic || DEFAULT_GA_MEASUREMENT_ID;
  if (!GA_ID_RE.test(raw)) return undefined;
  return raw;
}
