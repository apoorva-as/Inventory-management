"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { MedicalCustomer, MedicalMedicine } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/shared/Button";

export interface PrescriptionFormOutput {
  customerId: string;
  customerName: string;
  doctorName: string;
  date: string;
  medicines: { medicineId: string; medicineName: string; quantity: number }[];
}

interface RowState {
  key: string;
  medicineId: string;
  quantity: string;
}

let rowIdCounter = 0;
function newRow(): RowState {
  return { key: `row-${++rowIdCounter}`, medicineId: "", quantity: "1" };
}

interface PrescriptionFormProps {
  formId: string;
  customers: MedicalCustomer[];
  medicines: MedicalMedicine[];
  onSubmit: (prescription: PrescriptionFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PrescriptionForm({ formId, customers, medicines, onSubmit }: PrescriptionFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState(() => today());
  const [rows, setRows] = useState<RowState[]>(() => [newRow()]);
  const [errors, setErrors] = useState<{ customerId?: string; doctorName?: string; items?: string }>({});

  function updateRow(key: string, changes: Partial<RowState>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function validate(): boolean {
    const nextErrors: { customerId?: string; doctorName?: string; items?: string } = {};
    if (!customerId) nextErrors.customerId = "Select a patient.";
    if (!doctorName.trim()) nextErrors.doctorName = "Doctor name is required.";
    const validRows = rows.filter((r) => r.medicineId && Number(r.quantity) > 0);
    if (validRows.length === 0) nextErrors.items = "Add at least one medicine with a quantity.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const meds = rows
      .filter((r) => r.medicineId && Number(r.quantity) > 0)
      .map((r) => {
        const medicine = medicines.find((m) => m.id === r.medicineId);
        return {
          medicineId: r.medicineId,
          medicineName: medicine?.name ?? "Unknown medicine",
          quantity: Number(r.quantity),
        };
      });

    onSubmit({
      customerId: customer.id,
      customerName: customer.name,
      doctorName: doctorName.trim(),
      date,
      medicines: meds,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="rx-customer">
            Patient *
          </label>
          <select
            id="rx-customer"
            className={cn(inputClass, errors.customerId && "border-red-400")}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select patient</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.customerId && <p className={errorClass}>{errors.customerId}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="rx-date">
            Date
          </label>
          <input
            id="rx-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="rx-doctor">
          Prescribing Doctor *
        </label>
        <input
          id="rx-doctor"
          className={cn(inputClass, errors.doctorName && "border-red-400")}
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          placeholder="Dr. Jane Smith"
        />
        {errors.doctorName && <p className={errorClass}>{errors.doctorName}</p>}
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
          {rows.map((row) => (
            <div key={row.key} className="flex items-end gap-2 rounded-lg border border-border p-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted">Medicine</label>
                <select
                  className={inputClass}
                  value={row.medicineId}
                  onChange={(e) => updateRow(row.key, { medicineId: e.target.value })}
                >
                  <option value="">Select medicine</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs text-muted">Qty</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                />
              </div>
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
          ))}
        </div>
        {errors.items && <p className={errorClass}>{errors.items}</p>}
      </div>
    </form>
  );
}
