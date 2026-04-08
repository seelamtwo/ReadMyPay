import { isVercelProduction } from "@/lib/security-env";
import { isTurnstileBypassed } from "@/lib/turnstile-bypass";

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Verifies Cloudflare Turnstile token server-side.
 * If TURNSTILE_SECRET_KEY is set, the token is always verified with Cloudflare.
 * If the secret is missing: only **Vercel production** (VERCEL_ENV=production) rejects
 * with "not configured". Local `npm start` uses NODE_ENV=production but is not Vercel,
 * so missing secret skips verification (same as dev). Non-Vercel hosts that need captcha
 * in production should set TURNSTILE_SECRET_KEY.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteip?: string | null
): Promise<{ ok: boolean; reason?: string }> {
  if (isTurnstileBypassed()) {
    return { ok: true };
  }
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    if (isVercelProduction()) {
      return { ok: false, reason: "Captcha is not configured on the server." };
    }
    return { ok: true };
  }
  if (!token?.trim()) {
    return { ok: false, reason: "Missing captcha token." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
  if (remoteip && remoteip !== "unknown") {
    body.set("remoteip", remoteip);
  }

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  const data = (await res.json()) as SiteverifyResponse;
  if (data.success === true) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: "Captcha verification failed. Refresh and try again.",
  };
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}
