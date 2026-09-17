"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs } from "@/components/shared/Tabs";
import { SalesSection } from "@/components/medical/SalesSection";
import { SalesReturnsSection } from "@/components/medical/SalesReturnsSection";

const TABS = [
  { value: "sales", label: "Sales" },
  { value: "sales-returns", label: "Sales Returns" },
];

function SalesTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "sales";

  function handleTabChange(value: string) {
    router.replace(`/inventory/medical/sales?tab=${value}`);
  }

  return (
    <div>
      <PageHeader title="Sales" description="Sales and sales returns" />
      <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} />
      {activeTab === "sales-returns" ? <SalesReturnsSection /> : <SalesSection />}
    </div>
  );
}

export default function MedicalSalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesTabs />
    </Suspense>
  );
}
