import { prisma } from "@/lib/db";

export type AdminUserTableRow = {
  id: string;
  email: string;
  name: string | null;
  createdAtIso: string;
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

  return users.map((u) => {
    const sub = u.subscription;
    const tier = sub?.tier ?? "FREE";
    const stripeId = sub?.stripeCustomerId;
    const hasRealStripe =
      Boolean(stripeId) && !stripeId!.startsWith("pending_");

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAtIso: u.createdAt.toISOString(),
      planLabel: tier === "PERSONAL" ? "Monthly" : "Free",
      prepaidDocCredits: sub?.prepaidDocCredits ?? 0,
      docsUsedThisMonth: sub?.docsUsedThisMonth ?? 0,
      canRefund: hasRealStripe,
    };
  });
}
