import { requireAdminSession } from "@/lib/require-admin";
import { getAdminDashboardStats } from "@/lib/admin-stats";
import { getAdminUsersForTable } from "@/lib/admin-users";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminTabs } from "@/components/admin/AdminTabs";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdminSession();
  const [stats, adminUsers] = await Promise.all([
    getAdminDashboardStats(),
    getAdminUsersForTable(),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage users, Stripe operations, and blog content.
      </p>

      <AdminTabs
        overview={
          <AdminOverview stats={stats} adminUsers={adminUsers} />
        }
      />
    </>
  );
}
