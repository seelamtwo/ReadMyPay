import { prisma } from "@/lib/db";

/** Credential signups awaiting link vs verified vs OAuth/legacy (no gate). */
export type AdminEmailVerificationStatus =
  | "verified"
  | "unverified"
  | "not_required";

export type AdminUserTableRow = {
  id: string;
  email: string;
  name: string | null;
  createdAtIso: string;
  /** Email verification state for password signups with `requiresEmailVerification`. */
  emailVerification: AdminEmailVerificationStatus;
  /** ISO timestamp when verified; null if never verified. */
  emailVerifiedAtIso: string | null;
  /** Monthly plan (PERSONAL tier) vs Free */
  planLabel: "Monthly" | "Free";
  prepaidDocCredits: number;
  docsUsedThisMonth: number;
  /** True when user has a real Stripe customer (refunds allowed). */
  canRefund: boolean;
};

/**
 * All users with subscription fields for the admin dashboard table.
 */
export async function getAdminUsersForTable(): Promise<AdminUserTableRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      emailVerified: true,
      requiresEmailVerification: true,
      subscription: {
        select: {
          tier: true,
          prepaidDocCredits: true,
          docsUsedThisMonth: true,
          stripeCustomerId: true,
        },
      },
    },
  });

  const rows: AdminUserTableRow[] = users.map((u) => {
    const sub = u.subscription;
    const tier = sub?.tier ?? "FREE";
    const stripeId = sub?.stripeCustomerId;
    const hasRealStripe =
      Boolean(stripeId) && !stripeId!.startsWith("pending_");

    let emailVerification: AdminEmailVerificationStatus;
    if (u.emailVerified) {
      emailVerification = "verified";
    } else if (u.requiresEmailVerification) {
      emailVerification = "unverified";
    } else {
      emailVerification = "not_required";
    }

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAtIso: u.createdAt.toISOString(),
      emailVerification,
      emailVerifiedAtIso: u.emailVerified
        ? u.emailVerified.toISOString()
        : null,
      planLabel: tier === "PERSONAL" ? "Monthly" : "Free",
      prepaidDocCredits: sub?.prepaidDocCredits ?? 0,
      docsUsedThisMonth: sub?.docsUsedThisMonth ?? 0,
      canRefund: hasRealStripe,
    };
  });

  rows.sort((a, b) => {
    const rank = (r: AdminUserTableRow) =>
      r.emailVerification === "unverified" ? 0 : 1;
    const d = rank(a) - rank(b);
    if (d !== 0) return d;
    return b.createdAtIso.localeCompare(a.createdAtIso);
  });

  return rows;
}
