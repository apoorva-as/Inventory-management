"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { SerialImeiBadge } from "@/components/electronics/SerialImeiBadge";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import type { ElectronicsProduct } from "@/lib/types/electronics";

const PAGE_SIZE = 10;

type StockFilter = "all" | "in-stock" | "low" | "out";
type WarrantyFilter = "all" | "covered" | "none";

function stockStatus(p: ElectronicsProduct): { label: string; tone: "success" | "warning" | "danger" } {
  if (p.stockQty === 0) return { label: "Out of Stock", tone: "danger" };
  if (p.stockQty <= p.reorderLevel) return { label: "Low Stock", tone: "warning" };
  return { label: "In Stock", tone: "success" };
}

export default function ElectronicsInventoryPage() {
  const { products, categories, brands, models } = useElectronicsData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [warrantyFilter, setWarrantyFilter] = useState<WarrantyFilter>("all");
  const [page, setPage] = useState(1);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const brandName = (id?: string) => brands.find((b) => b.id === id)?.name ?? "—";
  const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? "—";

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const status = stockStatus(p);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && status.label === "In Stock") ||
        (stockFilter === "low" && status.label === "Low Stock") ||
        (stockFilter === "out" && status.label === "Out of Stock");
      const matchesWarranty =
        warrantyFilter === "all" ||
        (warrantyFilter === "covered" && p.warrantyMonths > 0) ||
        (warrantyFilter === "none" && p.warrantyMonths === 0);
      return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesWarranty;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter, warrantyFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setBrandFilter("");
    setStockFilter("all");
    setWarrantyFilter("all");
    setPage(1);
  }

  const totalUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);

  const columns: DataTableColumn<ElectronicsProduct>[] = [
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.name}</p>
          <p className="text-xs text-muted">{p.sku}</p>
        </div>
      ),
    },
    { key: "brand", header: "Brand", render: (p) => brandName(p.brandId) },
    { key: "model", header: "Model", render: (p) => modelName(p.modelId) },
    { key: "category", header: "Category", render: (p) => categoryName(p.categoryId) },
    { key: "stock", header: "Stock", render: (p) => String(p.stockQty) },
    { key: "reorder", header: "Reorder Level", render: (p) => String(p.reorderLevel) },
    { key: "cost", header: "Purchase Price", render: (p) => `$${p.costPrice.toFixed(2)}` },
    { key: "price", header: "Selling Price", render: (p) => `$${p.price.toFixed(2)}` },
    { key: "warranty", header: "Warranty", render: (p) => `${p.warrantyMonths} mo` },
    { key: "tracking", header: "Tracking", render: (p) => <SerialImeiBadge product={p} /> },
    {
      key: "status",
      header: "Status",
      render: (p) => {
        const status = stockStatus(p);
        return <Badge tone={status.tone}>{status.label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${products.length} products · ${totalUnits} units in stock · $${totalValue.toFixed(2)} stock value`}
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setStockFilter(e.target.value as StockFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select
          value={warrantyFilter}
          onChange={(e) => {
            setWarrantyFilter(e.target.value as WarrantyFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Warranty</option>
          <option value="covered">Has Warranty</option>
          <option value="none">No Warranty</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedProducts}
        getRowKey={(p) => p.id}
        emptyTitle="No inventory items found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
