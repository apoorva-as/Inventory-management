"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { MedicalBatch, MedicalPurchase } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface PurchaseReturnFormOutput {
  purchaseId: string;
  supplierId: string;
  supplierName: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  reason: string;
  date: string;
}

const REASON_OPTIONS = ["Damaged", "Expired", "Wrong Item", "Quality Issue", "Other"];

interface PurchaseReturnFormProps {
  formId: string;
  purchases: MedicalPurchase[];
  batches: MedicalBatch[];
  onSubmit: (ret: PurchaseReturnFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseReturnForm({ formId, purchases, batches, onSubmit }: PurchaseReturnFormProps) {
  const completedPurchases = useMemo(() => purchases.filter((p) => p.status === "completed"), [purchases]);

  const [purchaseId, setPurchaseId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [date, setDate] = useState(() => today());
  const [errors, setErrors] = useState<{ purchaseId?: string; medicineId?: string; batchId?: string; quantity?: string }>(
    {},
  );

  const selectedPurchase = completedPurchases.find((p) => p.id === purchaseId);
  const medicineBatches = useMemo(
    () => batches.filter((b) => b.medicineId === medicineId),
    [batches, medicineId],
  );
  const selectedBatch = medicineBatches.find((b) => b.id === batchId);

  function validate(): boolean {
    const nextErrors: typeof errors = {};
    if (!purchaseId) nextErrors.purchaseId = "Select the original purchase.";
    if (!medicineId) nextErrors.medicineId = "Select a medicine from that purchase.";
    if (!batchId) nextErrors.batchId = "Select the batch to return.";
    const qty = Number(quantity);
    if (!qty || qty <= 0) nextErrors.quantity = "Enter a quantity greater than 0.";
    else if (selectedBatch && qty > selectedBatch.quantity) {
      nextErrors.quantity = `Only ${selectedBatch.quantity} available in this batch.`;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedPurchase || !selectedBatch) return;
    const item = selectedPurchase.items.find((i) => i.productId === medicineId);
    if (!item) return;

    onSubmit({
      purchaseId: selectedPurchase.id,
      supplierId: selectedPurchase.vendorId,
      supplierName: selectedPurchase.vendorName,
      medicineId: item.productId,
      medicineName: item.productName,
      batchId: selectedBatch.id,
      batchNumber: selectedBatch.batchNumber,
      quantity: Number(quantity),
      reason,
      date,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="preturn-purchase">
          Original Purchase *
        </label>
        <select
          id="preturn-purchase"
          className={cn(inputClass, errors.purchaseId && "border-red-400")}
          value={purchaseId}
          onChange={(e) => {
            setPurchaseId(e.target.value);
            setMedicineId("");
            setBatchId("");
          }}
        >
          <option value="">Select purchase</option>
          {completedPurchases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id.toUpperCase()} — {p.vendorName} ({p.date})
            </option>
          ))}
        </select>
        {errors.purchaseId && <p className={errorClass}>{errors.purchaseId}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="preturn-medicine">
          Medicine *
        </label>
        <select
          id="preturn-medicine"
          className={cn(inputClass, errors.medicineId && "border-red-400")}
          value={medicineId}
          onChange={(e) => {
            setMedicineId(e.target.value);
            setBatchId("");
          }}
          disabled={!selectedPurchase}
        >
          <option value="">Select medicine</option>
          {selectedPurchase?.items.map((i) => (
            <option key={i.productId} value={i.productId}>
              {i.productName} (batch {i.batchNumber})
            </option>
          ))}
        </select>
        {errors.medicineId && <p className={errorClass}>{errors.medicineId}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="preturn-batch">
          Batch *
        </label>
        <select
          id="preturn-batch"
          className={cn(inputClass, errors.batchId && "border-red-400")}
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={!medicineId}
        >
          <option value="">Select batch</option>
          {medicineBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batchNumber} — {b.quantity} on hand
            </option>
          ))}
        </select>
        {errors.batchId && <p className={errorClass}>{errors.batchId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="preturn-quantity">
            Quantity *
          </label>
          <input
            id="preturn-quantity"
            type="number"
            min="1"
            className={cn(inputClass, errors.quantity && "border-red-400")}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="preturn-date">
            Date
          </label>
          <input
            id="preturn-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="preturn-reason">
          Reason
        </label>
        <select
          id="preturn-reason"
          className={inputClass}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {REASON_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
