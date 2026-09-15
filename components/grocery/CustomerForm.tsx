"use client";

import { useState, type FormEvent } from "react";
import type { GroceryCustomer } from "@/lib/types/grocery";
import { cn } from "@/lib/utils/cn";

export interface CustomerFormOutput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
}

function toFormState(customer?: GroceryCustomer): FormState {
  return {
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
  };
}

interface CustomerFormProps {
  formId: string;
  initialCustomer?: GroceryCustomer;
  onSubmit: (customer: CustomerFormOutput) => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";
const errorClass = "mt-1 text-xs text-red-600";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CustomerForm({ formId, initialCustomer, onSubmit }: CustomerFormProps) {
  const [values, setValues] = useState<FormState>(() => toFormState(initialCustomer));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) nextErrors.name = "Customer name is required.";
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
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      address: values.address.trim() || undefined,
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className={labelClass} htmlFor="customer-name">
          Customer Name *
        </label>
        <input
          id="customer-name"
          className={cn(inputClass, errors.name && "border-red-400")}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Maria Alvarez"
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="customer-phone">
          Phone *
        </label>
        <input
          id="customer-phone"
          className={cn(inputClass, errors.phone && "border-red-400")}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 555-0110"
        />
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="customer-email">
          Email
        </label>
        <input
          id="customer-email"
          className={cn(inputClass, errors.email && "border-red-400")}
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="maria.alvarez@example.com"
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      <div>
        <label className={labelClass} htmlFor="customer-address">
          Address
        </label>
        <input
          id="customer-address"
          className={inputClass}
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="12 Elm St"
        />
      </div>
    </form>
  );
}
