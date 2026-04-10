import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { isProductionLike } from "@/lib/security-env";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

function makeLimiter(prefix: string, requests: number, window: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"s" | "m" | "h" | "d"}`),
    prefix: `readmypay:${prefix}`,
  });
}

/** Register: 5 / hour / IP */
export const registerLimiter = makeLimiter("register", 5, "1 h");
/** Forgot password: 5 / hour / IP */
export const forgotPasswordLimiter = makeLimiter("forgot", 5, "1 h");
/** Credential sign-in: 30 / 15 min / IP */
export const loginLimiter = makeLimiter("login", 30, "15 m");
/** Resend verification email: 5 / hour / IP */
export const resendVerificationLimiter = makeLimiter("resend-verify", 5, "1 h");
/** Signed-in support contact form: 5 / hour / user */
export const contactFormLimiter = makeLimiter("contact-form", 5, "1 h");
/** Admin mutations (refund, usage, credits): 60 / hour / admin user */
export const adminMutationLimiter = makeLimiter("admin-mutation", 60, "1 h");

export async function rateLimitOr429(
  limiter: Ratelimit | null,
  key: string
): Promise<Response | null> {
  if (!limiter) {
    if (isProductionLike()) {
      console.warn(
        "[security] Upstash Redis not configured — rate limits inactive. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
      );
    }
    return null;
  }
  let success: boolean;
  let reset: number;
  try {
    const out = await limiter.limit(key);
    success = out.success;
    reset = out.reset;
  } catch (e) {
    console.error("[security] Upstash rate limit request failed", e);
    return null;
  }
  if (success) return null;
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return new Response(
    JSON.stringify({
      error: "Too many requests. Try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

export { getClientIpFromHeaders } from "@/lib/client-ip";
