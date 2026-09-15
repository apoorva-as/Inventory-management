"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/components/shared/NotificationCenter";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import type { MedicalPrescription } from "@/lib/types/medical";

type StatusFilter = "all" | MedicalPrescription["status"];

const statusTone: Record<MedicalPrescription["status"], "success" | "warning"> = {
  fulfilled: "success",
  pending: "warning",
};

export default function MedicalPrescriptionsPage() {
  const { prescriptions, updatePrescriptionStatus } = useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [detailsTarget, setDetailsTarget] = useState<MedicalPrescription | null>(null);

  const filteredPrescriptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prescriptions.filter((p) => {
      const matchesSearch =
        !term ||
        p.customerName.toLowerCase().includes(term) ||
        p.doctorName.toLowerCase().includes(term) ||
        p.medicines.some((m) => m.medicineName.toLowerCase().includes(term));
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  function markFulfilled(id: string, customerName: string) {
    updatePrescriptionStatus(id, "fulfilled");
    showToast(`Prescription for "${customerName}" marked as fulfilled.`, "success");
    setDetailsTarget((prev) => (prev && prev.id === id ? { ...prev, status: "fulfilled" } : prev));
  }

  const columns: DataTableColumn<MedicalPrescription>[] = [
    {
      key: "customer",
      header: "Patient",
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.customerName}</p>
          <p className="text-xs text-muted">{p.doctorName}</p>
        </div>
      ),
    },
    { key: "date", header: "Date", render: (p) => p.date },
    { key: "medicines", header: "Medicines", render: (p) => `${p.medicines.length} item(s)` },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          {p.status === "pending" && (
            <button
              onClick={() => markFulfilled(p.id, p.customerName)}
              className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
              aria-label={`Mark prescription for ${p.customerName} as fulfilled`}
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button
            onClick={() => setDetailsTarget(p)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View prescription for ${p.customerName}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        description={`${prescriptions.length} prescriptions on file`}
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, doctor, or medicine..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filteredPrescriptions}
        getRowKey={(p) => p.id}
        onRowClick={(p) => setDetailsTarget(p)}
        emptyTitle="No prescriptions found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Prescription — ${detailsTarget.customerName}` : "Prescription Details"}
        size="md"
        footer={
          detailsTarget && detailsTarget.status === "pending" ? (
            <Button onClick={() => markFulfilled(detailsTarget.id, detailsTarget.customerName)}>
              <CheckCircle2 size={16} />
              Mark as Fulfilled
            </Button>
          ) : undefined
        }
      >
        {detailsTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted">Prescribing Doctor</p>
                <p className="font-medium text-foreground">{detailsTarget.doctorName}</p>
              </div>
              <div className="text-right">
                <p className="text-muted">Date</p>
                <p className="font-medium text-foreground">{detailsTarget.date}</p>
              </div>
            </div>
            <Badge tone={statusTone[detailsTarget.status]}>{detailsTarget.status}</Badge>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-3 py-2 font-medium text-muted">Medicine</th>
                    <th className="px-3 py-2 text-right font-medium text-muted">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsTarget.medicines.map((item) => (
                    <tr key={item.medicineId} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{item.medicineName}</td>
                      <td className="px-3 py-2 text-right text-foreground">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
