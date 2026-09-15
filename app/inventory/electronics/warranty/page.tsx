"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Modal } from "@/components/shared/Modal";
import { WarrantyBadge, getWarrantyStatus, type WarrantyStatus } from "@/components/electronics/WarrantyBadge";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import type { ElectronicsSerial } from "@/lib/types/electronics";

const PAGE_SIZE = 10;

type StatusFilter = "all" | WarrantyStatus;

export default function ElectronicsWarrantyPage() {
  const { serials, products, brands, categories, models } = useElectronicsData();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [detailsTarget, setDetailsTarget] = useState<ElectronicsSerial | null>(null);

  const productOf = (id: string) => products.find((p) => p.id === id);
  const brandName = (id?: string) => brands.find((b) => b.id === id)?.name ?? "—";
  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const modelName = (productId: string) => {
    const modelId = productOf(productId)?.modelId;
    return models.find((m) => m.id === modelId)?.name ?? "—";
  };

  const warrantyCounts = useMemo(() => {
    const counts: Record<WarrantyStatus, number> = { active: 0, expiring: 0, expired: 0, none: 0 };
    for (const s of serials) counts[getWarrantyStatus(s.warrantyExpiry)] += 1;
    return counts;
  }, [serials]);

  const filteredSerials = useMemo(() => {
    const term = search.trim().toLowerCase();
    return serials.filter((s) => {
      const product = products.find((p) => p.id === s.productId);
      const matchesSearch =
        !term || s.serialNumber.toLowerCase().includes(term) || s.productName.toLowerCase().includes(term);
      const matchesBrand = !brandFilter || product?.brandId === brandFilter;
      const matchesCategory = !categoryFilter || product?.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || getWarrantyStatus(s.warrantyExpiry) === statusFilter;
      return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
    });
  }, [serials, products, search, brandFilter, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSerials.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSerials = filteredSerials.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setBrandFilter("");
    setCategoryFilter("");
    setStatusFilter("all");
    setPage(1);
  }

  const columns: DataTableColumn<ElectronicsSerial>[] = [
    {
      key: "product",
      header: "Product",
      render: (s) => {
        const product = productOf(s.productId);
        return (
          <div>
            <p className="font-medium text-foreground">{s.productName}</p>
            <p className="text-xs text-muted">
              {brandName(product?.brandId)} · {categoryName(product?.categoryId)}
            </p>
          </div>
        );
      },
    },
    { key: "serial", header: "Serial / IMEI", render: (s) => s.serialNumber || s.imei || "—" },
    { key: "customer", header: "Customer", render: (s) => s.customerName ?? "—" },
    { key: "expiry", header: "Warranty Expiry", render: (s) => s.warrantyExpiry },
    { key: "status", header: "Status", render: (s) => <WarrantyBadge warrantyExpiry={s.warrantyExpiry} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Warranty"
        description={`${warrantyCounts.expired} expired · ${warrantyCounts.expiring} expiring soon · ${warrantyCounts.active} active`}
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by serial number or product..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Warranty Statuses</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="none">No Warranty</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedSerials}
        getRowKey={(s) => s.id}
        onRowClick={(s) => setDetailsTarget(s)}
        emptyTitle="No units found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? detailsTarget.productName : "Warranty Details"}
        size="sm"
      >
        {detailsTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Model</span>
              <span className="font-medium text-foreground">{modelName(detailsTarget.productId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Serial / IMEI</span>
              <span className="font-medium text-foreground">
                {detailsTarget.serialNumber || detailsTarget.imei || "—"}
              </span>
            </div>
            {detailsTarget.customerName && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Customer</span>
                <span className="font-medium text-foreground">{detailsTarget.customerName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted">Warranty Expiry</span>
              <span className="font-medium text-foreground">{detailsTarget.warrantyExpiry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <WarrantyBadge warrantyExpiry={detailsTarget.warrantyExpiry} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
