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
import { VendorForm, type VendorFormOutput } from "@/components/grocery/VendorForm";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { generateId } from "@/lib/utils/id";
import type { GroceryVendor } from "@/lib/types/grocery";

const PAGE_SIZE = 8;
const VENDOR_FORM_ID = "grocery-vendor-form";

export default function GroceryVendorsPage() {
  const { vendors, purchases, addVendor, updateVendor, deleteVendor } = useGroceryData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<{ mode: "add" | "edit"; vendor?: GroceryVendor } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroceryVendor | null>(null);

  const filteredVendors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        (v.contactPerson ?? "").toLowerCase().includes(term) ||
        v.phone.toLowerCase().includes(term),
    );
  }, [vendors, search]);

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedVendors = filteredVendors.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFormSubmit(values: VendorFormOutput) {
    if (panel?.mode === "edit" && panel.vendor) {
      updateVendor(panel.vendor.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addVendor({ id: generateId("gv"), ...values });
      showToast(`"${values.name}" was added to Vendors.`, "success");
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
    deleteVendor(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<GroceryVendor>[] = [
    {
      key: "name",
      header: "Vendor",
      render: (v) => (
        <div>
          <p className="font-medium text-foreground">{v.name}</p>
          {v.address && <p className="text-xs text-muted">{v.address}</p>}
        </div>
      ),
    },
    { key: "contactPerson", header: "Contact Person", render: (v) => v.contactPerson ?? "—" },
    {
      key: "contact",
      header: "Contact",
      render: (v) => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-sm">
            <Phone size={13} className="text-muted" />
            {v.phone}
          </p>
          {v.email && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Mail size={13} />
              {v.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (v) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPanel({ mode: "edit", vendor: v })}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${v.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(v)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${v.name}`}
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
        title="Vendors"
        description={`${vendors.length} vendors on file`}
        actions={
          <Button onClick={() => setPanel({ mode: "add" })}>
            <Plus size={16} />
            Add Vendor
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
        rows={pagedVendors}
        getRowKey={(v) => v.id}
        emptyTitle="No vendors found"
        emptyDescription="Try a different search term, or add a new vendor."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.mode === "edit" ? "Edit Vendor" : "Add Vendor"}
        description="Enter the vendor's contact details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button type="submit" form={VENDOR_FORM_ID}>
              {panel?.mode === "edit" ? "Save Changes" : "Add Vendor"}
            </Button>
          </>
        }
      >
        {panel && (
          <VendorForm formId={VENDOR_FORM_ID} initialVendor={panel.vendor} onSubmit={handleFormSubmit} />
        )}
      </FormPanel>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Vendor"
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
