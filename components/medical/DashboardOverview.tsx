"use client";

import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  IndianRupee,
  Pill,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import {
  getExpiringOrExpiredBatches,
  getMedicineTotalStock,
  isLowStock,
} from "@/lib/utils/medicalStock";
import { formatCurrency } from "@/lib/utils/formatters";

export function DashboardOverview() {
  const { medicines, batches, customers, sales, purchases, prescriptions, purchaseOrders } = useMedicalData();

  const totalStockUnits = medicines.reduce((sum, m) => sum + getMedicineTotalStock(batches, m.id), 0);
  const inventoryValue = medicines.reduce(
    (sum, m) => sum + getMedicineTotalStock(batches, m.id) * m.purchasePrice,
    0,
  );
  const lowStockCount = medicines.filter((m) => isLowStock(getMedicineTotalStock(batches, m.id), m.minimumStock))
    .length;
  const expiringBatchCount = getExpiringOrExpiredBatches(batches).length;

  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);
  const completedPurchases = purchases.filter((p) => p.status === "completed");
  const purchaseSpend = completedPurchases.reduce((sum, p) => sum + p.total, 0);

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "pending").length;
  const pendingPurchaseOrders = purchaseOrders.filter(
    (po) => po.status === "draft" || po.status === "pending",
  ).length;

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Medicines"
          value={String(medicines.length)}
          icon={Pill}
          href="/inventory/medical/medicines"
        />
        <StatCard
          label="Total Stock Units"
          value={String(totalStockUnits)}
          icon={ShoppingCart}
          href="/inventory/medical/inventory"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={IndianRupee}
          href="/inventory/medical/inventory"
        />
        <StatCard
          label="Total Customers"
          value={String(customers.length)}
          icon={Users}
          href="/inventory/medical/customers"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (completed)"
          value={formatCurrency(totalRevenue)}
          trend="up"
          icon={IndianRupee}
          href="/inventory/medical/sales"
        />
        <StatCard
          label="Purchase Spend (completed)"
          value={formatCurrency(purchaseSpend)}
          trend="flat"
          icon={Truck}
          href="/inventory/medical/purchases"
        />
        <StatCard
          label="Low Stock Medicines"
          value={String(lowStockCount)}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          trend={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
          href="/inventory/medical/low-stock"
        />
        <StatCard
          label="Expiring / Expired Batches"
          value={String(expiringBatchCount)}
          delta={expiringBatchCount > 0 ? "Review batches" : "All healthy"}
          trend={expiringBatchCount > 0 ? "down" : "up"}
          icon={CalendarClock}
          href="/inventory/medical/expiry"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Prescriptions"
          value={String(pendingPrescriptions)}
          trend={pendingPrescriptions > 0 ? "down" : "up"}
          icon={ClipboardList}
          href="/inventory/medical/prescriptions"
        />
        <StatCard
          label="Pending Purchase Orders"
          value={String(pendingPurchaseOrders)}
          trend={pendingPurchaseOrders > 0 ? "down" : "up"}
          icon={ShoppingCart}
          href="/inventory/medical/purchases?tab=purchase-orders"
        />
      </div>

      <div className="mt-6">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
      </div>
    </div>
  );
}
