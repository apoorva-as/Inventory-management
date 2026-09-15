"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/components/shared/NotificationCenter";
import { ProductForm, type ProductFormOutput } from "@/components/grocery/ProductForm";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { generateId } from "@/lib/utils/id";

const PRODUCT_FORM_ID = "grocery-new-entry-form";

export default function GroceryNewEntryPage() {
  const { categories, brands, addProduct } = useGroceryData();
  const { showToast } = useToast();
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(values: ProductFormOutput) {
    addProduct({ id: generateId("gp"), ...values });
    showToast(`"${values.name}" was added to your Grocery catalog.`, "success");
    setFormKey((k) => k + 1);
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Grocery", href: "/inventory/grocery/dashboard" },
          { label: "New Entry" },
        ]}
      />
      <PageHeader
        title="New Product Entry"
        description="Add a new product to your grocery inventory."
      />

      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-accent-soft p-3 text-accent">
          <PackagePlus size={20} />
          <p className="text-sm font-medium">
            Fields marked with * are required before this product can be saved.
          </p>
        </div>

        <ProductForm
          key={formKey}
          formId={PRODUCT_FORM_ID}
          categories={categories}
          brands={brands}
          onSubmit={handleSubmit}
        />

        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button type="submit" form={PRODUCT_FORM_ID}>
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}
