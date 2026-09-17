"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FormPanel } from "@/components/shared/FormPanel";
import { useToast } from "@/components/shared/NotificationCenter";
import { SalesReturnForm, type SalesReturnFormOutput } from "@/components/medical/SalesReturnForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalSalesReturn } from "@/lib/types/medical";

const FORM_ID = "medical-sales-return-form";

export function SalesReturnsSection() {
  const { salesReturns, sales, addSalesReturn } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return salesReturns.filter(
      (r) => !term || r.medicineName.toLowerCase().includes(term) || r.customerName.toLowerCase().includes(term),
    );
  }, [salesReturns, search]);

  function handleFormSubmit(values: SalesReturnFormOutput) {
    addSalesReturn({ id: generateId("msret"), ...values });
    showToast(`Sales return for "${values.medicineName}" was recorded.`, "success");
    setFormOpen(false);
  }

  const columns: DataTableColumn<MedicalSalesReturn>[] = [
    { key: "date", header: "Date", render: (r) => r.date },
    { key: "customer", header: "Customer", render: (r) => r.customerName },
    { key: "medicine", header: "Medicine", render: (r) => r.medicineName },
    { key: "sale", header: "Original Sale", render: (r) => r.saleId.toUpperCase() },
    { key: "quantity", header: "Quantity", render: (r) => String(r.quantity) },
    { key: "reason", header: "Reason", render: (r) => r.reason },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{salesReturns.length} customer returns</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New Return
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by medicine or customer..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(r) => r.id}
        emptyTitle="No sales returns found"
        emptyDescription="Try a different search term."
      />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Sales Return"
        description="Return a medicine from a completed sale and restock it."
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
        {formOpen && <SalesReturnForm formId={FORM_ID} sales={sales} onSubmit={handleFormSubmit} />}
      </FormPanel>
    </div>
  );
}
