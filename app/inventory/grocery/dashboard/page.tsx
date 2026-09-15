"use client";

import { AlertTriangle, Boxes, Receipt, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";

export default function GroceryDashboardPage() {
  const { products, customers, sales } = useGroceryData();

  const lowStockCount = products.filter((p) => p.stockQty <= p.reorderLevel).length;
  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);

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
        <StatCard label="Total Products" value={String(products.length)} icon={Boxes} />
        <StatCard label="Total Customers" value={String(customers.length)} icon={Users} />
        <StatCard
          label="Revenue (completed)"
          value={`$${totalRevenue.toFixed(2)}`}
          delta="+8.2% vs last week"
          trend="up"
          icon={Receipt}
        />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockCount)}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          trend={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-6">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
      </div>
    </div>
  );
}
