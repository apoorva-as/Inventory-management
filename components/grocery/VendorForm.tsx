"use client";

import { useState, type FormEvent } from "react";
import type { GroceryVendor } from "@/lib/types/grocery";
import { cn } from "@/lib/utils/cn";

export interface VendorFormOutput {
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
}

interface FormState {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

function toFormState(vendor?: GroceryVendor): FormState {
  return {
    name: vendor?.name ?? "",
    contactPerson: vendor?.contactPerson ?? "",
    phone: vendor?.phone ?? "",
    email: vendor?.email ?? "",
    address: vendor?.address ?? "",
  };
}

interface VendorFormProps {
  formId: string;
  initialVendor?: GroceryVendor;
  onSubmit: (vendor: VendorFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function VendorForm({ formId, initialVendor, onSubmit }: VendorFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialVendor));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Vendor name is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone number is required.";
    if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim()))
      nextErrors.email = "Enter a valid email address.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      contactPerson: values.contactPerson.trim() || undefined,
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      address: values.address.trim() || undefined,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="vendor-name">
          Vendor Name *
        </label>
        <input
          id="vendor-name"
          className={cn(inputClass, errors.name && "border-red-400")}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Golden Harvest Distributors"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="vendor-contact">
          Contact Person
        </label>
        <input
          id="vendor-contact"
          className={inputClass}
          value={values.contactPerson}
          onChange={(e) => update("contactPerson", e.target.value)}
          placeholder="e.g. Rachel Kim"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="vendor-phone">
          Phone *
        </label>
        <input
          id="vendor-phone"
          className={cn(inputClass, errors.phone && "border-red-400")}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 555-0201"
        />
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="vendor-email">
          Email
        </label>
        <input
          id="vendor-email"
          className={cn(inputClass, errors.email && "border-red-400")}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="rachel@goldenharvest.example"
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="vendor-address">
          Address
        </label>
        <input
          id="vendor-address"
          className={inputClass}
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="400 Industrial Rd"
        />
      </div>
    </form>
  );
}
