"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FormPanel } from "@/components/shared/FormPanel";
import { useToast } from "@/components/shared/NotificationCenter";
import { StockAdjustmentForm, type StockAdjustmentFormOutput } from "@/components/medical/StockAdjustmentForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalStockAdjustment, MedicalStockAdjustmentType } from "@/lib/types/medical";

const FORM_ID = "medical-stock-adjustment-form";

export default function MedicalStockAdjustmentsPage() {
  const { stockAdjustments, medicines, batches, addStockAdjustment } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MedicalStockAdjustmentType | "">("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return stockAdjustments.filter((a) => {
      const matchesSearch = !term || a.medicineName.toLowerCase().includes(term);
      const matchesType = !typeFilter || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [stockAdjustments, search, typeFilter]);

  function handleFormSubmit(values: StockAdjustmentFormOutput) {
    addStockAdjustment({ id: generateId("madj"), ...values });
    showToast(
      `Stock ${values.type === "increase" ? "increased" : "decreased"} for "${values.medicineName}".`,
      "success",
    );
    setFormOpen(false);
  }

  const columns: DataTableColumn<MedicalStockAdjustment>[] = [
    { key: "date", header: "Date", render: (a) => a.date },
    { key: "medicine", header: "Medicine", render: (a) => a.medicineName },
    { key: "batch", header: "Batch", render: (a) => a.batchNumber ?? "—" },
    {
      key: "type",
      header: "Type",
      render: (a) => <Badge tone={a.type === "increase" ? "success" : "danger"}>{a.type}</Badge>,
    },
    { key: "quantity", header: "Quantity", render: (a) => String(a.quantity) },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "notes", header: "Notes", render: (a) => a.notes ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description={`${stockAdjustments.length} stock adjustments recorded`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            New Adjustment
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by medicine..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={() => setTypeFilter("")}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MedicalStockAdjustmentType | "")}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Types</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(a) => a.id}
        emptyTitle="No stock adjustments found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Stock Adjustment"
        description="Adjust a batch's stock up or down and log the reason."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID}>
              Save Adjustment
            </Button>
          </>
        }
      >
        {formOpen && (
          <StockAdjustmentForm formId={FORM_ID} medicines={medicines} batches={batches} onSubmit={handleFormSubmit} />
        )}
      </FormPanel>
    </div>
  );
}
