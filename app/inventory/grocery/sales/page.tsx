"use client";

import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { SaleForm, type SaleFormOutput } from "@/components/grocery/SaleForm";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { generateId } from "@/lib/utils/id";
import type { GrocerySale } from "@/lib/types/grocery";
import type { OrderStatus } from "@/lib/types/shared";

const PAGE_SIZE = 8;
const SALE_FORM_ID = "grocery-sale-form";

const statusTone: Record<OrderStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  cancelled: "danger",
};

export default function GrocerySalesPage() {
  const { sales, customers, products, addSale } = useGroceryData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<GrocerySale | null>(null);

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((s) => {
      const matchesSearch =
        !term ||
        s.customerName.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        s.items.some((i) => i.productName.toLowerCase().includes(term));
      const matchesCustomer = !customerFilter || s.customerId === customerFilter;
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesCustomer && matchesStatus;
    });
  }, [sales, search, customerFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSales = filteredSales.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCustomerFilter("");
    setStatusFilter("");
    setPage(1);
  }

  function handleFormSubmit(values: SaleFormOutput) {
    addSale({ id: generateId("gs"), ...values });
    showToast(`Sale to "${values.customerName}" was recorded.`, "success");
    setFormOpen(false);
  }

  const columns: DataTableColumn<GrocerySale>[] = [
    {
      key: "id",
      header: "Sale",
      render: (s) => (
        <div>
          <p className="font-medium text-foreground">{s.id.toUpperCase()}</p>
          <p className="text-xs text-muted">{s.date}</p>
        </div>
      ),
    },
    { key: "customer", header: "Customer", render: (s) => s.customerName },
    { key: "items", header: "Items", render: (s) => `${s.items.length} product(s)` },
    { key: "total", header: "Total", render: (s) => `$${s.total.toFixed(2)}` },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end">
          <button
            onClick={() => setDetailsTarget(s)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View sale ${s.id}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales"
        description={`${sales.length} sales recorded`}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            Record Sale
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
          placeholder="Search by customer, sale ID, or product..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={customerFilter}
          onChange={(e) => {
            setCustomerFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
        rows={pagedSales}
        getRowKey={(s) => s.id}
        onRowClick={(s) => setDetailsTarget(s)}
        emptyTitle="No sales found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Record Sale"
        description="Log a new sale to a customer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={SALE_FORM_ID}>
              Record Sale
            </Button>
          </>
        }
      >
        {formOpen && (
          <SaleForm
            formId={SALE_FORM_ID}
            customers={customers}
            products={products}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Sale ${detailsTarget.id.toUpperCase()}` : "Sale Details"}
        size="md"
      >
        {detailsTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted">Customer</p>
                <p className="font-medium text-foreground">{detailsTarget.customerName}</p>
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
                    <th className="px-3 py-2 font-medium text-muted">Product</th>
                    <th className="px-3 py-2 font-medium text-muted">Qty</th>
                    <th className="px-3 py-2 font-medium text-muted">Unit Price</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsTarget.items.map((item) => (
                    <tr key={item.productId} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.productName}</td>
                      <td className="px-3 py-2 text-foreground">{item.quantity}</td>
                      <td className="px-3 py-2 text-foreground">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-foreground">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3 py-2">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-base font-semibold text-accent">${detailsTarget.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
