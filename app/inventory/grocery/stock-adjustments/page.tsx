"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { useToast } from "@/components/shared/NotificationCenter";
import {
  StockAdjustmentForm,
  type StockAdjustmentFormOutput,
} from "@/components/grocery/StockAdjustmentForm";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { generateId } from "@/lib/utils/id";
import type { GroceryStockAdjustment, StockAdjustmentType } from "@/lib/types/grocery";

const PAGE_SIZE = 10;
const ADJUSTMENT_FORM_ID = "grocery-stock-adjustment-form";

const typeTone: Record<StockAdjustmentType, "success" | "danger"> = {
  increase: "success",
  decrease: "danger",
};

export default function GroceryStockAdjustmentsPage() {
  const { products, adjustments, addStockAdjustment } = useGroceryData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StockAdjustmentType | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const filteredAdjustments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return adjustments.filter((a) => {
      const matchesSearch =
        !term || a.productName.toLowerCase().includes(term) || a.reason.toLowerCase().includes(term);
      const matchesType = !typeFilter || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [adjustments, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAdjustments.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedAdjustments = filteredAdjustments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setPage(1);
  }

  function handleFormSubmit(values: StockAdjustmentFormOutput) {
    addStockAdjustment({ id: generateId("gadj"), ...values });
    showToast(
      `Stock ${values.type === "increase" ? "increased" : "decreased"} for "${values.productName}".`,
      "success",
    );
    setFormOpen(false);
  }

  const columns: DataTableColumn<GroceryStockAdjustment>[] = [
    {
      key: "product",
      header: "Product",
      render: (a) => (
        <div>
          <p className="font-medium text-foreground">{a.productName}</p>
          <p className="text-xs text-muted">{a.date}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (a) => <Badge tone={typeTone[a.type]}>{a.type}</Badge>,
    },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "quantity", header: "Quantity", render: (a) => a.quantity },
    { key: "notes", header: "Notes", render: (a) => a.notes ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        description={`${adjustments.length} adjustments recorded`}
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by product or reason..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as StockAdjustmentType | "");
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Types</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedAdjustments}
        getRowKey={(a) => a.id}
        emptyTitle="No adjustments found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Stock Adjustment"
        description="Manually increase or decrease a product's stock quantity."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={ADJUSTMENT_FORM_ID}>
              Save Adjustment
            </Button>
          </>
        }
      >
        {formOpen && (
          <StockAdjustmentForm formId={ADJUSTMENT_FORM_ID} products={products} onSubmit={handleFormSubmit} />
        )}
      </FormPanel>
    </div>
  );
}
