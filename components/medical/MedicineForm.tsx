"use client";

import { useState, type FormEvent } from "react";
import type { MedicalCategory, MedicalManufacturer, MedicalMedicine } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface MedicineFormOutput {
  name: string;
  genericName: string;
  sku: string;
  categoryId: string;
  manufacturerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: number;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  prescriptionRequired: boolean;
}

interface FormState {
  name: string;
  genericName: string;
  sku: string;
  categoryId: string;
  manufacturerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: string;
  price: string;
  costPrice: string;
  stockQty: string;
  reorderLevel: string;
  prescriptionRequired: boolean;
}

function toFormState(medicine?: MedicalMedicine): FormState {
  return {
    name: medicine?.name ?? "",
    genericName: medicine?.genericName ?? "",
    sku: medicine?.sku ?? "",
    categoryId: medicine?.categoryId ?? "",
    manufacturerId: medicine?.manufacturerId ?? "",
    batchNumber: medicine?.batchNumber ?? "",
    manufacturingDate: medicine?.manufacturingDate ?? "",
    expiryDate: medicine?.expiryDate ?? "",
    mrp: medicine?.mrp != null ? String(medicine.mrp) : "",
    price: medicine?.price != null ? String(medicine.price) : "",
    costPrice: medicine?.costPrice != null ? String(medicine.costPrice) : "",
    stockQty: medicine?.stockQty != null ? String(medicine.stockQty) : "",
    reorderLevel: medicine?.reorderLevel != null ? String(medicine.reorderLevel) : "",
    prescriptionRequired: medicine?.prescriptionRequired ?? false,
  };
}

interface MedicineFormProps {
  formId: string;
  categories: MedicalCategory[];
  manufacturers: MedicalManufacturer[];
  initialMedicine?: MedicalMedicine;
  onSubmit: (medicine: MedicineFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

export function MedicineForm({
  formId,
  categories,
  manufacturers,
  initialMedicine,
  onSubmit,
}: MedicineFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialMedicine));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Medicine name is required.";
    if (!values.genericName.trim()) nextErrors.genericName = "Generic name is required.";
    if (!values.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!values.categoryId) nextErrors.categoryId = "Select a category.";
    if (!values.manufacturerId) nextErrors.manufacturerId = "Select a manufacturer.";
    if (!values.batchNumber.trim()) nextErrors.batchNumber = "Batch number is required.";
    if (!values.manufacturingDate) nextErrors.manufacturingDate = "Manufacturing date is required.";
    if (!values.expiryDate) nextErrors.expiryDate = "Expiry date is required.";
    if (
      values.manufacturingDate &&
      values.expiryDate &&
      values.expiryDate <= values.manufacturingDate
    ) {
      nextErrors.expiryDate = "Expiry date must be after the manufacturing date.";
    }
    if (values.mrp === "" || Number(values.mrp) < 0) nextErrors.mrp = "Enter a valid MRP.";
    if (values.price === "" || Number(values.price) < 0) nextErrors.price = "Enter a valid selling price.";
    if (values.price !== "" && values.mrp !== "" && Number(values.price) > Number(values.mrp)) {
      nextErrors.price = "Selling price can't exceed MRP.";
    }
    if (values.costPrice === "" || Number(values.costPrice) < 0)
      nextErrors.costPrice = "Enter a valid purchase price.";
    if (values.stockQty === "" || Number(values.stockQty) < 0)
      nextErrors.stockQty = "Enter a valid stock quantity.";
    if (values.reorderLevel === "" || Number(values.reorderLevel) < 0)
      nextErrors.reorderLevel = "Enter a valid reorder level.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      genericName: values.genericName.trim(),
      sku: values.sku.trim(),
      categoryId: values.categoryId,
      manufacturerId: values.manufacturerId,
      batchNumber: values.batchNumber.trim(),
      manufacturingDate: values.manufacturingDate,
      expiryDate: values.expiryDate,
      mrp: Number(values.mrp),
      price: Number(values.price),
      costPrice: Number(values.costPrice),
      stockQty: Number(values.stockQty),
      reorderLevel: Number(values.reorderLevel),
      prescriptionRequired: values.prescriptionRequired,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="medicine-name">
          Medicine Name *
        </label>
        <input
          id="medicine-name"
          className={cn(inputClass, errors.name && "border-red-400")}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Paracetamol 500mg Tablets"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-generic">
            Generic Name *
          </label>
          <input
            id="medicine-generic"
            className={cn(inputClass, errors.genericName && "border-red-400")}
            value={values.genericName}
            onChange={(e) => update("genericName", e.target.value)}
            placeholder="e.g. Paracetamol"
          />
          {errors.genericName && <p className={errorClass}>{errors.genericName}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-sku">
            SKU *
          </label>
          <input
            id="medicine-sku"
            className={cn(inputClass, errors.sku && "border-red-400")}
            value={values.sku}
            onChange={(e) => update("sku", e.target.value)}
            placeholder="MED-PARA-500"
          />
          {errors.sku && <p className={errorClass}>{errors.sku}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-category">
            Category *
          </label>
          <select
            id="medicine-category"
            className={cn(inputClass, errors.categoryId && "border-red-400")}
            value={values.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className={errorClass}>{errors.categoryId}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-manufacturer">
            Manufacturer *
          </label>
          <select
            id="medicine-manufacturer"
            className={cn(inputClass, errors.manufacturerId && "border-red-400")}
            value={values.manufacturerId}
            onChange={(e) => update("manufacturerId", e.target.value)}
          >
            <option value="">Select manufacturer</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.manufacturerId && <p className={errorClass}>{errors.manufacturerId}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="medicine-batch">
          Batch Number *
        </label>
        <input
          id="medicine-batch"
          className={cn(inputClass, errors.batchNumber && "border-red-400")}
          value={values.batchNumber}
          onChange={(e) => update("batchNumber", e.target.value)}
          placeholder="BN-24A017"
        />
        {errors.batchNumber && <p className={errorClass}>{errors.batchNumber}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-mfg-date">
            Manufacturing Date *
          </label>
          <input
            id="medicine-mfg-date"
            type="date"
            className={cn(inputClass, errors.manufacturingDate && "border-red-400")}
            value={values.manufacturingDate}
            onChange={(e) => update("manufacturingDate", e.target.value)}
          />
          {errors.manufacturingDate && <p className={errorClass}>{errors.manufacturingDate}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-expiry-date">
            Expiry Date *
          </label>
          <input
            id="medicine-expiry-date"
            type="date"
            className={cn(inputClass, errors.expiryDate && "border-red-400")}
            value={values.expiryDate}
            onChange={(e) => update("expiryDate", e.target.value)}
          />
          {errors.expiryDate && <p className={errorClass}>{errors.expiryDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-mrp">
            MRP ($) *
          </label>
          <input
            id="medicine-mrp"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.mrp && "border-red-400")}
            value={values.mrp}
            onChange={(e) => update("mrp", e.target.value)}
          />
          {errors.mrp && <p className={errorClass}>{errors.mrp}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-price">
            Selling Price ($) *
          </label>
          <input
            id="medicine-price"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.price && "border-red-400")}
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
          />
          {errors.price && <p className={errorClass}>{errors.price}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-cost">
            Purchase Price ($) *
          </label>
          <input
            id="medicine-cost"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.costPrice && "border-red-400")}
            value={values.costPrice}
            onChange={(e) => update("costPrice", e.target.value)}
          />
          {errors.costPrice && <p className={errorClass}>{errors.costPrice}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-stock">
            Stock Quantity *
          </label>
          <input
            id="medicine-stock"
            type="number"
            min="0"
            className={cn(inputClass, errors.stockQty && "border-red-400")}
            value={values.stockQty}
            onChange={(e) => update("stockQty", e.target.value)}
          />
          {errors.stockQty && <p className={errorClass}>{errors.stockQty}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-reorder">
            Reorder Level *
          </label>
          <input
            id="medicine-reorder"
            type="number"
            min="0"
            className={cn(inputClass, errors.reorderLevel && "border-red-400")}
            value={values.reorderLevel}
            onChange={(e) => update("reorderLevel", e.target.value)}
          />
          {errors.reorderLevel && <p className={errorClass}>{errors.reorderLevel}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={values.prescriptionRequired}
          onChange={(e) => update("prescriptionRequired", e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Prescription required to dispense
      </label>
    </form>
  );
}
