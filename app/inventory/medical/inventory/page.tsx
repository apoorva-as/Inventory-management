"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { MedicalExpiryBadge } from "@/components/medical/MedicalExpiryBadge";
import { PrescriptionRequiredBadge } from "@/components/medical/PrescriptionRequiredBadge";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import type { MedicalMedicine } from "@/lib/types/medical";

const PAGE_SIZE = 10;

type StockFilter = "all" | "in-stock" | "low" | "out";
type RxFilter = "all" | "required" | "otc";

function stockStatus(m: MedicalMedicine): { label: string; tone: "success" | "warning" | "danger" } {
  if (m.stockQty === 0) return { label: "Out of Stock", tone: "danger" };
  if (m.stockQty <= m.reorderLevel) return { label: "Low Stock", tone: "warning" };
  return { label: "In Stock", tone: "success" };
}

export default function MedicalInventoryPage() {
  const { medicines, categories, manufacturers } = useMedicalData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [rxFilter, setRxFilter] = useState<RxFilter>("all");
  const [page, setPage] = useState(1);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const manufacturerName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? "—";

  const filteredMedicines = useMemo(() => {
    const term = search.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesSearch =
        !term || m.name.toLowerCase().includes(term) || m.genericName.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || m.categoryId === categoryFilter;
      const matchesManufacturer = !manufacturerFilter || m.manufacturerId === manufacturerFilter;
      const status = stockStatus(m);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && status.label === "In Stock") ||
        (stockFilter === "low" && status.label === "Low Stock") ||
        (stockFilter === "out" && status.label === "Out of Stock");
      const matchesRx =
        rxFilter === "all" ||
        (rxFilter === "required" && m.prescriptionRequired) ||
        (rxFilter === "otc" && !m.prescriptionRequired);
      return matchesSearch && matchesCategory && matchesManufacturer && matchesStock && matchesRx;
    });
  }, [medicines, search, categoryFilter, manufacturerFilter, stockFilter, rxFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedMedicines = filteredMedicines.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setManufacturerFilter("");
    setStockFilter("all");
    setRxFilter("all");
    setPage(1);
  }

  const totalUnits = medicines.reduce((sum, m) => sum + m.stockQty, 0);
  const totalValue = medicines.reduce((sum, m) => sum + m.stockQty * m.costPrice, 0);

  const columns: DataTableColumn<MedicalMedicine>[] = [
    {
      key: "name",
      header: "Medicine",
      render: (m) => (
        <div>
          <p className="font-medium text-foreground">{m.name}</p>
          <p className="text-xs text-muted">{m.genericName}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (m) => categoryName(m.categoryId) },
    { key: "manufacturer", header: "Manufacturer", render: (m) => manufacturerName(m.manufacturerId) },
    { key: "batch", header: "Batch", render: (m) => m.batchNumber },
    { key: "stock", header: "Stock", render: (m) => String(m.stockQty) },
    { key: "reorder", header: "Reorder Level", render: (m) => String(m.reorderLevel) },
    { key: "mrp", header: "MRP", render: (m) => `$${m.mrp.toFixed(2)}` },
    { key: "expiry", header: "Expiry", render: (m) => <MedicalExpiryBadge expiryDate={m.expiryDate} /> },
    {
      key: "rx",
      header: "Rx",
      render: (m) => <PrescriptionRequiredBadge required={m.prescriptionRequired} />,
    },
    {
      key: "status",
      header: "Status",
      render: (m) => {
        const status = stockStatus(m);
        return <Badge tone={status.tone}>{status.label}</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${medicines.length} medicines · ${totalUnits} units in stock · $${totalValue.toFixed(2)} stock value`}
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or generic name..."
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
          value={rxFilter}
          onChange={(e) => {
            setRxFilter(e.target.value as RxFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Medicines</option>
          <option value="required">Prescription Required</option>
          <option value="otc">Over-the-Counter</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedMedicines}
        getRowKey={(m) => m.id}
        emptyTitle="No inventory items found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
