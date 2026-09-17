"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ExpiryBadge } from "@/components/grocery/ExpiryBadge";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import type { GroceryProduct } from "@/lib/types/grocery";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils/expiry";

const PAGE_SIZE = 10;

type ExpiryFilter = "all" | ExpiryStatus;

export default function GroceryExpiryPage() {
  const { products, categories } = useGroceryData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpiryFilter>("all");
  const [page, setPage] = useState(1);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const expiryCounts = useMemo(() => {
    const counts = { expired: 0, expiring: 0, healthy: 0, none: 0 };
    for (const p of products) counts[getExpiryStatus(p.expiryDate)] += 1;
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || getExpiryStatus(p.expiryDate) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
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
    { key: "stock", header: "Stock", render: (p) => `${p.stockQty} ${p.unit}` },
    { key: "expiryDate", header: "Expiry Date", render: (p) => p.expiryDate ?? "—" },
    { key: "status", header: "Status", render: (p) => <ExpiryBadge expiryDate={p.expiryDate} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Expiry Tracking"
        description={`${expiryCounts.expired} expired · ${expiryCounts.expiring} expiring soon · ${expiryCounts.healthy} healthy · ${expiryCounts.none} without expiry`}
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ExpiryFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Products</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon (≤14 days)</option>
          <option value="healthy">Healthy</option>
          <option value="none">No Expiry Date</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedProducts}
        getRowKey={(p) => p.id}
        emptyTitle="No products found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
