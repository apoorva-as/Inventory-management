"use client";

import { useState, type FormEvent } from "react";
import type { MedicalCategory, MedicalManufacturer, MedicalMedicine } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface MedicineFormOutput {
  name: string;
  genericName: string;
  brandName?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  manufacturerId: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  minimumStock: number;
  prescriptionRequired: boolean;
  active: boolean;
}

interface FormState {
  name: string;
  genericName: string;
  brandName: string;
  sku: string;
  barcode: string;
  categoryId: string;
  manufacturerId: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  mrp: string;
  minimumStock: string;
  prescriptionRequired: boolean;
  active: boolean;
}

function toFormState(medicine?: MedicalMedicine): FormState {
  return {
    name: medicine?.name ?? "",
    genericName: medicine?.genericName ?? "",
    brandName: medicine?.brandName ?? "",
    sku: medicine?.sku ?? "",
    barcode: medicine?.barcode ?? "",
    categoryId: medicine?.categoryId ?? "",
    manufacturerId: medicine?.manufacturerId ?? "",
    dosageForm: medicine?.dosageForm ?? "",
    strength: medicine?.strength ?? "",
    packSize: medicine?.packSize ?? "",
    unit: medicine?.unit ?? "",
    purchasePrice: medicine?.purchasePrice != null ? String(medicine.purchasePrice) : "",
    sellingPrice: medicine?.sellingPrice != null ? String(medicine.sellingPrice) : "",
    mrp: medicine?.mrp != null ? String(medicine.mrp) : "",
    minimumStock: medicine?.minimumStock != null ? String(medicine.minimumStock) : "",
    prescriptionRequired: medicine?.prescriptionRequired ?? false,
    active: medicine?.active ?? true,
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
    if (!values.dosageForm.trim()) nextErrors.dosageForm = "Dosage form is required.";
    if (!values.strength.trim()) nextErrors.strength = "Strength is required.";
    if (!values.packSize.trim()) nextErrors.packSize = "Pack size is required.";
    if (!values.unit.trim()) nextErrors.unit = "Unit is required.";
    if (values.mrp === "" || Number(values.mrp) < 0) nextErrors.mrp = "Enter a valid MRP.";
    if (values.sellingPrice === "" || Number(values.sellingPrice) < 0)
      nextErrors.sellingPrice = "Enter a valid selling price.";
    if (values.sellingPrice !== "" && values.mrp !== "" && Number(values.sellingPrice) > Number(values.mrp)) {
      nextErrors.sellingPrice = "Selling price can't exceed MRP.";
    }
    if (values.purchasePrice === "" || Number(values.purchasePrice) < 0)
      nextErrors.purchasePrice = "Enter a valid purchase price.";
    if (values.minimumStock === "" || Number(values.minimumStock) < 0)
      nextErrors.minimumStock = "Enter a valid minimum stock.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      genericName: values.genericName.trim(),
      brandName: values.brandName.trim() || undefined,
      sku: values.sku.trim(),
      barcode: values.barcode.trim() || undefined,
      categoryId: values.categoryId,
      manufacturerId: values.manufacturerId,
      dosageForm: values.dosageForm.trim(),
      strength: values.strength.trim(),
      packSize: values.packSize.trim(),
      unit: values.unit.trim(),
      purchasePrice: Number(values.purchasePrice),
      sellingPrice: Number(values.sellingPrice),
      mrp: Number(values.mrp),
      minimumStock: Number(values.minimumStock),
      prescriptionRequired: values.prescriptionRequired,
      active: values.active,
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
          <label className={labelClass} htmlFor="medicine-brand">
            Brand Name
          </label>
          <input
            id="medicine-brand"
            className={inputClass}
            value={values.brandName}
            onChange={(e) => update("brandName", e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <div>
          <label className={labelClass} htmlFor="medicine-barcode">
            Barcode
          </label>
          <input
            id="medicine-barcode"
            className={inputClass}
            value={values.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            placeholder="Optional"
          />
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-dosage-form">
            Dosage Form *
          </label>
          <input
            id="medicine-dosage-form"
            className={cn(inputClass, errors.dosageForm && "border-red-400")}
            value={values.dosageForm}
            onChange={(e) => update("dosageForm", e.target.value)}
            placeholder="Tablet, Capsule, Syrup..."
          />
          {errors.dosageForm && <p className={errorClass}>{errors.dosageForm}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-strength">
            Strength *
          </label>
          <input
            id="medicine-strength"
            className={cn(inputClass, errors.strength && "border-red-400")}
            value={values.strength}
            onChange={(e) => update("strength", e.target.value)}
            placeholder="500mg"
          />
          {errors.strength && <p className={errorClass}>{errors.strength}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-pack-size">
            Pack Size *
          </label>
          <input
            id="medicine-pack-size"
            className={cn(inputClass, errors.packSize && "border-red-400")}
            value={values.packSize}
            onChange={(e) => update("packSize", e.target.value)}
            placeholder="10x10"
          />
          {errors.packSize && <p className={errorClass}>{errors.packSize}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-unit">
            Unit *
          </label>
          <input
            id="medicine-unit"
            className={cn(inputClass, errors.unit && "border-red-400")}
            value={values.unit}
            onChange={(e) => update("unit", e.target.value)}
            placeholder="Strip"
          />
          {errors.unit && <p className={errorClass}>{errors.unit}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="medicine-mrp">
            MRP (₹) *
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
          <label className={labelClass} htmlFor="medicine-selling-price">
            Selling Price (₹) *
          </label>
          <input
            id="medicine-selling-price"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.sellingPrice && "border-red-400")}
            value={values.sellingPrice}
            onChange={(e) => update("sellingPrice", e.target.value)}
          />
          {errors.sellingPrice && <p className={errorClass}>{errors.sellingPrice}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="medicine-purchase-price">
            Purchase Price (₹) *
          </label>
          <input
            id="medicine-purchase-price"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.purchasePrice && "border-red-400")}
            value={values.purchasePrice}
            onChange={(e) => update("purchasePrice", e.target.value)}
          />
          {errors.purchasePrice && <p className={errorClass}>{errors.purchasePrice}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="medicine-minimum-stock">
          Minimum Stock *
        </label>
        <input
          id="medicine-minimum-stock"
          type="number"
          min="0"
          className={cn(inputClass, errors.minimumStock && "border-red-400")}
          value={values.minimumStock}
          onChange={(e) => update("minimumStock", e.target.value)}
        />
        {errors.minimumStock && <p className={errorClass}>{errors.minimumStock}</p>}
        <p className="mt-1 text-xs text-muted">
          Stock on hand is tracked per batch — see the Batches page. This is only the reorder threshold.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={values.prescriptionRequired}
            onChange={(e) => update("prescriptionRequired", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Prescription required to dispense
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => update("active", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
          Active (available for purchase &amp; sale)
        </label>
      </div>
    </form>
  );
}
