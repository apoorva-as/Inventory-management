"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Modal } from "@/components/shared/Modal";
import {
  MedicalExpiryBadge,
  getMedicalExpiryStatus,
  type MedicalExpiryStatus,
} from "@/components/medical/MedicalExpiryBadge";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import type { MedicalMedicine } from "@/lib/types/medical";

const PAGE_SIZE = 10;

type ExpiryFilter = "all" | MedicalExpiryStatus;

export default function MedicalBatchesPage() {
  const { medicines, categories, manufacturers } = useMedicalData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpiryFilter>("all");
  const [page, setPage] = useState(1);
  const [detailsTarget, setDetailsTarget] = useState<MedicalMedicine | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const manufacturerName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? "—";

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.genericName.toLowerCase().includes(term) ||
        m.batchNumber.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || m.categoryId === categoryFilter;
      const matchesManufacturer = !manufacturerFilter || m.manufacturerId === manufacturerFilter;
      const matchesStatus = statusFilter === "all" || getMedicalExpiryStatus(m.expiryDate) === statusFilter;
      return matchesSearch && matchesCategory && matchesManufacturer && matchesStatus;
    });
  }, [medicines, search, categoryFilter, manufacturerFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedBatches = filteredBatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setManufacturerFilter("");
    setStatusFilter("all");
    setPage(1);
  }

  const columns: DataTableColumn<MedicalMedicine>[] = [
    {
      key: "medicine",
      header: "Medicine",
      render: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-muted">{m.genericName}</p>
        </div>
      ),
    },
    { key: "batch", header: "Batch Number", render: (m) => m.batchNumber },
    { key: "category", header: "Category", render: (m) => categoryName(m.categoryId) },
    { key: "manufacturer", header: "Manufacturer", render: (m) => manufacturerName(m.manufacturerId) },
    { key: "mfgDate", header: "Mfg. Date", render: (m) => m.manufacturingDate },
    { key: "stock", header: "Stock", render: (m) => String(m.stockQty) },
    { key: "mrp", header: "MRP", render: (m) => `$${m.mrp.toFixed(2)}` },
    {
      key: "status",
      header: "Batch Status",
      render: (m) => <MedicalExpiryBadge expiryDate={m.expiryDate} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end">
          <button
            onClick={() => setDetailsTarget(m)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View batch ${m.batchNumber}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Batches" description={`${medicines.length} tracked medicine batches`} />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by medicine, generic name, or batch number..."
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
          value={manufacturerFilter}
          onChange={(e) => {
            setManufacturerFilter(e.target.value);
            setPage(1);
          }}
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ExpiryFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Batches</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon (≤14 days)</option>
          <option value="healthy">Healthy</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedBatches}
        getRowKey={(m) => m.id}
        onRowClick={(m) => setDetailsTarget(m)}
        emptyTitle="No batches found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Batch ${detailsTarget.batchNumber}` : "Batch Details"}
        size="sm"
      >
        {detailsTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Medicine</span>
              <span className="font-medium text-foreground">{detailsTarget.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Generic Name</span>
              <span className="font-medium text-foreground">{detailsTarget.genericName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Manufacturer</span>
              <span className="font-medium text-foreground">
                {manufacturerName(detailsTarget.manufacturerId)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Category</span>
              <span className="font-medium text-foreground">{categoryName(detailsTarget.categoryId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Batch Number</span>
              <span className="font-medium text-foreground">{detailsTarget.batchNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Manufacturing Date</span>
              <span className="font-medium text-foreground">{detailsTarget.manufacturingDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Expiry Date</span>
              <MedicalExpiryBadge expiryDate={detailsTarget.expiryDate} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Stock on Hand</span>
              <span className="font-medium text-foreground">{detailsTarget.stockQty}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">MRP</span>
              <span className="font-medium text-foreground">${detailsTarget.mrp.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
