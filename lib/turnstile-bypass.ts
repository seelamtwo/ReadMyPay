/**
 * When true, Turnstile is not required client-side and verifyTurnstileToken() succeeds without a token.
 * - `next dev` (NODE_ENV=development): always bypass so localhost works without Cloudflare.
 * - `NEXT_PUBLIC_TURNSTILE_BYPASS_LOCAL`: use for `npm start` when challenges.cloudflare.com is blocked.
 * Never set the bypass env on Vercel production.
 */
export function isTurnstileBypassed(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const b = process.env.NEXT_PUBLIC_TURNSTILE_BYPASS_LOCAL?.trim().toLowerCase();
  return b === "true" || b === "1";
}
