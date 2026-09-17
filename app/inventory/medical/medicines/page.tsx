"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { MedicineForm, type MedicineFormOutput } from "@/components/medical/MedicineForm";
import { PrescriptionRequiredBadge } from "@/components/medical/PrescriptionRequiredBadge";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import { getMedicineTotalStock, isLowStock } from "@/lib/utils/medicalStock";
import { formatCurrency } from "@/lib/utils/formatters";
import type { MedicalMedicine } from "@/lib/types/medical";

const PAGE_SIZE = 8;
const MEDICINE_FORM_ID = "medical-medicine-form";

type StockFilter = "all" | "low" | "out";
type RxFilter = "all" | "required" | "otc";

export default function MedicalMedicinesPage() {
  const { medicines, batches, categories, manufacturers, addMedicine, updateMedicine, deleteMedicine } =
    useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [rxFilter, setRxFilter] = useState<RxFilter>("all");
  const [page, setPage] = useState(1);

  const [panel, setPanel] = useState<{ mode: "add" | "edit"; medicine?: MedicalMedicine } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalMedicine | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const manufacturerName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? "—";

  const filteredMedicines = useMemo(() => {
    const term = search.trim().toLowerCase();
    return medicines.filter((m) => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.genericName.toLowerCase().includes(term) ||
        (m.brandName ?? "").toLowerCase().includes(term) ||
        m.sku.toLowerCase().includes(term) ||
        (m.barcode ?? "").toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || m.categoryId === categoryFilter;
      const matchesManufacturer = !manufacturerFilter || m.manufacturerId === manufacturerFilter;
      const stock = getMedicineTotalStock(batches, m.id);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && stock > 0 && isLowStock(stock, m.minimumStock)) ||
        (stockFilter === "out" && stock === 0);
      const matchesRx =
        rxFilter === "all" ||
        (rxFilter === "required" && m.prescriptionRequired) ||
        (rxFilter === "otc" && !m.prescriptionRequired);
      return matchesSearch && matchesCategory && matchesManufacturer && matchesStock && matchesRx;
    });
  }, [medicines, batches, search, categoryFilter, manufacturerFilter, stockFilter, rxFilter]);

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

  function handleFormSubmit(values: MedicineFormOutput) {
    if (panel?.mode === "edit" && panel.medicine) {
      updateMedicine(panel.medicine.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addMedicine({ id: generateId("mm"), ...values });
      showToast(`"${values.name}" was added to Medicines.`, "success");
    }
    setPanel(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMedicine(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

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
    { key: "manufacturer", header: "Manufacturer", render: (m) => manufacturerName(m.manufacturerId) },
    { key: "category", header: "Category", render: (m) => categoryName(m.categoryId) },
    { key: "form", header: "Form", render: (m) => `${m.dosageForm} · ${m.strength}` },
    { key: "mrp", header: "MRP", render: (m) => formatCurrency(m.mrp) },
    {
      key: "stock",
      header: "Stock",
      render: (m) => {
        const stock = getMedicineTotalStock(batches, m.id);
        return (
          <div className="flex items-center gap-2">
            <span>{stock}</span>
            {stock === 0 && <Badge tone="danger">Out</Badge>}
            {stock > 0 && isLowStock(stock, m.minimumStock) && <Badge tone="warning">Low</Badge>}
          </div>
        );
      },
    },
    {
      key: "rx",
      header: "Rx",
      render: (m) => <PrescriptionRequiredBadge required={m.prescriptionRequired} />,
    },
    {
      key: "status",
      header: "Status",
      render: (m) => <Badge tone={m.active ? "success" : "neutral"}>{m.active ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPanel({ mode: "edit", medicine: m })}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${m.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(m)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${m.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Medicines"
        description={`${medicines.length} medicines in your pharmacy catalog`}
        actions={
          <Button onClick={() => setPanel({ mode: "add" })}>
            <Plus size={16} />
            Add Medicine
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, generic name, brand, SKU, or barcode..."
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
        emptyTitle="No medicines found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.mode === "edit" ? "Edit Medicine" : "Add Medicine"}
        description="Enter the medicine's catalog details. Stock is tracked separately per batch."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button type="submit" form={MEDICINE_FORM_ID}>
              {panel?.mode === "edit" ? "Save Changes" : "Add Medicine"}
            </Button>
          </>
        }
      >
        {panel && (
          <MedicineForm
            formId={MEDICINE_FORM_ID}
            categories={categories}
            manufacturers={manufacturers}
            initialMedicine={panel.medicine}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Medicine"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
