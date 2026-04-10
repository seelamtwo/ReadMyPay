type UsageLike = {
  tier: string;
  used: number;
  remaining?: number;
  prepaidCredits?: number;
  freeMonthlyLimit?: number;
  personalMonthlyLimit?: number;
};

/** Server and client must match lib/usage canProcessDocument rules. */
export function clientCanProcessUsage(u: UsageLike): boolean {
  if (typeof u.remaining === "number") {
    return u.remaining > 0;
  }
  const tier = u.tier;
  const used = u.used ?? 0;
  const prepaid = u.prepaidCredits ?? 0;
  const freeL = u.freeMonthlyLimit ?? 1;
  const personalL = u.personalMonthlyLimit ?? 20;
  if (tier === "PERSONAL") {
    return used < personalL;
  }
  if (used < freeL) return true;
  return prepaid > 0;
}

/**
 * After Stripe redirect, apply prepaid credit or monthly subscription from
 * Checkout `session_id` so the user does not depend on webhook latency.
 * Safe to call without an id (no-op).
 */
export async function syncStripeCheckoutAfterRedirect(
  checkoutSessionId: string | null | undefined
): Promise<void> {
  const id = checkoutSessionId?.trim();
  if (!id || !id.startsWith("cs_")) return;
  try {
    await fetch("/api/stripe/sync-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId: id }),
    });
  } catch {
    /* usage poll may still succeed after webhook */
  }
}

/**
 * After Stripe redirect, webhook may lag — poll until quota allows processing.
 */
export async function waitUntilCanProcessDocument(
  maxWaitMs = 60000,
  intervalMs = 500
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch("/api/usage", { credentials: "include" });
      if (res.ok) {
        const u = (await res.json()) as UsageLike & { canUse?: boolean };
        if (typeof u.canUse === "boolean") {
          if (u.canUse) return true;
        } else if (clientCanProcessUsage(u)) {
          return true;
        }
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
