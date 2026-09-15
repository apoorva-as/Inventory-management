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
import { CustomerForm, type CustomerFormOutput } from "@/components/medical/CustomerForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalCustomer } from "@/lib/types/medical";

const PAGE_SIZE = 8;
const CUSTOMER_FORM_ID = "medical-customer-form";

export default function MedicalCustomersPage() {
  const { customers, sales, prescriptions, addCustomer, updateCustomer, deleteCustomer } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<{ mode: "add" | "edit"; customer?: MedicalCustomer } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term),
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCustomers = filteredCustomers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFormSubmit(values: CustomerFormOutput) {
    if (panel?.mode === "edit" && panel.customer) {
      updateCustomer(panel.customer.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addCustomer({ id: generateId("mc"), totalOrders: 0, totalSpent: 0, ...values });
      showToast(`"${values.name}" was added to Customers.`, "success");
    }
    setPanel(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const hasRecords =
      sales.some((s) => s.customerId === deleteTarget.id) ||
      prescriptions.some((p) => p.customerId === deleteTarget.id);
    if (hasRecords) {
      showToast(`Can't delete "${deleteTarget.name}" — they have sale or prescription records on file.`, "error");
      setDeleteTarget(null);
      return;
    }
    deleteCustomer(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<MedicalCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          {c.address && <p className="text-xs text-muted">{c.address}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (c) => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1.5 text-sm">
            <Phone size={13} className="text-muted" />
            {c.phone}
          </p>
          {c.email && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Mail size={13} />
              {c.email}
            </p>
          )}
        </div>
      ),
    },
    { key: "totalOrders", header: "Orders", render: (c) => String(c.totalOrders) },
    { key: "totalSpent", header: "Total Spent", render: (c) => `$${c.totalSpent.toFixed(2)}` },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPanel({ mode: "edit", customer: c })}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${c.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${c.name}`}
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
        title="Customers"
        description={`${customers.length} customers on file`}
        actions={
          <Button onClick={() => setPanel({ mode: "add" })}>
            <Plus size={16} />
            Add Customer
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
          placeholder="Search by name, phone, or email..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={pagedCustomers}
        getRowKey={(c) => c.id}
        emptyTitle="No customers found"
        emptyDescription="Try a different search term, or add a new customer."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.mode === "edit" ? "Edit Customer" : "Add Customer"}
        description="Enter the customer's contact details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button type="submit" form={CUSTOMER_FORM_ID}>
              {panel?.mode === "edit" ? "Save Changes" : "Add Customer"}
            </Button>
          </>
        }
      >
        {panel && (
          <CustomerForm
            formId={CUSTOMER_FORM_ID}
            initialCustomer={panel.customer}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Customer"
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
