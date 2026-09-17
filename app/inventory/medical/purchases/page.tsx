"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs } from "@/components/shared/Tabs";
import { PurchaseOrdersSection } from "@/components/medical/PurchaseOrdersSection";
import { PurchasesSection } from "@/components/medical/PurchasesSection";
import { PurchaseReturnsSection } from "@/components/medical/PurchaseReturnsSection";

const TABS = [
  { value: "purchase-orders", label: "Purchase Orders" },
  { value: "purchases", label: "Purchases" },
  { value: "purchase-returns", label: "Purchase Returns" },
];

function PurchasingTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "purchases";

  function handleTabChange(value: string) {
    router.replace(`/inventory/medical/purchases?tab=${value}`);
  }

  return (
    <div>
      <PageHeader title="Purchases" description="Purchase orders, purchases, and purchase returns" />
      <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} />
      {activeTab === "purchase-orders" && <PurchaseOrdersSection />}
      {activeTab === "purchase-returns" && <PurchaseReturnsSection />}
      {activeTab !== "purchase-orders" && activeTab !== "purchase-returns" && <PurchasesSection />}
    </div>
  );
}

export default function MedicalPurchasesPage() {
  return (
    <Suspense fallback={null}>
      <PurchasingTabs />
    </Suspense>
  );
}
