"use client";

import { useState, type FormEvent } from "react";
import type { MedicalSupplier } from "@/lib/types/medical";
import { cn } from "@/lib/utils/cn";

export interface SupplierFormOutput {
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

function toFormState(supplier?: MedicalSupplier): FormState {
  return {
    name: supplier?.name ?? "",
    contactPerson: supplier?.contactPerson ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
  };
}

interface SupplierFormProps {
  formId: string;
  initialSupplier?: MedicalSupplier;
  onSubmit: (supplier: SupplierFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SupplierForm({ formId, initialSupplier, onSubmit }: SupplierFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialSupplier));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Supplier name is required.";
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
        <label className={labelClass} htmlFor="supplier-name">
          Supplier Name *
        </label>
        <input
          id="supplier-name"
          className={cn(inputClass, errors.name && "border-red-400")}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. MedPlus Pharma Distributors"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="supplier-contact">
          Contact Person
        </label>
        <input
          id="supplier-contact"
          className={inputClass}
          value={values.contactPerson}
          onChange={(e) => update("contactPerson", e.target.value)}
          placeholder="e.g. Anita Desai"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="supplier-phone">
          Phone *
        </label>
        <input
          id="supplier-phone"
          className={cn(inputClass, errors.phone && "border-red-400")}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 555-0401"
        />
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="supplier-email">
          Email
        </label>
        <input
          id="supplier-email"
          className={cn(inputClass, errors.email && "border-red-400")}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="anita@medplusdist.example"
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="supplier-address">
          Address
        </label>
        <input
          id="supplier-address"
          className={inputClass}
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="12 Industrial Park Rd"
        />
      </div>
    </form>
  );
}
