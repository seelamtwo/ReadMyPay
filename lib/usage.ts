import type { Tier } from "@prisma/client";
import { isVercelProduction } from "@/lib/security-env";
import {
  PRICE_MONTHLY_DISPLAY,
  PRICE_PER_DOCUMENT_DISPLAY,
} from "@/lib/pricing";

/** Free tier: one document per billing month without paying. */
export const FREE_MONTHLY_DOC_LIMIT = 1;

/** Monthly subscription (PERSONAL tier): documents per month. */
export const PERSONAL_MONTHLY_DOC_LIMIT = 20;

const LIMITS: Record<Tier, number> = {
  FREE: FREE_MONTHLY_DOC_LIMIT,
  PERSONAL: PERSONAL_MONTHLY_DOC_LIMIT,
};

export function docLimitForTier(tier: Tier | undefined): number {
  return LIMITS[tier ?? "FREE"];
}

/** Documents the user can still process this month (free slot + prepaid on FREE; monthly cap on PERSONAL). */
export function documentsAvailableRemaining(
  sub: {
    tier: Tier;
    docsUsedThisMonth: number;
    prepaidDocCredits: number;
  } | null
): number {
  if (isDocsUsageLimitDisabled()) return 999_999;
  const tier = sub?.tier ?? "FREE";
  const used = sub?.docsUsedThisMonth ?? 0;
  const credits = sub?.prepaidDocCredits ?? 0;
  if (tier === "PERSONAL") {
    return Math.max(0, PERSONAL_MONTHLY_DOC_LIMIT - used);
  }
  return Math.max(0, FREE_MONTHLY_DOC_LIMIT - used) + credits;
}

export function canProcessDocument(
  sub: {
    tier: Tier;
    docsUsedThisMonth: number;
    prepaidDocCredits: number;
  } | null
): boolean {
  if (isDocsUsageLimitDisabled()) return true;
  return documentsAvailableRemaining(sub) > 0;
}

export function isOverLimit(
  tier: Tier | undefined,
  used: number,
  prepaidCredits = 0
): boolean {
  if (isDocsUsageLimitDisabled()) return false;
  return !canProcessDocument({
    tier: tier ?? "FREE",
    docsUsedThisMonth: used,
    prepaidDocCredits: prepaidCredits,
  });
}

export function planLimitExceededMessage(): string {
  return `Read My Pay plan limit: the free tier includes ${FREE_MONTHLY_DOC_LIMIT} document per month. After that, buy additional documents (${PRICE_PER_DOCUMENT_DISPLAY} each) or subscribe (${PRICE_MONTHLY_DISPLAY}/month) from your account.`;
}

/**
 * Bypass monthly doc counter (local / preview only).
 * Always disabled on Vercel production. `FINCLEAR_DISABLE_USAGE_LIMIT` still honored off prod.
 */
export function isDocsUsageLimitDisabled(): boolean {
  if (isVercelProduction()) return false;
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    return false;
  }
  const a = process.env.READMY_PAY_DISABLE_USAGE_LIMIT;
  const b = process.env.FINCLEAR_DISABLE_USAGE_LIMIT;
  return (
    a === "true" ||
    a === "1" ||
    b === "true" ||
    b === "1"
  );
}
