/**
 * GA4 measurement ID for gtag. Prefer `GA_MEASUREMENT_ID` (server, read at runtime)
 * so production can pick up a new ID after redeploy without relying on NEXT_PUBLIC
 * being present at `next build`. Falls back to `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
 */
const GA_ID_RE = /^G-[A-Z0-9]+$/i;

export function getGaMeasurementId(): string | undefined {
  const fromServer = process.env.GA_MEASUREMENT_ID?.trim();
  const fromPublic = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const raw = fromServer || fromPublic;
  if (!raw || !GA_ID_RE.test(raw)) return undefined;
  return raw;
}
