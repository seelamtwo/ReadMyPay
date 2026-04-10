import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export type AdminDashboardStats = {
  userCount: number;
  subscriptionCount: number;
  personalTierCount: number;
  /** Current calendar month (UTC): gross succeeded Stripe charges, cents. */
  monthGrossCents: number | null;
  monthLabel: string;
  stripeConfigured: boolean;
  /** When Stripe is configured but listing charges failed */
  revenueError?: string;
};

function utcMonthRange(now = new Date()): {
  year: number;
  month: number;
  startSec: number;
  endSec: number;
  label: string;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const startSec = Math.floor(Date.UTC(year, month, 1) / 1000);
  const endSec = Math.floor(Date.UTC(year, month + 1, 1) / 1000);
  const label = `${year}-${String(month + 1).padStart(2, "0")} (UTC)`;
  return { year, month, startSec, endSec, label };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [userCount, subscriptionCount, personalTierCount] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { tier: "PERSONAL" } }),
  ]);

  const { startSec, endSec, label } = utcMonthRange();
  const stripe = getStripe();
  if (!stripe) {
    return {
      userCount,
      subscriptionCount,
      personalTierCount,
      monthGrossCents: null,
      monthLabel: label,
      stripeConfigured: false,
    };
  }

  let monthGrossCents = 0;
  try {
    for await (const charge of stripe.charges.list({
      created: { gte: startSec, lt: endSec },
      limit: 100,
    })) {
      if (charge.status === "succeeded" && charge.paid) {
        monthGrossCents += charge.amount;
      }
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not list Stripe charges.";
    return {
      userCount,
      subscriptionCount,
      personalTierCount,
      monthGrossCents: null,
      monthLabel: label,
      stripeConfigured: true,
      revenueError: message,
    };
  }

  return {
    userCount,
    subscriptionCount,
    personalTierCount,
    monthGrossCents,
    monthLabel: label,
    stripeConfigured: true,
  };
}
