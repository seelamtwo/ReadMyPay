/** True on Vercel production deployment. */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/** Production-like runtime (Vercel prod or Node production without Vercel). */
export function isProductionLike(): boolean {
  if (isVercelProduction()) return true;
  if (process.env.VERCEL) return false;
  return process.env.NODE_ENV === "production";
}

/** Server-only secrets must never use NEXT_PUBLIC_ — audit helper. */
export const SERVER_ONLY_ENV_HINTS = [
  "OPENAI_API_KEY",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "TURNSTILE_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CRON_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_EMAILS",
] as const;
