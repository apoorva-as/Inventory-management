"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, CalendarClock, DollarSign, Receipt, Recycle, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { FilterBar } from "@/components/shared/FilterBar";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { getExpiryStatus } from "@/lib/utils/expiry";
import { formatCurrency } from "@/lib/utils/formatters";

type StockFilter = "all" | "in-stock" | "low" | "out";

function isInDateRange(date: string, start: string, end: string): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export default function GroceryReportsPage() {
  const { products, categories, brands, purchases, sales, adjustments } = useGroceryData();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setBrandFilter("");
    setStockFilter("all");
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out" && p.stockQty === 0) ||
        (stockFilter === "low" && p.stockQty > 0 && p.stockQty <= p.reorderLevel) ||
        (stockFilter === "in-stock" && p.stockQty > p.reorderLevel);
      return matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, categoryFilter, brandFilter, stockFilter]);

  const filteredSales = useMemo(
    () => sales.filter((s) => isInDateRange(s.date, dateFrom, dateTo)),
    [sales, dateFrom, dateTo],
  );

  const filteredPurchases = useMemo(
    () => purchases.filter((p) => isInDateRange(p.date, dateFrom, dateTo)),
    [purchases, dateFrom, dateTo],
  );

  const stockValue = filteredProducts.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);
  const lowStockCount = filteredProducts.filter((p) => p.stockQty <= p.reorderLevel).length;
  const expiringCount = filteredProducts.filter((p) => {
    const status = getExpiryStatus(p.expiryDate);
    return status === "expired" || status === "expiring";
  }).length;

  const filteredAdjustments = useMemo(
    () => adjustments.filter((a) => isInDateRange(a.date, dateFrom, dateTo)),
    [adjustments, dateFrom, dateTo],
  );

  const totalWastage = filteredAdjustments
    .filter((a) => a.type === "decrease" && (a.reason === "Damaged" || a.reason === "Wastage"))
    .reduce((sum, a) => sum + a.quantity, 0);

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
        filteredProducts
          .filter((p) => p.categoryId === c.id)
          .reduce((sum, p) => sum + p.stockQty * p.costPrice, 0)
          .toFixed(2),
      ),
    }))
    .filter((c) => c.value > 0);

  return (
    <div>
      <PageHeader title="Reports" description="Business performance across your grocery store" />

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
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
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
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Products in Scope" value={String(filteredProducts.length)} icon={Boxes} />
        <StatCard label="Stock Value" value={formatCurrency(stockValue)} icon={DollarSign} />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockCount)}
          trend={lowStockCount > 0 ? "down" : "up"}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Expiring / Expired"
          value={String(expiringCount)}
          trend={expiringCount > 0 ? "down" : "up"}
          icon={CalendarClock}
        />
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
          label="Units Wasted"
          value={String(totalWastage)}
          trend={totalWastage > 0 ? "down" : "flat"}
          icon={Recycle}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
        <ChartWrapper title="Stock Value by Category" data={categoryBreakdown} />
      </div>
    </div>
  );
}
