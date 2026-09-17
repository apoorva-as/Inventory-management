"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { MedicalSale } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface SalesReturnFormOutput {
  saleId: string;
  customerId: string;
  customerName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  reason: string;
  date: string;
}

const REASON_OPTIONS = ["Damaged", "Wrong Item", "Customer Changed Mind", "Expired", "Other"];

interface SalesReturnFormProps {
  formId: string;
  sales: MedicalSale[];
  onSubmit: (ret: SalesReturnFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SalesReturnForm({ formId, sales, onSubmit }: SalesReturnFormProps) {
  const completedSales = useMemo(() => sales.filter((s) => s.status === "completed"), [sales]);

  const [saleId, setSaleId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [date, setDate] = useState(() => today());
  const [errors, setErrors] = useState<{ saleId?: string; medicineId?: string; quantity?: string }>({});

  const selectedSale = completedSales.find((s) => s.id === saleId);
  const selectedItem = selectedSale?.items.find((i) => i.productId === medicineId);

  function validate(): boolean {
    const nextErrors: { saleId?: string; medicineId?: string; quantity?: string } = {};
    if (!saleId) nextErrors.saleId = "Select the original sale.";
    if (!medicineId) nextErrors.medicineId = "Select a medicine from that sale.";
    const qty = Number(quantity);
    if (!qty || qty <= 0) nextErrors.quantity = "Enter a quantity greater than 0.";
    else if (selectedItem && qty > selectedItem.quantity) {
      nextErrors.quantity = `Only ${selectedItem.quantity} were sold on this sale.`;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedSale || !selectedItem) return;

    onSubmit({
      saleId: selectedSale.id,
      customerId: selectedSale.customerId,
      customerName: selectedSale.customerName,
      medicineId: selectedItem.productId,
      medicineName: selectedItem.productName,
      quantity: Number(quantity),
      reason,
      date,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="return-sale">
          Original Sale *
        </label>
        <select
          id="return-sale"
          className={cn(inputClass, errors.saleId && "border-red-400")}
          value={saleId}
          onChange={(e) => {
            setSaleId(e.target.value);
            setMedicineId("");
          }}
        >
          <option value="">Select sale</option>
          {completedSales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id.toUpperCase()} — {s.customerName} ({s.date})
            </option>
          ))}
        </select>
        {errors.saleId && <p className={errorClass}>{errors.saleId}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="return-medicine">
          Medicine *
        </label>
        <select
          id="return-medicine"
          className={cn(inputClass, errors.medicineId && "border-red-400")}
          value={medicineId}
          onChange={(e) => setMedicineId(e.target.value)}
          disabled={!selectedSale}
        >
          <option value="">Select medicine</option>
          {selectedSale?.items.map((i) => (
            <option key={i.productId} value={i.productId}>
              {i.productName} (sold {i.quantity})
            </option>
          ))}
        </select>
        {errors.medicineId && <p className={errorClass}>{errors.medicineId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="return-quantity">
            Quantity *
          </label>
          <input
            id="return-quantity"
            type="number"
            min="1"
            className={cn(inputClass, errors.quantity && "border-red-400")}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="return-date">
            Date
          </label>
          <input
            id="return-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="return-reason">
          Reason
        </label>
        <select
          id="return-reason"
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
