"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { OrderStatus } from "@/lib/types/shared";
import type { MedicalMedicine, MedicalPurchaseLineItem, MedicalSupplier } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";
import { Button } from "@/components/shared/Button";

export interface PurchaseFormOutput {
  vendorId: string;
  vendorName: string;
  date: string;
  status: OrderStatus;
  items: MedicalPurchaseLineItem[];
  total: number;
}

interface ItemRow {
  key: string;
  medicineId: string;
  quantity: string;
  unitPrice: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

let rowIdCounter = 0;
function newRow(): ItemRow {
  return {
    key: `row-${++rowIdCounter}`,
    medicineId: "",
    quantity: "1",
    unitPrice: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
  };
}

interface PurchaseFormProps {
  formId: string;
  suppliers: MedicalSupplier[];
  medicines: MedicalMedicine[];
  onSubmit: (purchase: PurchaseFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseForm({ formId, suppliers, medicines, onSubmit }: PurchaseFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(() => today());
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [rows, setRows] = useState<ItemRow[]>(() => [newRow()]);
  const [errors, setErrors] = useState<{ supplierId?: string; date?: string; items?: string }>({});

  function updateRow(key: string, changes: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function handleMedicineChange(key: string, medicineId: string) {
    const medicine = medicines.find((m) => m.id === medicineId);
    updateRow(key, { medicineId, unitPrice: medicine ? String(medicine.purchasePrice) : "" });
  }

  const total = rows.reduce((sum, r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  function validate(): boolean {
    const nextErrors: { supplierId?: string; date?: string; items?: string } = {};
    if (!supplierId) nextErrors.supplierId = "Select a supplier.";
    if (!date) nextErrors.date = "Select a date.";

    const validRows = rows.filter(
      (r) =>
        r.medicineId &&
        Number(r.quantity) > 0 &&
        r.unitPrice !== "" &&
        r.batchNumber.trim() &&
        r.manufacturingDate &&
        r.expiryDate,
    );
    if (validRows.length === 0)
      nextErrors.items = "Add at least one medicine with a quantity, unit price, and batch details.";
    const invalidExpiry = rows.some(
      (r) => r.manufacturingDate && r.expiryDate && r.expiryDate <= r.manufacturingDate,
    );
    if (invalidExpiry) nextErrors.items = "Expiry date must be after the manufacturing date.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const items: MedicalPurchaseLineItem[] = rows
      .filter(
        (r) =>
          r.medicineId &&
          Number(r.quantity) > 0 &&
          r.unitPrice !== "" &&
          r.batchNumber.trim() &&
          r.manufacturingDate &&
          r.expiryDate,
      )
      .map((r) => {
        const medicine = medicines.find((m) => m.id === r.medicineId);
        return {
          productId: r.medicineId,
          productName: medicine?.name ?? "Unknown medicine",
          quantity: Number(r.quantity),
          unitPrice: Number(r.unitPrice),
          batchNumber: r.batchNumber.trim(),
          manufacturingDate: r.manufacturingDate,
          expiryDate: r.expiryDate,
        };
      });

    const computedTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    onSubmit({
      vendorId: supplier.id,
      vendorName: supplier.name,
      date,
      status,
      items,
      total: Number(computedTotal.toFixed(2)),
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="purchase-supplier">
            Supplier *
          </label>
          <select
            id="purchase-supplier"
            className={cn(inputClass, errors.supplierId && "border-red-400")}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.supplierId && <p className={errorClass}>{errors.supplierId}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="purchase-date">
            Date *
          </label>
          <input
            id="purchase-date"
            type="date"
            className={cn(inputClass, errors.date && "border-red-400")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className={errorClass}>{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="purchase-status">
          Status
        </label>
        <select
          id="purchase-status"
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <p className="mt-1 text-xs text-muted">
          Only a completed purchase creates/updates a batch and increases stock.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Medicines *</span>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            <Plus size={14} />
            Add Item
          </Button>
        </div>
        <div className="space-y-3">
          {rows.map((row) => {
            const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
            return (
              <div key={row.key} className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted">Medicine</label>
                    <select
                      className={inputClass}
                      value={row.medicineId}
                      onChange={(e) => handleMedicineChange(row.key, e.target.value)}
                    >
                      <option value="">Select medicine</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="mb-1 block text-xs text-muted">Qty</label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-muted">Unit Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={inputClass}
                      value={row.unitPrice}
                      onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })}
                    />
                  </div>
                  <p className="w-16 pb-2 text-right text-sm text-muted">{formatCurrency(lineTotal)}</p>
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    disabled={rows.length === 1}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Batch Number</label>
                    <input
                      className={inputClass}
                      value={row.batchNumber}
                      onChange={(e) => updateRow(row.key, { batchNumber: e.target.value })}
                      placeholder="BN-25X001"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Mfg. Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={row.manufacturingDate}
                      onChange={(e) => updateRow(row.key, { manufacturingDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">Expiry Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={row.expiryDate}
                      onChange={(e) => updateRow(row.key, { expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {errors.items && <p className={errorClass}>{errors.items}</p>}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3 py-2">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-base font-semibold text-accent">{formatCurrency(total)}</span>
      </div>
    </form>
  );
}
