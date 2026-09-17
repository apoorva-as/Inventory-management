"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { PurchaseForm, type PurchaseFormOutput } from "@/components/medical/PurchaseForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import { formatCurrency } from "@/lib/utils/formatters";
import type { MedicalPurchase } from "@/lib/types/medical";
import type { OrderStatus } from "@/lib/types/shared";

const PAGE_SIZE = 8;
const PURCHASE_FORM_ID = "medical-purchase-form";

const statusTone: Record<OrderStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  cancelled: "danger",
};

export function PurchasesSection() {
  const { purchases, suppliers, medicines, addPurchase, updatePurchaseStatus } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<MedicalPurchase | null>(null);

  const filteredPurchases = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchases.filter((p) => {
      const matchesSearch =
        !term ||
        p.vendorName.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.items.some((i) => i.productName.toLowerCase().includes(term));
      const matchesSupplier = !supplierFilter || p.vendorId === supplierFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesSupplier && matchesStatus;
    });
  }, [purchases, search, supplierFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedPurchases = filteredPurchases.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setSupplierFilter("");
    setStatusFilter("");
    setPage(1);
  }

  function handleFormSubmit(values: PurchaseFormOutput) {
    addPurchase({ id: generateId("mpu"), ...values });
    if (values.status === "completed") {
      showToast(`Purchase from "${values.vendorName}" was recorded and batches updated.`, "success");
    } else {
      showToast(`Purchase from "${values.vendorName}" was recorded as ${values.status}.`, "success");
    }
    setFormOpen(false);
  }

  function completePurchase(purchase: MedicalPurchase) {
    updatePurchaseStatus(purchase.id, "completed");
    showToast(`Purchase ${purchase.id.toUpperCase()} marked completed — batches updated.`, "success");
    setDetailsTarget((prev) => (prev && prev.id === purchase.id ? { ...prev, status: "completed" } : prev));
  }

  const columns: DataTableColumn<MedicalPurchase>[] = [
    {
      key: "id",
      header: "Purchase",
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.id.toUpperCase()}</p>
          <p className="text-xs text-muted">{p.date}</p>
        </div>
      ),
    },
    { key: "supplier", header: "Supplier", render: (p) => p.vendorName },
    { key: "items", header: "Items", render: (p) => `${p.items.length} medicine(s)` },
    { key: "total", header: "Total", render: (p) => formatCurrency(p.total) },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          {p.status === "pending" && (
            <button
              onClick={() => completePurchase(p)}
              className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
              aria-label={`Mark purchase ${p.id} completed`}
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button
            onClick={() => setDetailsTarget(p)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View purchase ${p.id}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{purchases.length} purchase records from your suppliers</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Record Purchase
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by supplier, purchase ID, or medicine..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={supplierFilter}
          onChange={(e) => {
            setSupplierFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedPurchases}
        getRowKey={(p) => p.id}
        onRowClick={(p) => setDetailsTarget(p)}
        emptyTitle="No purchases found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Record Purchase"
        description="Log a new purchase from a supplier, including the batch it arrived in."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={PURCHASE_FORM_ID}>
              Record Purchase
            </Button>
          </>
        }
      >
        {formOpen && (
          <PurchaseForm
            formId={PURCHASE_FORM_ID}
            suppliers={suppliers}
            medicines={medicines}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Purchase ${detailsTarget.id.toUpperCase()}` : "Purchase Details"}
        size="md"
        footer={
          detailsTarget && detailsTarget.status === "pending" ? (
            <Button onClick={() => completePurchase(detailsTarget)}>
              <CheckCircle2 size={16} />
              Mark Completed
            </Button>
          ) : undefined
        }
      >
        {detailsTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted">Supplier</p>
                <p className="font-medium text-foreground">{detailsTarget.vendorName}</p>
              </div>
              <div className="text-right">
                <p className="text-muted">Date</p>
                <p className="font-medium text-foreground">{detailsTarget.date}</p>
              </div>
            </div>
            <Badge tone={statusTone[detailsTarget.status]}>{detailsTarget.status}</Badge>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-3 py-2 font-medium text-muted">Medicine</th>
                    <th className="px-3 py-2 font-medium text-muted">Batch</th>
                    <th className="px-3 py-2 font-medium text-muted">Qty</th>
                    <th className="px-3 py-2 font-medium text-muted">Unit Cost</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsTarget.items.map((item) => (
                    <tr key={item.productId} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.productName}</td>
                      <td className="px-3 py-2 text-foreground">{item.batchNumber}</td>
                      <td className="px-3 py-2 text-foreground">{item.quantity}</td>
                      <td className="px-3 py-2 text-foreground">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3 py-2">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-base font-semibold text-accent">{formatCurrency(detailsTarget.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
