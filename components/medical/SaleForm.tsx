"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { BaseLineItem, OrderStatus } from "@/lib/types/shared";
import type { MedicalCustomer, MedicalMedicine } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/shared/Button";
import { PrescriptionRequiredBadge } from "@/components/medical/PrescriptionRequiredBadge";

export interface SaleFormOutput {
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  items: BaseLineItem[];
  total: number;
}

interface ItemRow {
  key: string;
  medicineId: string;
  quantity: string;
  unitPrice: string;
}

let rowIdCounter = 0;
function newRow(): ItemRow {
  return { key: `row-${++rowIdCounter}`, medicineId: "", quantity: "1", unitPrice: "" };
}

interface SaleFormProps {
  formId: string;
  customers: MedicalCustomer[];
  medicines: MedicalMedicine[];
  onSubmit: (sale: SaleFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SaleForm({ formId, customers, medicines, onSubmit }: SaleFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(() => today());
  const [status, setStatus] = useState<OrderStatus>("completed");
  const [rows, setRows] = useState<ItemRow[]>(() => [newRow()]);
  const [errors, setErrors] = useState<{ customerId?: string; date?: string; items?: string }>({});

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
    updateRow(key, { medicineId, unitPrice: medicine ? String(medicine.price) : "" });
  }

  const total = rows.reduce((sum, r) => {
    const qty = Number(r.quantity) || 0;
    const price = Number(r.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const requiresPrescription = rows.some((r) => {
    const medicine = medicines.find((m) => m.id === r.medicineId);
    return medicine?.prescriptionRequired;
  });

  function validate(): boolean {
    const nextErrors: { customerId?: string; date?: string; items?: string } = {};
    if (!customerId) nextErrors.customerId = "Select a customer.";
    if (!date) nextErrors.date = "Select a date.";

    const validRows = rows.filter((r) => r.medicineId && Number(r.quantity) > 0 && r.unitPrice !== "");
    if (validRows.length === 0)
      nextErrors.items = "Add at least one medicine with a quantity and unit price.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const items: BaseLineItem[] = rows
      .filter((r) => r.medicineId && Number(r.quantity) > 0 && r.unitPrice !== "")
      .map((r) => {
        const medicine = medicines.find((m) => m.id === r.medicineId);
        return {
          productId: r.medicineId,
          productName: medicine?.name ?? "Unknown medicine",
          quantity: Number(r.quantity),
          unitPrice: Number(r.unitPrice),
        };
      });

    const computedTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    onSubmit({
      customerId: customer.id,
      customerName: customer.name,
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
          <label className={labelClass} htmlFor="sale-customer">
            Customer *
          </label>
          <select
            id="sale-customer"
            className={cn(inputClass, errors.customerId && "border-red-400")}
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
          {errors.customerId && <p className={errorClass}>{errors.customerId}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="sale-date">
            Date *
          </label>
          <input
            id="sale-date"
            type="date"
            className={cn(inputClass, errors.date && "border-red-400")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className={errorClass}>{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="sale-status">
          Status
        </label>
        <select
          id="sale-status"
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Medicines *</span>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            <Plus size={14} />
            Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {rows.map((row) => {
            const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
            const medicine = medicines.find((m) => m.id === row.medicineId);
            return (
              <div key={row.key} className="flex items-end gap-2 rounded-lg border border-border p-2">
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
                  {medicine && (
                    <div className="mt-1">
                      <PrescriptionRequiredBadge required={medicine.prescriptionRequired} />
                    </div>
                  )}
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
                  <label className="mb-1 block text-xs text-muted">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={inputClass}
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })}
                  />
                </div>
                <p className="w-16 pb-2 text-right text-sm text-muted">${lineTotal.toFixed(2)}</p>
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
            );
          })}
        </div>
        {errors.items && <p className={errorClass}>{errors.items}</p>}
      </div>

      {requiresPrescription && (
        <div className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
          One or more selected medicines require a valid prescription to dispense.
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3 py-2">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-base font-semibold text-accent">${total.toFixed(2)}</span>
      </div>
    </form>
  );
}
