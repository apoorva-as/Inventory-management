"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs } from "@/components/shared/Tabs";
import { DashboardOverview } from "@/components/medical/DashboardOverview";
import { ReportsSection } from "@/components/medical/ReportsSection";
import { AnalyticsSection } from "@/components/medical/AnalyticsSection";
import { ImportExportSection } from "@/components/medical/ImportExportSection";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "reports", label: "Reports" },
  { value: "analytics", label: "Analytics" },
  { value: "import-export", label: "Import / Export" },
];

function DashboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  function handleTabChange(value: string) {
    router.replace(`/inventory/medical/dashboard?tab=${value}`);
  }

  return (
    <div>
      <PageHeader title="Medical Dashboard" description="Overview of your pharmacy inventory" />
      <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} />
      {activeTab === "reports" && <ReportsSection />}
      {activeTab === "analytics" && <AnalyticsSection />}
      {activeTab === "import-export" && <ImportExportSection />}
      {activeTab !== "reports" && activeTab !== "analytics" && activeTab !== "import-export" && (
        <DashboardOverview />
      )}
    </div>
  );
}

export default function MedicalDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardTabs />
    </Suspense>
  );
}
