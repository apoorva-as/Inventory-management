"use client";

import { useMemo } from "react";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getBatchExpiryStatus, getMedicineTotalStock } from "@/lib/utils/medicalStock";
import type { ChartPoint } from "@/lib/types/shared";

function toSortedPoints(map: Record<string, number>, limit?: number): ChartPoint[] {
  const points = Object.entries(map)
    .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
  return limit ? points.slice(0, limit) : points;
}

export function AnalyticsSection() {
  const { medicines, batches, categories, manufacturers, purchases, sales, prescriptions } = useMedicalData();

  const completedSales = useMemo(() => sales.filter((s) => s.status === "completed"), [sales]);
  const completedPurchases = useMemo(() => purchases.filter((p) => p.status === "completed"), [purchases]);

  const salesTrend = useMemo(
    () =>
      Object.entries(
        completedSales.reduce<Record<string, number>>((acc, s) => {
          acc[s.date] = (acc[s.date] ?? 0) + s.total;
          return acc;
        }, {}),
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label: label.slice(5), value: Number(value.toFixed(2)) })),
    [completedSales],
  );

  const purchaseSpendTrend = useMemo(
    () =>
      Object.entries(
        completedPurchases.reduce<Record<string, number>>((acc, p) => {
          acc[p.date] = (acc[p.date] ?? 0) + p.total;
          return acc;
        }, {}),
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label: label.slice(5), value: Number(value.toFixed(2)) })),
    [completedPurchases],
  );

  const topSellingMedicines = useMemo(() => {
    const revenueByMedicine: Record<string, number> = {};
    for (const sale of completedSales) {
      for (const item of sale.items) {
        revenueByMedicine[item.productName] =
          (revenueByMedicine[item.productName] ?? 0) + item.quantity * item.unitPrice;
      }
    }
    return toSortedPoints(revenueByMedicine, 8);
  }, [completedSales]);

  const categoryWiseSales = useMemo(() => {
    const categoryNameByMedicine = new Map(medicines.map((m) => [m.id, m.categoryId]));
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
    const revenueByCategory: Record<string, number> = {};
    for (const sale of completedSales) {
      for (const item of sale.items) {
        const categoryId = categoryNameByMedicine.get(item.productId);
        const label = categoryNameById.get(categoryId ?? "") ?? "Uncategorized";
        revenueByCategory[label] = (revenueByCategory[label] ?? 0) + item.quantity * item.unitPrice;
      }
    }
    return toSortedPoints(revenueByCategory);
  }, [completedSales, medicines, categories]);

  const manufacturerWiseSales = useMemo(() => {
    const manufacturerByMedicine = new Map(medicines.map((m) => [m.id, m.manufacturerId]));
    const manufacturerNameById = new Map(manufacturers.map((m) => [m.id, m.name]));
    const revenueByManufacturer: Record<string, number> = {};
    for (const sale of completedSales) {
      for (const item of sale.items) {
        const manufacturerId = manufacturerByMedicine.get(item.productId);
        const label = manufacturerNameById.get(manufacturerId ?? "") ?? "Unknown";
        revenueByManufacturer[label] = (revenueByManufacturer[label] ?? 0) + item.quantity * item.unitPrice;
      }
    }
    return toSortedPoints(revenueByManufacturer);
  }, [completedSales, medicines, manufacturers]);

  const inventoryValueByCategory = useMemo(() => {
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
    const valueByCategory: Record<string, number> = {};
    for (const medicine of medicines) {
      const value = getMedicineTotalStock(batches, medicine.id) * medicine.purchasePrice;
      if (value <= 0) continue;
      const label = categoryNameById.get(medicine.categoryId) ?? "Uncategorized";
      valueByCategory[label] = (valueByCategory[label] ?? 0) + value;
    }
    return toSortedPoints(valueByCategory);
  }, [medicines, batches, categories]);

  const expiryDistribution = useMemo(() => {
    const counts: Record<string, number> = { Healthy: 0, "Expiring Soon": 0, Expired: 0 };
    for (const batch of batches) {
      if (batch.quantity <= 0) continue;
      const status = getBatchExpiryStatus(batch);
      if (status === "expired") counts.Expired += 1;
      else if (status === "expiring") counts["Expiring Soon"] += 1;
      else counts.Healthy += 1;
    }
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [batches]);

  const prescriptionStats = useMemo(() => {
    const pending = prescriptions.filter((p) => p.status === "pending").length;
    const fulfilled = prescriptions.filter((p) => p.status === "fulfilled").length;
    return [
      { label: "Pending", value: pending },
      { label: "Fulfilled", value: fulfilled },
    ];
  }, [prescriptions]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartWrapper title="Sales Trend" data={salesTrend} type="line" />
      <ChartWrapper title="Purchase Spend Trend" data={purchaseSpendTrend} type="line" />
      <ChartWrapper title="Top-Selling Medicines (Revenue)" data={topSellingMedicines} />
      <ChartWrapper title="Category-wise Sales" data={categoryWiseSales} type="pie" />
      <ChartWrapper title="Manufacturer-wise Sales" data={manufacturerWiseSales} />
      <ChartWrapper title="Inventory Value by Category" data={inventoryValueByCategory} />
      <ChartWrapper title="Expiry Distribution" data={expiryDistribution} type="pie" />
      <ChartWrapper title="Prescription Status" data={prescriptionStats} type="pie" />
    </div>
  );
}
