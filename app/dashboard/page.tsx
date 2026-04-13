import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Explain documents or upload bank statements for spending categories—your Read My Pay dashboard for signed-in users.",
  robots: noIndexFollow,
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
