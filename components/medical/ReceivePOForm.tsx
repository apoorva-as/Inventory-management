"use client";

import { useState, type FormEvent } from "react";
import type { MedicalPurchaseOrder } from "@/lib/types/medical";
import type { ReceivedPoLine } from "@/lib/data/medicalRepository";
import { cn } from "@/lib/utils/cn";

interface LineState {
  medicineId: string;
  medicineName: string;
  quantity: string;
  purchasePrice: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

interface ReceivePOFormProps {
  formId: string;
  po: MedicalPurchaseOrder;
  onSubmit: (receivedLines: ReceivedPoLine[], date: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReceivePOForm({ formId, po, onSubmit }: ReceivePOFormProps) {
  const [date, setDate] = useState(() => today());
  const [lines, setLines] = useState<LineState[]>(() =>
    po.items.map((item) => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: String(item.quantity),
      purchasePrice: String(item.purchasePrice),
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
    })),
  );
  const [error, setError] = useState("");

  function updateLine(index: number, changes: Partial<LineState>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...changes } : l)));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const incomplete = lines.some(
      (l) => !l.batchNumber.trim() || !l.manufacturingDate || !l.expiryDate || Number(l.quantity) <= 0,
    );
    if (incomplete) {
      setError("Every line needs a batch number, manufacturing date, expiry date, and a positive quantity.");
      return;
    }
    const invalidExpiry = lines.some((l) => l.expiryDate <= l.manufacturingDate);
    if (invalidExpiry) {
      setError("Expiry date must be after the manufacturing date for every line.");
      return;
    }
    setError("");

    const receivedLines: ReceivedPoLine[] = lines.map((l) => ({
      medicineId: l.medicineId,
      medicineName: l.medicineName,
      quantity: Number(l.quantity),
      purchasePrice: Number(l.purchasePrice),
      batchNumber: l.batchNumber.trim(),
      manufacturingDate: l.manufacturingDate,
      expiryDate: l.expiryDate,
    }));

    onSubmit(receivedLines, date);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="receive-date">
          Received Date *
        </label>
        <input
          id="receive-date"
          type="date"
          className={inputClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <p className="text-xs text-muted">
        Enter the batch each medicine arrived in. Receiving creates or updates that batch and increases
        stock — the purchase order itself never did.
      </p>

      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={line.medicineId} className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-sm font-medium text-foreground">{line.medicineName}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted">Received Qty</label>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  value={line.purchasePrice}
                  onChange={(e) => updateLine(i, { purchasePrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs text-muted">Batch Number</label>
                <input
                  className={inputClass}
                  value={line.batchNumber}
                  onChange={(e) => updateLine(i, { batchNumber: e.target.value })}
                  placeholder="BN-25X001"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Mfg. Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={line.manufacturingDate}
                  onChange={(e) => updateLine(i, { manufacturingDate: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Expiry Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={line.expiryDate}
                  onChange={(e) => updateLine(i, { expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className={cn(errorClass, "text-sm")}>{error}</p>}
    </form>
  );
}
