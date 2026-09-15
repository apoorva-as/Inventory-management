"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/components/shared/NotificationCenter";
import { MedicineForm, type MedicineFormOutput } from "@/components/medical/MedicineForm";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";

const MEDICINE_FORM_ID = "medical-new-entry-form";

export default function MedicalNewEntryPage() {
  const { categories, manufacturers, addMedicine } = useMedicalData();
  const { showToast } = useToast();
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(values: MedicineFormOutput) {
    addMedicine({ id: generateId("mm"), ...values });
    showToast(`"${values.name}" was added to your Medical catalog.`, "success");
    setFormKey((k) => k + 1);
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Medical", href: "/inventory/medical/dashboard" },
          { label: "New Entry" },
        ]}
      />
      <PageHeader
        title="New Medicine Entry"
        description="Add a new medicine to your pharmacy inventory."
      />

      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-accent-soft p-3 text-accent">
          <PackagePlus size={20} />
          <p className="text-sm font-medium">
            Fields marked with * are required before this medicine can be saved.
          </p>
        </div>

        <MedicineForm
          key={formKey}
          formId={MEDICINE_FORM_ID}
          categories={categories}
          manufacturers={manufacturers}
          onSubmit={handleSubmit}
        />

        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button type="submit" form={MEDICINE_FORM_ID}>
            Save Medicine
          </Button>
        </div>
      </div>
    </div>
  );
}
