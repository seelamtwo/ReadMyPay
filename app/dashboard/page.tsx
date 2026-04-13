import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { noIndexFollow } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Explain financial documents or analyze spending from bank statements.",
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
