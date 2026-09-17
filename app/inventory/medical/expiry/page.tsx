"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { MedicalExpiryBadge } from "@/components/medical/MedicalExpiryBadge";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getBatchExpiryStatus } from "@/lib/utils/medicalStock";
import type { ExpiryStatus } from "@/lib/utils/expiry";
import type { MedicalBatch } from "@/lib/types/medical";

const PAGE_SIZE = 10;

type ExpiryFilter = "all" | ExpiryStatus;

export default function MedicalExpiryPage() {
  const { batches, medicines, manufacturers } = useMedicalData();

  const [search, setSearch] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpiryFilter>("all");
  const [page, setPage] = useState(1);

  const manufacturerIdForMedicine = (medicineId: string) =>
    medicines.find((m) => m.id === medicineId)?.manufacturerId;
  const manufacturerName = (id?: string) => manufacturers.find((m) => m.id === id)?.name ?? "—";

  // Batches with quantity <= 0 are excluded — they're not active inventory to alert on.
  const activeBatches = useMemo(() => batches.filter((b) => b.quantity > 0), [batches]);

  const expiryCounts = useMemo(() => {
    const counts = { expired: 0, expiring: 0, healthy: 0, none: 0 };
    for (const b of activeBatches) counts[getBatchExpiryStatus(b)] += 1;
    return counts;
  }, [activeBatches]);

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activeBatches.filter((b) => {
      const matchesSearch =
        !term || b.medicineName.toLowerCase().includes(term) || b.batchNumber.toLowerCase().includes(term);
      const matchesManufacturer =
        !manufacturerFilter || manufacturerIdForMedicine(b.medicineId) === manufacturerFilter;
      const matchesStatus = statusFilter === "all" || getBatchExpiryStatus(b) === statusFilter;
      return matchesSearch && matchesManufacturer && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBatches, search, manufacturerFilter, statusFilter, medicines]);

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedBatches = filteredBatches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setManufacturerFilter("");
    setStatusFilter("all");
    setPage(1);
  }

  const columns: DataTableColumn<MedicalBatch>[] = [
    {
      key: "name",
      header: "Medicine",
      render: (b) => <p className="font-medium text-foreground">{b.medicineName}</p>,
    },
    { key: "batch", header: "Batch", render: (b) => b.batchNumber },
    {
      key: "manufacturer",
      header: "Manufacturer",
      render: (b) => manufacturerName(manufacturerIdForMedicine(b.medicineId)),
    },
    { key: "stock", header: "Stock", render: (b) => String(b.quantity) },
    { key: "expiryDate", header: "Expiry Date", render: (b) => b.expiryDate },
    { key: "status", header: "Status", render: (b) => <MedicalExpiryBadge expiryDate={b.expiryDate} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Expiry Tracking"
        description={`${expiryCounts.expired} expired · ${expiryCounts.expiring} expiring soon · ${expiryCounts.healthy} healthy`}
      />

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
        getRowKey={(b) => b.id}
        emptyTitle="No batches found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
