"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Eye, Plus, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { cn } from "@/lib/utils/cn";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { generateId } from "@/lib/utils/id";
import type { ElectronicsReturn, ElectronicsReturnReason } from "@/lib/types/electronics";

const PAGE_SIZE = 8;
const RETURN_FORM_ID = "electronics-return-form";

type StatusFilter = "all" | ElectronicsReturn["status"];

const statusTone: Record<ElectronicsReturn["status"], "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const reasonLabel: Record<ElectronicsReturnReason, string> = {
  defective: "Defective",
  damaged: "Damaged in transit",
  wrong_item: "Wrong item shipped",
  changed_mind: "Customer changed mind",
  warranty_claim: "Warranty claim",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ElectronicsReturnsPage() {
  const { returns, customers, products, sales, serials, addReturn, updateReturnStatus } = useElectronicsData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<ElectronicsReturn | null>(null);

  // --- Add Return form state ---
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [date, setDate] = useState(() => today());
  const [reason, setReason] = useState<ElectronicsReturnReason>("defective");
  const [formErrors, setFormErrors] = useState<{ customerId?: string; productId?: string }>({});

  const filteredReturns = useMemo(() => {
    const term = search.trim().toLowerCase();
    return returns.filter((r) => {
      const matchesSearch =
        !term ||
        r.customerName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.serialNumber.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesDate = (!dateFrom || r.date >= dateFrom) && (!dateTo || r.date <= dateTo);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [returns, search, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredReturns.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedReturns = filteredReturns.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function resetForm() {
    setCustomerId("");
    setProductId("");
    setSerialNumber("");
    setDate(today());
    setReason("defective");
    setFormErrors({});
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors: { customerId?: string; productId?: string } = {};
    if (!customerId) nextErrors.customerId = "Select a customer.";
    if (!productId) nextErrors.productId = "Select a product.";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const customer = customers.find((c) => c.id === customerId);
    const product = products.find((p) => p.id === productId);
    if (!customer || !product) return;

    const relatedSale = sales.find(
      (s) => s.customerId === customerId && s.items.some((i) => i.productId === productId),
    );

    addReturn({
      id: generateId("eret"),
      productId: product.id,
      productName: product.name,
      serialNumber,
      customerId: customer.id,
      customerName: customer.name,
      saleId: relatedSale?.id,
      date,
      reason,
      status: "pending",
    });
    showToast(`Return for "${product.name}" was logged.`, "success");
    setFormOpen(false);
    resetForm();
  }

  function setStatus(id: string, status: ElectronicsReturn["status"], label: string) {
    updateReturnStatus(id, status);
    showToast(`Return ${id.toUpperCase()} was ${label}.`, status === "approved" ? "success" : "info");
    setDetailsTarget((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  const columns: DataTableColumn<ElectronicsReturn>[] = [
    {
      key: "product",
      header: "Product",
      render: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.productName}</p>
          {r.serialNumber && <p className="text-xs text-muted">SN: {r.serialNumber}</p>}
        </div>
      ),
    },
    { key: "customer", header: "Customer", render: (r) => r.customerName },
    { key: "date", header: "Date", render: (r) => r.date },
    { key: "reason", header: "Reason", render: (r) => reasonLabel[r.reason] },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge tone={statusTone[r.status]}>{r.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          {r.status === "pending" && (
            <>
              <button
                onClick={() => setStatus(r.id, "approved", "approved")}
                className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
                aria-label={`Approve return ${r.id}`}
              >
                <CheckCircle2 size={16} />
              </button>
              <button
                onClick={() => setStatus(r.id, "rejected", "rejected")}
                className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                aria-label={`Reject return ${r.id}`}
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          <button
            onClick={() => setDetailsTarget(r)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View return ${r.id}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const eligibleSerials = serials.filter((s) => s.productId === productId);

  return (
    <div>
      <PageHeader
        title="Returns"
        description={`${returns.length} returns on file`}
        actions={
          <Button
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            Add Return
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
          placeholder="Search by customer, product, or serial number..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
          aria-label="From date"
        />
        <span className="text-sm text-muted">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
          aria-label="To date"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedReturns}
        getRowKey={(r) => r.id}
        onRowClick={(r) => setDetailsTarget(r)}
        emptyTitle="No returns found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Return"
        description="Log a product return from a customer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={RETURN_FORM_ID}>
              Log Return
            </Button>
          </>
        }
      >
        <form id={RETURN_FORM_ID} onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <div>
            <label className={labelClass} htmlFor="return-customer">
              Customer *
            </label>
            <select
              id="return-customer"
              className={cn(inputClass, formErrors.customerId && "border-red-400")}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.customerId && <p className={errorClass}>{formErrors.customerId}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="return-product">
              Product *
            </label>
            <select
              id="return-product"
              className={cn(inputClass, formErrors.productId && "border-red-400")}
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setSerialNumber("");
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {formErrors.productId && <p className={errorClass}>{formErrors.productId}</p>}
          </div>

          {eligibleSerials.length > 0 && (
            <div>
              <label className={labelClass} htmlFor="return-serial">
                Serial / IMEI Number
              </label>
              <select
                id="return-serial"
                className={inputClass}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              >
                <option value="">Not applicable / unknown</option>
                {eligibleSerials.map((s) => (
                  <option key={s.id} value={s.serialNumber}>
                    {s.serialNumber} {s.imei ? `(IMEI: ${s.imei})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="return-date">
                Date *
              </label>
              <input
                id="return-date"
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="return-reason">
                Reason *
              </label>
              <select
                id="return-reason"
                className={inputClass}
                value={reason}
                onChange={(e) => setReason(e.target.value as ElectronicsReturnReason)}
              >
                {Object.entries(reasonLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </FormPanel>

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Return ${detailsTarget.id.toUpperCase()}` : "Return Details"}
        size="sm"
        footer={
          detailsTarget && detailsTarget.status === "pending" ? (
            <>
              <Button variant="secondary" onClick={() => setStatus(detailsTarget.id, "rejected", "rejected")}>
                <XCircle size={16} />
                Reject
              </Button>
              <Button onClick={() => setStatus(detailsTarget.id, "approved", "approved")}>
                <CheckCircle2 size={16} />
                Approve
              </Button>
            </>
          ) : undefined
        }
      >
        {detailsTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Product</span>
              <span className="font-medium text-foreground">{detailsTarget.productName}</span>
            </div>
            {detailsTarget.serialNumber && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Serial Number</span>
                <span className="font-medium text-foreground">{detailsTarget.serialNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted">Customer</span>
              <span className="font-medium text-foreground">{detailsTarget.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Date</span>
              <span className="font-medium text-foreground">{detailsTarget.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Reason</span>
              <span className="font-medium text-foreground">{reasonLabel[detailsTarget.reason]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <Badge tone={statusTone[detailsTarget.status]}>{detailsTarget.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
