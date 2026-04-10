import { Suspense } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export const metadata = {
  title: "Dashboard | Read My Pay",
  description:
    "Explain financial documents or analyze spending from bank statements.",
};

function DashboardFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Loading…</div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardTabs />
    </Suspense>
  );
}
