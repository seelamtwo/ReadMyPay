import type { Tier } from "@prisma/client";

const LIMITS: Record<Tier, number> = {
  FREE: 2,
  PERSONAL: 20,
};

export function docLimitForTier(tier: Tier | undefined): number {
  return LIMITS[tier ?? "FREE"];
}

export function isOverLimit(
  tier: Tier | undefined,
  used: number
): boolean {
  return used >= docLimitForTier(tier);
}

/** Bypass monthly doc counter (local testing). `FINCLEAR_DISABLE_USAGE_LIMIT` still works. */
export function isDocsUsageLimitDisabled(): boolean {
  const a = process.env.READMY_PAY_DISABLE_USAGE_LIMIT;
  const b = process.env.FINCLEAR_DISABLE_USAGE_LIMIT;
  return (
    a === "true" ||
    a === "1" ||
    b === "true" ||
    b === "1"
  );
}
