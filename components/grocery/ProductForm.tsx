"use client";

import { useState, type FormEvent } from "react";
import type { GroceryBrand, GroceryCategory, GroceryProduct, GroceryUnit } from "@/lib/types/grocery";
import { cn } from "@/lib/utils/cn";

const UNIT_OPTIONS: { value: GroceryUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre" },
  { value: "packet", label: "Packet" },
  { value: "piece", label: "Piece" },
];

export interface ProductFormOutput {
  name: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  unit: GroceryUnit;
  weight?: number;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  barcode: string;
  expiryDate?: string;
}

interface FormState {
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  unit: GroceryUnit;
  weight: string;
  price: string;
  costPrice: string;
  stockQty: string;
  reorderLevel: string;
  barcode: string;
  expiryDate: string;
}

function toFormState(product?: GroceryProduct): FormState {
  return {
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
    unit: product?.unit ?? "kg",
    weight: product?.weight != null ? String(product.weight) : "",
    price: product?.price != null ? String(product.price) : "",
    costPrice: product?.costPrice != null ? String(product.costPrice) : "",
    stockQty: product?.stockQty != null ? String(product.stockQty) : "",
    reorderLevel: product?.reorderLevel != null ? String(product.reorderLevel) : "",
    barcode: product?.barcode ?? "",
    expiryDate: product?.expiryDate ?? "",
  };
}

interface ProductFormProps {
  formId: string;
  categories: GroceryCategory[];
  brands: GroceryBrand[];
  initialProduct?: GroceryProduct;
  onSubmit: (product: ProductFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

export function ProductForm({ formId, categories, brands, initialProduct, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialProduct));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Product name is required.";
    if (!values.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!values.categoryId) nextErrors.categoryId = "Select a category.";
    if (!values.barcode.trim()) nextErrors.barcode = "Barcode is required.";
    if (values.price === "" || Number(values.price) < 0) nextErrors.price = "Enter a valid price.";
    if (values.costPrice === "" || Number(values.costPrice) < 0)
      nextErrors.costPrice = "Enter a valid cost price.";
    if (values.stockQty === "" || Number(values.stockQty) < 0)
      nextErrors.stockQty = "Enter a valid stock quantity.";
    if (values.reorderLevel === "" || Number(values.reorderLevel) < 0)
      nextErrors.reorderLevel = "Enter a valid reorder level.";
    if (values.weight !== "" && Number(values.weight) < 0)
      nextErrors.weight = "Weight can't be negative.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
      unit: values.unit,
      weight: values.weight !== "" ? Number(values.weight) : undefined,
      price: Number(values.price),
      costPrice: Number(values.costPrice),
      stockQty: Number(values.stockQty),
      reorderLevel: Number(values.reorderLevel),
      barcode: values.barcode.trim(),
      expiryDate: values.expiryDate || undefined,
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
          placeholder="e.g. Basmati Rice"
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
            placeholder="GRC-RICE-01"
          />
          {errors.sku && <p className={errorClass}>{errors.sku}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="product-barcode">
            Barcode *
          </label>
          <input
            id="product-barcode"
            className={cn(inputClass, errors.barcode && "border-red-400")}
            value={values.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            placeholder="8901030875021"
          />
          {errors.barcode && <p className={errorClass}>{errors.barcode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <div>
          <label className={labelClass} htmlFor="product-brand">
            Brand
          </label>
          <select
            id="product-brand"
            className={inputClass}
            value={values.brandId}
            onChange={(e) => update("brandId", e.target.value)}
          >
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="product-unit">
            Unit *
          </label>
          <select
            id="product-unit"
            className={inputClass}
            value={values.unit}
            onChange={(e) => update("unit", e.target.value as GroceryUnit)}
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="product-weight">
            Weight / Volume
          </label>
          <input
            id="product-weight"
            type="number"
            step="0.01"
            min="0"
            className={cn(inputClass, errors.weight && "border-red-400")}
            value={values.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="e.g. 5"
          />
          {errors.weight && <p className={errorClass}>{errors.weight}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
            Cost Price ($) *
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
        <label className={labelClass} htmlFor="product-expiry">
          Expiry Date
        </label>
        <input
          id="product-expiry"
          type="date"
          className={inputClass}
          value={values.expiryDate}
          onChange={(e) => update("expiryDate", e.target.value)}
        />
      </div>
    </form>
  );
}
