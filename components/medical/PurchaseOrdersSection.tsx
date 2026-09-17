"use client";

import { useMemo, useState } from "react";
import { Ban, Eye, PackageCheck, Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { PurchaseOrderForm, type PurchaseOrderFormOutput } from "@/components/medical/PurchaseOrderForm";
import { ReceivePOForm } from "@/components/medical/ReceivePOForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import { formatCurrency } from "@/lib/utils/formatters";
import type { MedicalPurchaseOrder, PurchaseOrderStatus } from "@/lib/types/medical";
import type { ReceivedPoLine } from "@/lib/data/medicalRepository";

const PO_FORM_ID = "medical-po-form";
const RECEIVE_FORM_ID = "medical-receive-po-form";

const statusTone: Record<PurchaseOrderStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending: "warning",
  received: "success",
  cancelled: "danger",
};

export function PurchaseOrdersSection() {
  const { purchaseOrders, suppliers, medicines, addPurchaseOrder, cancelPurchaseOrder, receivePurchaseOrder } =
    useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<MedicalPurchaseOrder | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<MedicalPurchaseOrder | null>(null);

  const filteredPOs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        !term || po.poNumber.toLowerCase().includes(term) || po.supplierName.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
  }

  function handleFormSubmit(values: PurchaseOrderFormOutput) {
    addPurchaseOrder({ id: generateId("po"), poNumber: `PO-${Date.now()}`, ...values });
    showToast(`Purchase order for "${values.supplierName}" was created.`, "success");
    setFormOpen(false);
  }

  function handleCancel(po: MedicalPurchaseOrder) {
    cancelPurchaseOrder(po.id);
    showToast(`Purchase order ${po.poNumber} was cancelled.`, "info");
    setDetailsTarget(null);
  }

  function handleReceiveSubmit(lines: ReceivedPoLine[], date: string) {
    if (!receiveTarget) return;
    receivePurchaseOrder(receiveTarget.id, lines, date);
    showToast(`Purchase order ${receiveTarget.poNumber} received — batches updated.`, "success");
    setReceiveTarget(null);
    setDetailsTarget(null);
  }

  const columns: DataTableColumn<MedicalPurchaseOrder>[] = [
    {
      key: "poNumber",
      header: "PO Number",
      render: (po) => (
        <div>
          <p className="font-medium text-foreground">{po.poNumber}</p>
          <p className="text-xs text-muted">{po.date}</p>
        </div>
      ),
    },
    { key: "supplier", header: "Supplier", render: (po) => po.supplierName },
    { key: "items", header: "Items", render: (po) => `${po.items.length} medicine(s)` },
    { key: "total", header: "Total", render: (po) => formatCurrency(po.total) },
    {
      key: "status",
      header: "Status",
      render: (po) => <Badge tone={statusTone[po.status]}>{po.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (po) => (
        <div className="flex justify-end gap-1">
          {(po.status === "draft" || po.status === "pending") && (
            <>
              <button
                onClick={() => setReceiveTarget(po)}
                className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
                aria-label={`Receive ${po.poNumber}`}
              >
                <PackageCheck size={16} />
              </button>
              <button
                onClick={() => handleCancel(po)}
                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                aria-label={`Cancel ${po.poNumber}`}
              >
                <Ban size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => setDetailsTarget(po)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View ${po.poNumber}`}
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
        <p className="text-sm text-muted">{purchaseOrders.length} purchase orders</p>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          New Purchase Order
        </Button>
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by PO number or supplier..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | "")}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filteredPOs}
        getRowKey={(po) => po.id}
        onRowClick={(po) => setDetailsTarget(po)}
        emptyTitle="No purchase orders found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Purchase Order"
        description="Create a purchase order. It never affects stock until it's received."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={PO_FORM_ID}>
              Create Purchase Order
            </Button>
          </>
        }
      >
        {formOpen && (
          <PurchaseOrderForm
            formId={PO_FORM_ID}
            suppliers={suppliers}
            medicines={medicines}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={receiveTarget !== null}
        onClose={() => setReceiveTarget(null)}
        title={receiveTarget ? `Receive ${receiveTarget.poNumber}` : "Receive Purchase Order"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiveTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form={RECEIVE_FORM_ID}>
              Confirm Receipt
            </Button>
          </>
        }
      >
        {receiveTarget && (
          <ReceivePOForm formId={RECEIVE_FORM_ID} po={receiveTarget} onSubmit={handleReceiveSubmit} />
        )}
      </Modal>

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? detailsTarget.poNumber : "Purchase Order Details"}
        size="md"
        footer={
          detailsTarget && (detailsTarget.status === "draft" || detailsTarget.status === "pending") ? (
            <>
              <Button variant="secondary" onClick={() => handleCancel(detailsTarget)}>
                <Ban size={16} />
                Cancel Order
              </Button>
              <Button onClick={() => setReceiveTarget(detailsTarget)}>
                <PackageCheck size={16} />
                Receive Order
              </Button>
            </>
          ) : undefined
        }
      >
        {detailsTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted">Supplier</p>
                <p className="font-medium text-foreground">{detailsTarget.supplierName}</p>
              </div>
              <div className="text-right">
                <p className="text-muted">Order Date</p>
                <p className="font-medium text-foreground">{detailsTarget.date}</p>
              </div>
            </div>
            <Badge tone={statusTone[detailsTarget.status]}>{detailsTarget.status}</Badge>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-3 py-2 font-medium text-muted">Medicine</th>
                    <th className="px-3 py-2 font-medium text-muted">Qty</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsTarget.items.map((item) => (
                    <tr key={item.medicineId} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.medicineName}</td>
                      <td className="px-3 py-2 text-foreground">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-foreground">{formatCurrency(item.purchasePrice)}</td>
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
