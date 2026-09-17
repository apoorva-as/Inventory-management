"use client";

import { useState, type FormEvent } from "react";
import type {
  GroceryProduct,
  StockAdjustmentReason,
  StockAdjustmentType,
} from "@/lib/types/grocery";
import { cn } from "@/lib/utils/cn";

const REASON_OPTIONS: StockAdjustmentReason[] = [
  "Damaged",
  "Lost",
  "Wastage",
  "Stock Count",
  "Manual Correction",
];

export interface StockAdjustmentFormOutput {
  productId: string;
  productName: string;
  type: StockAdjustmentType;
  reason: StockAdjustmentReason;
  quantity: number;
  date: string;
  notes?: string;
}

interface FormState {
  productId: string;
  type: StockAdjustmentType;
  reason: StockAdjustmentReason;
  quantity: string;
  date: string;
  notes: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toFormState(): FormState {
  return { productId: "", type: "decrease", reason: "Damaged", quantity: "", date: today(), notes: "" };
}

interface StockAdjustmentFormProps {
  formId: string;
  products: GroceryProduct[];
  onSubmit: (adjustment: StockAdjustmentFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

export function StockAdjustmentForm({ formId, products, onSubmit }: StockAdjustmentFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const selectedProduct = products.find((p) => p.id === values.productId);

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.productId) nextErrors.productId = "Select a product.";
    if (!values.date) nextErrors.date = "Select a date.";

    const quantity = Number(values.quantity);
    if (values.quantity === "" || quantity <= 0) {
      nextErrors.quantity = "Enter a quantity greater than 0.";
    } else if (values.type === "decrease" && selectedProduct && quantity > selectedProduct.stockQty) {
      nextErrors.quantity = `Only ${selectedProduct.stockQty} in stock.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const product = products.find((p) => p.id === values.productId);
    if (!product) return;

    onSubmit({
      productId: product.id,
      productName: product.name,
      type: values.type,
      reason: values.reason,
      quantity: Number(values.quantity),
      date: values.date,
      notes: values.notes.trim() || undefined,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="adjustment-product">
          Product *
        </label>
        <select
          id="adjustment-product"
          className={cn(inputClass, errors.productId && "border-red-400")}
          value={values.productId}
          onChange={(e) => update("productId", e.target.value)}
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.stockQty} {p.unit} in stock)
            </option>
          ))}
        </select>
        {errors.productId && <p className={errorClass}>{errors.productId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="adjustment-type">
            Type *
          </label>
          <select
            id="adjustment-type"
            className={inputClass}
            value={values.type}
            onChange={(e) => update("type", e.target.value as StockAdjustmentType)}
          >
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="adjustment-reason">
            Reason *
          </label>
          <select
            id="adjustment-reason"
            className={inputClass}
            value={values.reason}
            onChange={(e) => update("reason", e.target.value as StockAdjustmentReason)}
          >
            {REASON_OPTIONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="adjustment-quantity">
            Quantity *
          </label>
          <input
            id="adjustment-quantity"
            type="number"
            min="1"
            className={cn(inputClass, errors.quantity && "border-red-400")}
            value={values.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
          {errors.quantity && <p className={errorClass}>{errors.quantity}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="adjustment-date">
            Date *
          </label>
          <input
            id="adjustment-date"
            type="date"
            className={cn(inputClass, errors.date && "border-red-400")}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
          />
          {errors.date && <p className={errorClass}>{errors.date}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="adjustment-notes">
          Notes
        </label>
        <textarea
          id="adjustment-notes"
          rows={3}
          className={inputClass}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Optional details..."
        />
      </div>
    </form>
  );
}
