"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ExpiryBadge } from "@/components/grocery/ExpiryBadge";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import type { GroceryProduct } from "@/lib/types/grocery";

const PAGE_SIZE = 10;

type StockFilter = "all" | "in-stock" | "low" | "out";

function stockStatus(p: GroceryProduct): { label: string; tone: "success" | "warning" | "danger" } {
  if (p.stockQty === 0) return { label: "Out of Stock", tone: "danger" };
  if (p.stockQty <= p.reorderLevel) return { label: "Low Stock", tone: "warning" };
  return { label: "In Stock", tone: "success" };
}

export default function GroceryInventoryPage() {
  const { products, categories, brands } = useGroceryData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const brandName = (id?: string) => (id ? brands.find((b) => b.id === id)?.name ?? "—" : "—");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const status = stockStatus(p);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && status.label === "In Stock") ||
        (stockFilter === "low" && status.label === "Low Stock") ||
        (stockFilter === "out" && status.label === "Out of Stock");
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setBrandFilter("");
    setStockFilter("all");
    setPage(1);
  }

  const totalUnits = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stockQty * p.costPrice, 0);

  const columns: DataTableColumn<GroceryProduct>[] = [
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
    { key: "category", header: "Category", render: (p) => categoryName(p.categoryId) },
    { key: "brand", header: "Brand", render: (p) => brandName(p.brandId) },
    { key: "unit", header: "Unit", render: (p) => (p.weight ? `${p.weight} ${p.unit}` : p.unit) },
    { key: "stock", header: "Stock", render: (p) => String(p.stockQty) },
    { key: "reorder", header: "Reorder Level", render: (p) => String(p.reorderLevel) },
    { key: "cost", header: "Cost", render: (p) => `$${p.costPrice.toFixed(2)}` },
    { key: "price", header: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    { key: "expiry", header: "Expiry", render: (p) => <ExpiryBadge expiryDate={p.expiryDate} /> },
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
