"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  ElectronicsBrand,
  ElectronicsCategory,
  ElectronicsModel,
  ElectronicsProduct,
} from "@/lib/types/electronics";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/shared/Button";

export interface ProductFormOutput {
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  warrantyMonths: number;
  hasImei: boolean;
  hasSerial: boolean;
  specifications: Record<string, string>;
}

/**
 * Per-category unit-tracking policy. This keeps the "which field should this
 * product show" decision as vertical-owned config data rather than a form
 * full of manual toggles — phones always track IMEI, laptops/monitors/
 * storage/wearables track a serial number, and audio/accessories track
 * neither.
 */
const CATEGORY_TRACKING: Record<string, "imei" | "serial" | "none"> = {
  "ecat-smartphones": "imei",
  "ecat-laptops": "serial",
  "ecat-monitors": "serial",
  "ecat-storage": "serial",
  "ecat-wearables": "serial",
  "ecat-audio": "none",
  "ecat-accessories": "none",
};

function getTrackingType(categoryId: string): "imei" | "serial" | "none" {
  return CATEGORY_TRACKING[categoryId] ?? "none";
}

interface SpecRow {
  key: string;
  specKey: string;
  specValue: string;
}

let rowIdCounter = 0;
function newSpecRow(specKey = "", specValue = ""): SpecRow {
  return { key: `spec-${++rowIdCounter}`, specKey, specValue };
}

interface FormState {
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  modelId: string;
  price: string;
  costPrice: string;
  stockQty: string;
  reorderLevel: string;
  warrantyMonths: string;
}

function toFormState(product?: ElectronicsProduct): FormState {
  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    modelId: product?.modelId ?? "",
    price: product?.price != null ? String(product.price) : "",
    costPrice: product?.costPrice != null ? String(product.costPrice) : "",
    stockQty: product?.stockQty != null ? String(product.stockQty) : "",
    reorderLevel: product?.reorderLevel != null ? String(product.reorderLevel) : "",
    warrantyMonths: product?.warrantyMonths != null ? String(product.warrantyMonths) : "12",
  };
}

function toSpecRows(product?: ElectronicsProduct): SpecRow[] {
  const entries = product ? Object.entries(product.specifications) : [];
  if (entries.length === 0) return [newSpecRow()];
  return entries.map(([k, v]) => newSpecRow(k, v));
}

interface ProductFormProps {
  formId: string;
  categories: ElectronicsCategory[];
  brands: ElectronicsBrand[];
  models: ElectronicsModel[];
  initialProduct?: ElectronicsProduct;
  onSubmit: (product: ProductFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

export function ProductForm({
  formId,
  categories,
  brands,
  models,
  initialProduct,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialProduct));
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => toSpecRows(initialProduct));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const trackingType = getTrackingType(values.categoryId);

  const availableModels = useMemo(
    () => models.filter((m) => (!values.brandId || m.brandId === values.brandId) && m.categoryId === values.categoryId),
    [models, values.brandId, values.categoryId],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpecRow(key: string, changes: Partial<SpecRow>) {
    setSpecRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...changes } : r)));
  }

  function addSpecRow() {
    setSpecRows((prev) => [...prev, newSpecRow()]);
  }

  function removeSpecRow(key: string) {
    setSpecRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Product name is required.";
    if (!values.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!values.categoryId) nextErrors.categoryId = "Select a category.";
    if (!values.brandId) nextErrors.brandId = "Select a brand.";
    if (!values.modelId) nextErrors.modelId = "Select a model.";
    if (values.price === "" || Number(values.price) <= 0) nextErrors.price = "Enter a valid selling price.";
    if (values.costPrice === "" || Number(values.costPrice) < 0)
      nextErrors.costPrice = "Enter a valid purchase price.";
    if (values.stockQty === "" || Number(values.stockQty) < 0)
      nextErrors.stockQty = "Enter a valid stock quantity.";
    if (values.reorderLevel === "" || Number(values.reorderLevel) < 0)
      nextErrors.reorderLevel = "Enter a valid reorder level.";
    if (values.warrantyMonths === "" || Number(values.warrantyMonths) < 0 || !Number.isInteger(Number(values.warrantyMonths)))
      nextErrors.warrantyMonths = "Enter a valid warranty period in whole months.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const specifications = specRows.reduce<Record<string, string>>((acc, row) => {
      const k = row.specKey.trim();
      const v = row.specValue.trim();
      if (k && v) acc[k] = v;
      return acc;
    }, {});

    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      categoryId: values.categoryId,
      brandId: values.brandId,
      modelId: values.modelId,
      price: Number(values.price),
      costPrice: Number(values.costPrice),
      stockQty: Number(values.stockQty),
      reorderLevel: Number(values.reorderLevel),
      warrantyMonths: Number(values.warrantyMonths),
      hasImei: trackingType === "imei",
      hasSerial: trackingType === "serial",
      specifications,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="product-name">
          Product Name *
        </label>
        <input
          id="product-name"
          className={cn(inputClass, errors.name && "border-red-400")}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. iPhone 15 128GB"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="product-sku">
            SKU *
          </label>
          <input
            id="product-sku"
            className={cn(inputClass, errors.sku && "border-red-400")}
            value={values.sku}
            onChange={(e) => update("sku", e.target.value)}
            placeholder="EL-IPH15-128"
          />
          {errors.sku && <p className={errorClass}>{errors.sku}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="product-category">
            Category *
          </label>
          <select
            id="product-category"
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="product-brand">
            Brand *
          </label>
          <select
            id="product-brand"
            className={cn(inputClass, errors.brandId && "border-red-400")}
            value={values.brandId}
            onChange={(e) => update("brandId", e.target.value)}
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.brandId && <p className={errorClass}>{errors.brandId}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="product-model">
            Model *
          </label>
          <select
            id="product-model"
            className={cn(inputClass, errors.modelId && "border-red-400")}
            value={values.modelId}
            onChange={(e) => update("modelId", e.target.value)}
            disabled={!values.categoryId}
          >
            <option value="">{values.categoryId ? "Select model" : "Select a category first"}</option>
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.modelId && <p className={errorClass}>{errors.modelId}</p>}
        </div>
      </div>

      {values.categoryId && (
        <div className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
          {trackingType === "imei" && "This category tracks units by IMEI (e.g. phones)."}
          {trackingType === "serial" && "This category tracks units by serial number."}
          {trackingType === "none" && "This category does not track individual unit serial numbers or IMEIs."}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="product-price">
            Selling Price ($) *
          </label>
          <input
            id="product-price"
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
          <label className={labelClass} htmlFor="product-cost">
            Purchase Price ($) *
          </label>
          <input
            id="product-cost"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.costPrice && "border-red-400")}
            value={values.costPrice}
            onChange={(e) => update("costPrice", e.target.value)}
          />
          {errors.costPrice && <p className={errorClass}>{errors.costPrice}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="product-warranty">
            Warranty (months) *
          </label>
          <input
            id="product-warranty"
            type="number"
            min="0"
            className={cn(inputClass, errors.warrantyMonths && "border-red-400")}
            value={values.warrantyMonths}
            onChange={(e) => update("warrantyMonths", e.target.value)}
          />
          {errors.warrantyMonths && <p className={errorClass}>{errors.warrantyMonths}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="product-stock">
            Stock Quantity *
          </label>
          <input
            id="product-stock"
            type="number"
            min="0"
            className={cn(inputClass, errors.stockQty && "border-red-400")}
            value={values.stockQty}
            onChange={(e) => update("stockQty", e.target.value)}
          />
          {errors.stockQty && <p className={errorClass}>{errors.stockQty}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="product-reorder">
            Reorder Level *
          </label>
          <input
            id="product-reorder"
            type="number"
            min="0"
            className={cn(inputClass, errors.reorderLevel && "border-red-400")}
            value={values.reorderLevel}
            onChange={(e) => update("reorderLevel", e.target.value)}
          />
          {errors.reorderLevel && <p className={errorClass}>{errors.reorderLevel}</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Specifications</span>
          <Button type="button" variant="secondary" size="sm" onClick={addSpecRow}>
            <Plus size={14} />
            Add Spec
          </Button>
        </div>
        <div className="space-y-2">
          {specRows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <input
                className={inputClass}
                value={row.specKey}
                onChange={(e) => updateSpecRow(row.key, { specKey: e.target.value })}
                placeholder="e.g. Storage"
              />
              <input
                className={inputClass}
                value={row.specValue}
                onChange={(e) => updateSpecRow(row.key, { specValue: e.target.value })}
                placeholder="e.g. 128GB"
              />
              <button
                type="button"
                onClick={() => removeSpecRow(row.key)}
                className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                disabled={specRows.length === 1}
                aria-label="Remove specification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
