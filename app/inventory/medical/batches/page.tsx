"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Modal } from "@/components/shared/Modal";
import { MedicalExpiryBadge } from "@/components/medical/MedicalExpiryBadge";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getBatchExpiryStatus } from "@/lib/utils/medicalStock";
import { formatCurrency } from "@/lib/utils/formatters";
import type { ExpiryStatus } from "@/lib/utils/expiry";
import type { MedicalBatch } from "@/lib/types/medical";

const PAGE_SIZE = 10;

type ExpiryFilter = "all" | ExpiryStatus;

export default function MedicalBatchesPage() {
  const { batches, medicines, suppliers } = useMedicalData();

  const [search, setSearch] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpiryFilter>("all");
  const [page, setPage] = useState(1);
  const [detailsTarget, setDetailsTarget] = useState<MedicalBatch | null>(null);

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return batches.filter((b) => {
      const matchesSearch =
        !term || b.medicineName.toLowerCase().includes(term) || b.batchNumber.toLowerCase().includes(term);
      const matchesMedicine = !medicineFilter || b.medicineId === medicineFilter;
      const matchesSupplier = !supplierFilter || b.supplierId === supplierFilter;
      const matchesStatus = statusFilter === "all" || getBatchExpiryStatus(b) === statusFilter;
      return matchesSearch && matchesMedicine && matchesSupplier && matchesStatus;
    });
  }, [batches, search, medicineFilter, supplierFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedBatches = filteredBatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setMedicineFilter("");
    setSupplierFilter("");
    setStatusFilter("all");
    setPage(1);
  }

  const columns: DataTableColumn<MedicalBatch>[] = [
    {
      key: "medicine",
      header: "Medicine",
      render: (b) => <p className="font-medium text-foreground">{b.medicineName}</p>,
    },
    { key: "batch", header: "Batch Number", render: (b) => b.batchNumber },
    { key: "supplier", header: "Supplier", render: (b) => b.supplierName },
    { key: "mfgDate", header: "Mfg. Date", render: (b) => b.manufacturingDate },
    { key: "stock", header: "Stock", render: (b) => String(b.quantity) },
    {
      key: "mrp",
      header: "MRP",
      render: (b) => (b.mrp != null ? formatCurrency(b.mrp) : "—"),
    },
    {
      key: "status",
      header: "Batch Status",
      render: (b) => <MedicalExpiryBadge expiryDate={b.expiryDate} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end">
          <button
            onClick={() => setDetailsTarget(b)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View batch ${b.batchNumber}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Batches" description={`${batches.length} tracked stock lots`} />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by medicine or batch number..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={medicineFilter}
          onChange={(e) => {
            setMedicineFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Medicines</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => {
            setSupplierFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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
        getRowKey={(b) => b.id}
        onRowClick={(b) => setDetailsTarget(b)}
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
              <span className="font-medium text-foreground">{detailsTarget.medicineName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Supplier</span>
              <span className="font-medium text-foreground">{detailsTarget.supplierName}</span>
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
              <span className="font-medium text-foreground">{detailsTarget.quantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Purchase Price</span>
              <span className="font-medium text-foreground">{formatCurrency(detailsTarget.purchasePrice)}</span>
            </div>
            {detailsTarget.mrp != null && (
              <div className="flex items-center justify-between">
                <span className="text-muted">MRP</span>
                <span className="font-medium text-foreground">{formatCurrency(detailsTarget.mrp)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
