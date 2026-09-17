"use client";

import { AlertTriangle, Boxes, CalendarClock, DollarSign, Receipt, Recycle, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { getExpiryStatus } from "@/lib/utils/expiry";
import { formatCurrency } from "@/lib/utils/formatters";

export default function GroceryDashboardPage() {
  const { products, customers, sales, purchases, adjustments } = useGroceryData();

  const lowStockCount = products.filter((p) => p.stockQty <= p.reorderLevel).length;
  const expiringCount = products.filter((p) => {
    const status = getExpiryStatus(p.expiryDate);
    return status === "expired" || status === "expiring";
  }).length;
  const inventoryValue = products.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalWastage = adjustments
    .filter((a) => a.type === "decrease" && (a.reason === "Damaged" || a.reason === "Wastage"))
    .reduce((sum, a) => sum + a.quantity, 0);
  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
  const completedPurchasesTotal = purchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.total, 0);

  const salesByDate = Object.entries(
    completedSales.reduce<Record<string, number>>((acc, s) => {
      acc[s.date] = (acc[s.date] ?? 0) + s.total;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label: label.slice(5), value: Number(value.toFixed(2)) }));

  return (
    <div>
      <PageHeader title="Grocery Dashboard" description="Overview of your grocery inventory" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={String(products.length)}
          icon={Boxes}
          href="/inventory/grocery/products"
        />
        <StatCard
          label="Total Stock Units"
          value={String(totalStockUnits)}
          icon={Boxes}
          href="/inventory/grocery/inventory"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={DollarSign}
          href="/inventory/grocery/inventory"
        />
        <StatCard
          label="Total Customers"
          value={String(customers.length)}
          icon={Users}
          href="/inventory/grocery/customers"
        />
        <StatCard
          label="Revenue (completed)"
          value={formatCurrency(totalRevenue)}
          delta={`${completedSales.length} sale(s)`}
          trend="up"
          icon={Receipt}
          href="/inventory/grocery/sales"
        />
        <StatCard
          label="Purchase Spend (completed)"
          value={formatCurrency(completedPurchasesTotal)}
          trend="flat"
          icon={Receipt}
          href="/inventory/grocery/purchases"
        />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockCount)}
          delta={lowStockCount > 0 ? "Needs attention · View list" : "All good"}
          trend={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
          href="/inventory/grocery/low-stock"
        />
        <StatCard
          label="Expiring / Expired"
          value={String(expiringCount)}
          trend={expiringCount > 0 ? "down" : "up"}
          icon={CalendarClock}
          href="/inventory/grocery/expiry"
        />
        <StatCard
          label="Total Wastage"
          value={String(totalWastage)}
          trend={totalWastage > 0 ? "down" : "flat"}
          icon={Recycle}
          href="/inventory/grocery/wastage"
        />
      </div>

      <div className="mt-6">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
      </div>
    </div>
  );
}
