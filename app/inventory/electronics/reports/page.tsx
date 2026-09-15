"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Undo2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { FilterBar } from "@/components/shared/FilterBar";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { getWarrantyStatus } from "@/components/electronics/WarrantyBadge";
import type { ElectronicsReturn } from "@/lib/types/electronics";

type StockFilter = "all" | "in-stock" | "low" | "out";
type WarrantyFilter = "all" | "active" | "expiring" | "expired" | "none";
type ReturnStatusFilter = "all" | ElectronicsReturn["status"];

function isInDateRange(date: string, start: string, end: string): boolean {
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export default function ElectronicsReportsPage() {
  const { products, categories, brands, models, purchases, sales, serials, returns } = useElectronicsData();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [warrantyFilter, setWarrantyFilter] = useState<WarrantyFilter>("all");
  const [returnStatusFilter, setReturnStatusFilter] = useState<ReturnStatusFilter>("all");

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setBrandFilter("");
    setStockFilter("all");
    setWarrantyFilter("all");
    setReturnStatusFilter("all");
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

  const filteredProductIds = useMemo(() => new Set(filteredProducts.map((p) => p.id)), [filteredProducts]);

  const filteredSales = useMemo(
    () => sales.filter((s) => isInDateRange(s.date, dateFrom, dateTo)),
    [sales, dateFrom, dateTo],
  );

  const filteredPurchases = useMemo(
    () => purchases.filter((p) => isInDateRange(p.date, dateFrom, dateTo)),
    [purchases, dateFrom, dateTo],
  );

  const filteredSerials = useMemo(() => {
    return serials.filter((s) => {
      const matchesProduct = filteredProductIds.has(s.productId);
      const matchesWarranty = warrantyFilter === "all" || getWarrantyStatus(s.warrantyExpiry) === warrantyFilter;
      return matchesProduct && matchesWarranty;
    });
  }, [serials, filteredProductIds, warrantyFilter]);

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchesDate = isInDateRange(r.date, dateFrom, dateTo);
      const matchesStatus = returnStatusFilter === "all" || r.status === returnStatusFilter;
      return matchesDate && matchesStatus;
    });
  }, [returns, dateFrom, dateTo, returnStatusFilter]);

  const stockValue = filteredProducts.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);
  const lowStockCount = filteredProducts.filter((p) => p.stockQty > 0 && p.stockQty <= p.reorderLevel).length;
  const activeWarrantyCount = serials.filter((s) => getWarrantyStatus(s.warrantyExpiry) === "active").length;
  const expiringWarrantyCount = serials.filter((s) => getWarrantyStatus(s.warrantyExpiry) === "expiring").length;

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

  const stockByCategory = categories
    .map((c) => ({
      label: c.name,
      value: filteredProducts.filter((p) => p.categoryId === c.id).reduce((sum, p) => sum + p.stockQty, 0),
    }))
    .filter((c) => c.value > 0);

  const salesByBrand = brands
    .map((b) => {
      const brandProductIds = new Set(products.filter((p) => p.brandId === b.id).map((p) => p.id));
      const value = filteredSales
        .filter((s) => s.status === "completed")
        .reduce(
          (sum, s) =>
            sum +
            s.items
              .filter((i) => brandProductIds.has(i.productId))
              .reduce((lineSum, i) => lineSum + i.quantity * i.unitPrice, 0),
          0,
        );
      return { label: b.name, value: Number(value.toFixed(2)) };
    })
    .filter((b) => b.value > 0);

  const returnsByReason = Object.entries(
    filteredReturns.reduce<Record<string, number>>((acc, r) => {
      acc[r.reason] = (acc[r.reason] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label: label.replace("_", " "), value }));

  return (
    <div>
      <PageHeader title="Reports" description="Business performance across your electronics catalog" />

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
        <select
          value={warrantyFilter}
          onChange={(e) => setWarrantyFilter(e.target.value as WarrantyFilter)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Warranty</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="none">No Warranty</option>
        </select>
        <select
          value={returnStatusFilter}
          onChange={(e) => setReturnStatusFilter(e.target.value as ReturnStatusFilter)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Return Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </FilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Products in Scope" value={String(filteredProducts.length)} icon={Package} />
        <StatCard label="Stock Value" value={`$${stockValue.toFixed(2)}`} icon={DollarSign} />
        <StatCard
          label="Low Stock Products"
          value={String(lowStockCount)}
          trend={lowStockCount > 0 ? "down" : "up"}
          delta={lowStockCount > 0 ? "Needs attention" : "All good"}
          icon={AlertTriangle}
        />
        <StatCard label="Active Warranties" value={String(activeWarrantyCount)} icon={ShieldCheck} />
        <StatCard
          label="Warranties Expiring Soon"
          value={String(expiringWarrantyCount)}
          trend={expiringWarrantyCount > 0 ? "down" : "up"}
          icon={ShieldCheck}
        />
        <StatCard
          label="Returns in Range"
          value={String(filteredReturns.length)}
          delta={`${filteredReturns.filter((r) => r.status === "pending").length} pending`}
          trend="flat"
          icon={Undo2}
        />
        <StatCard
          label="Sales Revenue (completed)"
          value={`$${completedSalesTotal.toFixed(2)}`}
          delta={`${filteredSales.length} sale(s) in range`}
          trend="up"
          icon={Receipt}
        />
        <StatCard
          label="Purchase Spend (completed)"
          value={`$${completedPurchasesTotal.toFixed(2)}`}
          delta={`${filteredPurchases.length} purchase(s) in range`}
          trend="flat"
          icon={ShoppingCart}
        />
        <StatCard label="Models Catalogued" value={String(models.length)} icon={Boxes} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartWrapper title="Sales by Day" data={salesByDate} />
        <ChartWrapper title="Stock by Category" data={stockByCategory} />
        <ChartWrapper title="Sales by Brand" data={salesByBrand} />
        <ChartWrapper title="Returns by Reason" data={returnsByReason} />
      </div>

      <p className="mt-4 text-xs text-muted">
        {filteredSerials.length} tracked unit(s) match the current warranty/category/brand filters.
      </p>
    </div>
  );
}
