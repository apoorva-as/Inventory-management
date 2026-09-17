"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FormPanel } from "@/components/shared/FormPanel";
import { useToast } from "@/components/shared/NotificationCenter";
import { PurchaseReturnForm, type PurchaseReturnFormOutput } from "@/components/medical/PurchaseReturnForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalPurchaseReturn } from "@/lib/types/medical";

const FORM_ID = "medical-purchase-return-form";

export function PurchaseReturnsSection() {
  const { purchaseReturns, purchases, batches, addPurchaseReturn } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchaseReturns.filter(
      (r) =>
        !term ||
        r.medicineName.toLowerCase().includes(term) ||
        r.supplierName.toLowerCase().includes(term) ||
        r.batchNumber.toLowerCase().includes(term),
    );
  }, [purchaseReturns, search]);

  function handleFormSubmit(values: PurchaseReturnFormOutput) {
    addPurchaseReturn({ id: generateId("mpret"), ...values });
    showToast(`Purchase return for "${values.medicineName}" was recorded.`, "success");
    setFormOpen(false);
  }

  const columns: DataTableColumn<MedicalPurchaseReturn>[] = [
    { key: "date", header: "Date", render: (r) => r.date },
    { key: "medicine", header: "Medicine", render: (r) => r.medicineName },
    { key: "batch", header: "Batch", render: (r) => r.batchNumber },
    { key: "supplier", header: "Supplier", render: (r) => r.supplierName },
    { key: "quantity", header: "Quantity", render: (r) => String(r.quantity) },
    { key: "reason", header: "Reason", render: (r) => r.reason },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{purchaseReturns.length} purchase returns to suppliers</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New Return
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by medicine, batch, or supplier..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(r) => r.id}
        emptyTitle="No purchase returns found"
        emptyDescription="Try a different search term."
      />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Purchase Return"
        description="Return stock to a supplier from a completed purchase's batch."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID}>
              Record Return
            </Button>
          </>
        }
      >
        {formOpen && (
          <PurchaseReturnForm formId={FORM_ID} purchases={purchases} batches={batches} onSubmit={handleFormSubmit} />
        )}
      </FormPanel>
    </div>
  );
}
