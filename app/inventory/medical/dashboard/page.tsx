"use client";

import { AlertTriangle, CalendarClock, Pill, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getMedicalExpiryStatus } from "@/components/medical/MedicalExpiryBadge";

export default function MedicalDashboardPage() {
  const { medicines, customers, sales } = useMedicalData();

  const lowStockCount = medicines.filter((m) => m.stockQty <= m.reorderLevel).length;
  const expiringCount = medicines.filter((m) => getMedicalExpiryStatus(m.expiryDate) !== "healthy").length;
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
      <PageHeader title="Medical Dashboard" description="Overview of your pharmacy inventory" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Medicines" value={String(medicines.length)} icon={Pill} />
        <StatCard label="Total Customers" value={String(customers.length)} icon={Receipt} />
        <StatCard
          label="Revenue (completed)"
          value={`$${totalRevenue.toFixed(2)}`}
          delta="+6.4% vs last week"
          trend="up"
          icon={Receipt}
        />
        <StatCard
          label="Low Stock Medicines"
          value={String(lowStockCount)}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          trend={lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Expiring / Expired"
          value={String(expiringCount)}
          delta={expiringCount > 0 ? "Review batches" : "All healthy"}
          trend={expiringCount > 0 ? "down" : "up"}
          icon={CalendarClock}
        />
      </div>

      <div className="mt-6">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
      </div>
    </div>
  );
}
