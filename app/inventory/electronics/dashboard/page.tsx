"use client";

import { AlertTriangle, Boxes, Package, Receipt, ShieldCheck, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { getWarrantyStatus } from "@/components/electronics/WarrantyBadge";

export default function ElectronicsDashboardPage() {
  const { products, customers, sales, purchases, categories, serials } = useElectronicsData();

  const totalStock = products.reduce((sum, p) => sum + p.stockQty, 0);
  const lowStockCount = products.filter((p) => p.stockQty <= p.reorderLevel).length;
  const expiringWarrantyCount = serials.filter((s) => getWarrantyStatus(s.warrantyExpiry) === "expiring").length;

  const completedSales = sales.filter((s) => s.status === "completed");
  const completedPurchases = purchases.filter((p) => p.status === "completed");
  const totalSales = completedSales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = completedPurchases.reduce((sum, p) => sum + p.total, 0);

  const stockByCategory = categories
    .map((c) => ({
      label: c.name,
      value: products.filter((p) => p.categoryId === c.id).reduce((sum, p) => sum + p.stockQty, 0),
    }))
    .filter((c) => c.value > 0);

  return (
    <div>
      <PageHeader title="Electronics Dashboard" description="Overview of your electronics inventory" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Products" value={String(products.length)} icon={Package} />
        <StatCard label="Total Stock" value={String(totalStock)} icon={Boxes} />
        <StatCard
          label="Low Stock Products"
          value={String(lowStockCount)}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          trend={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Warranty Expiring Soon"
          value={String(expiringWarrantyCount)}
          delta={expiringWarrantyCount > 0 ? "Review Warranty page" : "All healthy"}
          trend={expiringWarrantyCount > 0 ? "down" : "up"}
          icon={ShieldCheck}
        />
        <StatCard
          label="Sales Total (completed)"
          value={`$${totalSales.toFixed(2)}`}
          delta={`${completedSales.length} sale(s)`}
          trend="up"
          icon={Receipt}
        />
        <StatCard
          label="Purchase Total (completed)"
          value={`$${totalPurchases.toFixed(2)}`}
          delta={`${completedPurchases.length} purchase(s)`}
          trend="flat"
          icon={ShoppingCart}
        />
      </div>

      <p className="mt-4 text-sm text-muted">{customers.length} customers on file</p>

      <div className="mt-6">
        <ChartWrapper title="Stock by Category" data={stockByCategory} />
      </div>
    </div>
  );
}
