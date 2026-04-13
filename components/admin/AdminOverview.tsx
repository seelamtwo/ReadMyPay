import { AdminCleanupUnverifiedPanel } from "@/components/admin/AdminCleanupUnverifiedPanel";
import { AdminOperationsPanel } from "@/components/admin/AdminOperationsPanel";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardStats } from "@/lib/admin-stats";
import type { AdminUserTableRow } from "@/lib/admin-users";

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

type Props = {
  stats: AdminDashboardStats;
  adminUsers: AdminUserTableRow[];
};

export function AdminOverview({ stats, adminUsers }: Props) {
  return (
    <>
      <p className="text-sm text-slate-600">
        Users, subscriptions, and Stripe charges for the current month (UTC).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">
              {stats.userCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Rows in User table</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">
              {stats.subscriptionCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Subscription records (includes free tier rows)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-slate-900">
              {stats.personalTierCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Subscriptions on the Monthly plan (PERSONAL tier)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gross charges (Stripe)</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats.stripeConfigured ? (
              <p className="text-sm text-amber-800">
                Stripe is not configured (missing STRIPE_SECRET_KEY).
              </p>
            ) : stats.revenueError ? (
              <p className="text-sm text-red-700">{stats.revenueError}</p>
            ) : stats.monthGrossCents !== null ? (
              <>
                <p className="text-3xl font-semibold tabular-nums text-slate-900">
                  {formatUsd(stats.monthGrossCents)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Succeeded charges in {stats.monthLabel}. Gross before Stripe
                  fees; use Stripe Dashboard for net and reconciliation.
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <AdminUsersTable initialUsers={adminUsers} />

      <AdminCleanupUnverifiedPanel />

      <AdminOperationsPanel />
    </>
  );
}
