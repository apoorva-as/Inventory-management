"use client";

import { useMemo, useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { SupplierForm, type SupplierFormOutput } from "@/components/medical/SupplierForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalSupplier } from "@/lib/types/medical";

const PAGE_SIZE = 8;
const SUPPLIER_FORM_ID = "medical-supplier-form";

export default function MedicalSuppliersPage() {
  const { suppliers, purchases, addSupplier, updateSupplier, deleteSupplier } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<{ mode: "add" | "edit"; supplier?: MedicalSupplier } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalSupplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        (s.contactPerson ?? "").toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term),
    );
  }, [suppliers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSuppliers = filteredSuppliers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFormSubmit(values: SupplierFormOutput) {
    if (panel?.mode === "edit" && panel.supplier) {
      updateSupplier(panel.supplier.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addSupplier({ id: generateId("ms"), ...values });
      showToast(`"${values.name}" was added to Suppliers.`, "success");
    }
    setPanel(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const hasPurchases = purchases.some((p) => p.vendorId === deleteTarget.id);
    if (hasPurchases) {
      showToast(`Can't delete "${deleteTarget.name}" — they have purchase records on file.`, "error");
      setDeleteTarget(null);
      return;
    }
    deleteSupplier(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<MedicalSupplier>[] = [
    {
      key: "name",
      header: "Supplier",
      render: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.name}</p>
          {s.address && <p className="text-xs text-muted">{s.address}</p>}
        </div>
      ),
    },
    { key: "contactPerson", header: "Contact Person", render: (s) => s.contactPerson ?? "—" },
    {
      key: "contact",
      header: "Contact",
      render: (s) => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-sm">
            <Phone size={13} className="text-muted" />
            {s.phone}
          </p>
          {s.email && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Mail size={13} />
              {s.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPanel({ mode: "edit", supplier: s })}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${s.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${s.name}`}
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
        title="Suppliers"
        description={`${suppliers.length} suppliers on file`}
        actions={
          <Button onClick={() => setPanel({ mode: "add" })}>
            <Plus size={16} />
            Add Supplier
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
          placeholder="Search by name, contact, or phone..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={pagedSuppliers}
        getRowKey={(s) => s.id}
        emptyTitle="No suppliers found"
        emptyDescription="Try a different search term, or add a new supplier."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.mode === "edit" ? "Edit Supplier" : "Add Supplier"}
        description="Enter the supplier's contact details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button type="submit" form={SUPPLIER_FORM_ID}>
              {panel?.mode === "edit" ? "Save Changes" : "Add Supplier"}
            </Button>
          </>
        }
      >
        {panel && (
          <SupplierForm
            formId={SUPPLIER_FORM_ID}
            initialSupplier={panel.supplier}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Supplier"
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
