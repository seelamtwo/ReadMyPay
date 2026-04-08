import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export const metadata = {
  title: "Dashboard | Read My Pay",
  description:
    "Explain financial documents or analyze spending from bank statements.",
};

export default function DashboardPage() {
  return <DashboardTabs />;
}
