"use client";

import { useMemo, useState, type FormEvent } from "react";
import type {
  MedicalBatch,
  MedicalMedicine,
  MedicalStockAdjustmentReason,
  MedicalStockAdjustmentType,
} from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface StockAdjustmentFormOutput {
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  type: MedicalStockAdjustmentType;
  quantity: number;
  reason: MedicalStockAdjustmentReason;
  date: string;
  notes?: string;
}

interface StockAdjustmentFormProps {
  formId: string;
  medicines: MedicalMedicine[];
  batches: MedicalBatch[];
  onSubmit: (adjustment: StockAdjustmentFormOutput) => void;
}

const REASON_OPTIONS: MedicalStockAdjustmentReason[] = [
  "Damaged",
  "Expired",
  "Lost",
  "Manual Correction",
  "Stock Count",
  "Other",
];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StockAdjustmentForm({ formId, medicines, batches, onSubmit }: StockAdjustmentFormProps) {
  const [medicineId, setMedicineId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [type, setType] = useState<MedicalStockAdjustmentType>("decrease");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<MedicalStockAdjustmentReason>("Damaged");
  const [date, setDate] = useState(() => today());
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ medicineId?: string; batchId?: string; quantity?: string }>({});

  const medicineBatches = useMemo(
    () => batches.filter((b) => b.medicineId === medicineId),
    [batches, medicineId],
  );
  const selectedBatch = medicineBatches.find((b) => b.id === batchId);

  function validate(): boolean {
    const nextErrors: { medicineId?: string; batchId?: string; quantity?: string } = {};
    if (!medicineId) nextErrors.medicineId = "Select a medicine.";
    if (!batchId) nextErrors.batchId = "Select a batch.";
    const qty = Number(quantity);
    if (!qty || qty <= 0) nextErrors.quantity = "Enter a quantity greater than 0.";
    else if (type === "decrease" && selectedBatch && qty > selectedBatch.quantity) {
      nextErrors.quantity = `Only ${selectedBatch.quantity} in this batch.`;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const medicine = medicines.find((m) => m.id === medicineId);
    if (!medicine || !selectedBatch) return;

    onSubmit({
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchId: selectedBatch.id,
      batchNumber: selectedBatch.batchNumber,
      type,
      quantity: Number(quantity),
      reason,
      date,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="adj-medicine">
          Medicine *
        </label>
        <select
          id="adj-medicine"
          className={cn(inputClass, errors.medicineId && "border-red-400")}
          value={medicineId}
          onChange={(e) => {
            setMedicineId(e.target.value);
            setBatchId("");
          }}
        >
          <option value="">Select medicine</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {errors.medicineId && <p className={errorClass}>{errors.medicineId}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="adj-batch">
          Batch *
        </label>
        <select
          id="adj-batch"
          className={cn(inputClass, errors.batchId && "border-red-400")}
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={!medicineId}
        >
          <option value="">Select batch</option>
          {medicineBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batchNumber} — {b.quantity} on hand, exp. {b.expiryDate}
            </option>
          ))}
        </select>
        {errors.batchId && <p className={errorClass}>{errors.batchId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="adj-type">
            Adjustment Type
          </label>
          <select
            id="adj-type"
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as MedicalStockAdjustmentType)}
          >
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="adj-quantity">
            Quantity *
          </label>
          <input
            id="adj-quantity"
            type="number"
            min="1"
            className={cn(inputClass, errors.quantity && "border-red-400")}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="adj-reason">
            Reason
          </label>
          <select
            id="adj-reason"
            className={inputClass}
            value={reason}
            onChange={(e) => setReason(e.target.value as MedicalStockAdjustmentReason)}
          >
            {REASON_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="adj-date">
            Date
          </label>
          <input
            id="adj-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="adj-notes">
          Notes
        </label>
        <textarea
          id="adj-notes"
          className={inputClass}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional details..."
        />
      </div>
    </form>
  );
}
