"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { OrderStatus } from "@/lib/types/shared";
import type {
  MedicalBatch,
  MedicalCustomer,
  MedicalMedicine,
  MedicalPrescription,
  MedicalSaleLineItem,
} from "@/lib/types/medical";
import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/shared/Button";
import { PrescriptionRequiredBadge } from "@/components/medical/PrescriptionRequiredBadge";
import { getMedicineTotalStock } from "@/lib/utils/medicalStock";
import { allocateFefo } from "@/lib/utils/medicalFefo";

export interface SaleFormOutput {
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  items: MedicalSaleLineItem[];
  total: number;
  prescriptionId?: string;
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
  batches: MedicalBatch[];
  prescriptions: MedicalPrescription[];
  onSubmit: (sale: SaleFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SaleForm({ formId, customers, medicines, batches, prescriptions, onSubmit }: SaleFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(() => today());
  const [status, setStatus] = useState<OrderStatus>("completed");
  const [rows, setRows] = useState<ItemRow[]>(() => [newRow()]);
  const [prescriptionId, setPrescriptionId] = useState("");
  const [rxOverride, setRxOverride] = useState(false);
  const [errors, setErrors] = useState<{
    customerId?: string;
    date?: string;
    items?: string;
    prescription?: string;
    rowErrors?: Record<string, string>;
  }>({});

  const pendingPrescriptions = useMemo(
    () => prescriptions.filter((p) => p.status === "pending" && p.customerId === customerId),
    [prescriptions, customerId],
  );

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
    updateRow(key, { medicineId, unitPrice: medicine ? String(medicine.sellingPrice) : "" });
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
    const nextErrors: typeof errors = {};
    if (!customerId) nextErrors.customerId = "Select a customer.";
    if (!date) nextErrors.date = "Select a date.";

    const validRows = rows.filter((r) => r.medicineId && Number(r.quantity) > 0 && r.unitPrice !== "");
    if (validRows.length === 0) {
      nextErrors.items = "Add at least one medicine with a quantity and unit price.";
    }

    if (status === "completed") {
      const rowErrors: Record<string, string> = {};
      for (const r of validRows) {
        const result = allocateFefo(batches, r.medicineId, Number(r.quantity));
        if (result.shortfall > 0) {
          const inStock = getMedicineTotalStock(batches, r.medicineId);
          rowErrors[r.key] = `Only ${inStock} in stock.`;
        }
      }
      if (Object.keys(rowErrors).length > 0) nextErrors.rowErrors = rowErrors;
    }

    if (requiresPrescription && !prescriptionId && !rxOverride) {
      nextErrors.prescription = "Link a pending prescription or confirm the walk-in override below.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const items: MedicalSaleLineItem[] = rows
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
      prescriptionId: prescriptionId || undefined,
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
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPrescriptionId("");
            }}
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
        <p className="mt-1 text-xs text-muted">
          A completed sale draws stock from the earliest-expiring batch first (FEFO).
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
        <div className="space-y-2">
          {rows.map((row) => {
            const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
            const medicine = medicines.find((m) => m.id === row.medicineId);
            const inStock = medicine ? getMedicineTotalStock(batches, medicine.id) : null;
            const rowError = errors.rowErrors?.[row.key];
            return (
              <div key={row.key} className="rounded-lg border border-border p-2">
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
                          {m.name} ({getMedicineTotalStock(batches, m.id)} in stock)
                        </option>
                      ))}
                    </select>
                    {medicine && (
                      <div className="mt-1 flex items-center gap-2">
                        <PrescriptionRequiredBadge required={medicine.prescriptionRequired} />
                        {inStock !== null && <span className="text-xs text-muted">{inStock} in stock</span>}
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
                {rowError && <p className={errorClass}>{rowError}</p>}
              </div>
            );
          })}
        </div>
        {errors.items && <p className={errorClass}>{errors.items}</p>}
      </div>

      {requiresPrescription && (
        <div className="space-y-2 rounded-lg bg-accent-soft px-3 py-2 text-accent">
          <p className="text-xs">One or more selected medicines require a valid prescription to dispense.</p>
          <div>
            <label className="mb-1 block text-xs" htmlFor="sale-prescription">
              Link Pending Prescription
            </label>
            <select
              id="sale-prescription"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              value={prescriptionId}
              onChange={(e) => setPrescriptionId(e.target.value)}
              disabled={!customerId}
            >
              <option value="">No prescription linked</option>
              {pendingPrescriptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.doctorName} — {p.date} ({p.medicines.length} item(s))
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={rxOverride}
              onChange={(e) => setRxOverride(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Dispense without a linked prescription (walk-in override)
          </label>
          {errors.prescription && <p className={errorClass}>{errors.prescription}</p>}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg bg-accent-soft px-3 py-2">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-base font-semibold text-accent">{formatCurrency(total)}</span>
      </div>
    </form>
  );
}
