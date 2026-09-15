"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import type { GroceryProduct } from "@/lib/types/grocery";

const PAGE_SIZE = 10;

export default function GroceryLowStockPage() {
  const { products, categories } = useGroceryData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQty <= p.reorderLevel),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lowStockProducts.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [lowStockProducts, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setPage(1);
  }

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
    { key: "stock", header: "Current Stock", render: (p) => String(p.stockQty) },
    { key: "reorder", header: "Reorder Level", render: (p) => String(p.reorderLevel) },
    { key: "unit", header: "Unit", render: (p) => p.unit },
    {
      key: "status",
      header: "Status",
      render: (p) =>
        p.stockQty === 0 ? <Badge tone="danger">Out of Stock</Badge> : <Badge tone="warning">Low Stock</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Low Stock"
        description={`${lowStockProducts.length} product(s) at or below their reorder level`}
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
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedProducts}
        getRowKey={(p) => p.id}
        emptyTitle="No low-stock products"
        emptyDescription="Every product is currently above its reorder level."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
