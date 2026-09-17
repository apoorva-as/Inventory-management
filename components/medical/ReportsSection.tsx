"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, ClipboardList, DollarSign, Pill, Receipt, ShoppingCart } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { FilterBar } from "@/components/shared/FilterBar";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getBatchExpiryStatus, getMedicineTotalStock, isLowStock } from "@/lib/utils/medicalStock";
import { formatCurrency } from "@/lib/utils/formatters";

type StockFilter = "all" | "in-stock" | "low" | "out";
type RxFilter = "all" | "required" | "otc";

function isInDateRange(date: string, start: string, end: string): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function ReportsSection() {
  const { medicines, batches, categories, manufacturers, purchases, sales, prescriptions } = useMedicalData();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [rxFilter, setRxFilter] = useState<RxFilter>("all");

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setManufacturerFilter("");
    setStockFilter("all");
    setRxFilter("all");
  }

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesCategory = !categoryFilter || m.categoryId === categoryFilter;
      const matchesManufacturer = !manufacturerFilter || m.manufacturerId === manufacturerFilter;
      const stock = getMedicineTotalStock(batches, m.id);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out" && stock === 0) ||
        (stockFilter === "low" && stock > 0 && isLowStock(stock, m.minimumStock)) ||
        (stockFilter === "in-stock" && stock > 0 && !isLowStock(stock, m.minimumStock));
      const matchesRx =
        rxFilter === "all" ||
        (rxFilter === "required" && m.prescriptionRequired) ||
        (rxFilter === "otc" && !m.prescriptionRequired);
      return matchesCategory && matchesManufacturer && matchesStock && matchesRx;
    });
  }, [medicines, batches, categoryFilter, manufacturerFilter, stockFilter, rxFilter]);

  const filteredMedicineIds = useMemo(() => new Set(filteredMedicines.map((m) => m.id)), [filteredMedicines]);

  const filteredBatches = useMemo(
    () => batches.filter((b) => filteredMedicineIds.has(b.medicineId)),
    [batches, filteredMedicineIds],
  );

  const filteredSales = useMemo(
    () => sales.filter((s) => isInDateRange(s.date, dateFrom, dateTo)),
    [sales, dateFrom, dateTo],
  );

  const filteredPurchases = useMemo(
    () => purchases.filter((p) => isInDateRange(p.date, dateFrom, dateTo)),
    [purchases, dateFrom, dateTo],
  );

  const filteredPrescriptions = useMemo(
    () => prescriptions.filter((p) => isInDateRange(p.date, dateFrom, dateTo)),
    [prescriptions, dateFrom, dateTo],
  );

  const stockValue = filteredMedicines.reduce(
    (sum, m) => sum + getMedicineTotalStock(batches, m.id) * m.purchasePrice,
    0,
  );
  const lowStockCount = filteredMedicines.filter((m) =>
    isLowStock(getMedicineTotalStock(batches, m.id), m.minimumStock),
  ).length;
  const expiredCount = filteredBatches.filter((b) => b.quantity > 0 && getBatchExpiryStatus(b) === "expired").length;
  const expiringCount = filteredBatches.filter(
    (b) => b.quantity > 0 && getBatchExpiryStatus(b) === "expiring",
  ).length;
  const rxRequiredCount = filteredMedicines.filter((m) => m.prescriptionRequired).length;

  const completedSalesTotal = filteredSales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.total, 0);
  const completedPurchasesTotal = filteredPurchases
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.total, 0);

  const salesByDate = Object.entries(
    filteredSales
      .filter((s) => s.status !== "cancelled")
      .reduce<Record<string, number>>((acc, s) => {
        acc[s.date] = (acc[s.date] ?? 0) + s.total;
        return acc;
      }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label: label.slice(5), value: Number(value.toFixed(2)) }));

  const categoryBreakdown = categories
    .map((c) => ({
      label: c.name,
      value: Number(
        filteredMedicines
          .filter((m) => m.categoryId === c.id)
          .reduce((sum, m) => sum + getMedicineTotalStock(batches, m.id) * m.purchasePrice, 0)
          .toFixed(2),
      ),
    }))
    .filter((c) => c.value > 0);

  return (
    <div>
      <FilterBar onClear={resetFilters}>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
          aria-label="From date"
        />
        <span className="text-sm text-muted">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
          aria-label="To date"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Manufacturers</option>
          {manufacturers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select
          value={rxFilter}
          onChange={(e) => setRxFilter(e.target.value as RxFilter)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Medicines</option>
          <option value="required">Prescription Required</option>
          <option value="otc">Over-the-Counter</option>
        </select>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Medicines in Scope" value={String(filteredMedicines.length)} icon={Pill} />
        <StatCard label="Stock Value" value={formatCurrency(stockValue)} icon={DollarSign} />
        <StatCard
          label="Low Stock Medicines"
          value={String(lowStockCount)}
          trend={lowStockCount > 0 ? "down" : "up"}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Expired Batches"
          value={String(expiredCount)}
          trend={expiredCount > 0 ? "down" : "up"}
          icon={CalendarClock}
        />
        <StatCard
          label="Expiring Soon"
          value={String(expiringCount)}
          trend={expiringCount > 0 ? "down" : "up"}
          icon={CalendarClock}
        />
        <StatCard label="Prescription-Required" value={String(rxRequiredCount)} icon={ClipboardList} />
        <StatCard
          label="Sales Revenue (completed)"
          value={formatCurrency(completedSalesTotal)}
          delta={`${filteredSales.length} sale(s) in range`}
          trend="up"
          icon={Receipt}
        />
        <StatCard
          label="Purchase Spend (completed)"
          value={formatCurrency(completedPurchasesTotal)}
          delta={`${filteredPurchases.length} purchase(s) in range`}
          trend="flat"
          icon={ShoppingCart}
        />
        <StatCard
          label="Prescriptions in Range"
          value={String(filteredPrescriptions.length)}
          delta={`${filteredPrescriptions.filter((p) => p.status === "pending").length} pending`}
          trend="flat"
          icon={ClipboardList}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
        <ChartWrapper title="Stock Value by Category" data={categoryBreakdown} />
      </div>
    </div>
  );
}
