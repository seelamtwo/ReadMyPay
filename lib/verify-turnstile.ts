import { isProductionLike } from "@/lib/security-env";

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Verifies Cloudflare Turnstile token server-side.
 * In non-production-like environments, missing config allows requests (dev convenience).
 * In production, missing secret rejects verification.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteip?: string | null
): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    if (isProductionLike()) {
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
