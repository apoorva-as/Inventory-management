"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import type { MedicalManufacturer } from "@/lib/types/medical";

interface ManufacturerRow extends MedicalManufacturer {
  medicineCount: number;
}

export default function MedicalManufacturersPage() {
  const { manufacturers, medicines, addManufacturer, updateManufacturer, deleteManufacturer } =
    useMedicalData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<MedicalManufacturer | "new" | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManufacturerRow | null>(null);

  const rows: ManufacturerRow[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    return manufacturers
      .map((m) => ({ ...m, medicineCount: medicines.filter((med) => med.manufacturerId === m.id).length }))
      .filter((m) => !term || m.name.toLowerCase().includes(term));
  }, [manufacturers, medicines, search]);

  function openAdd() {
    setNameInput("");
    setEditTarget("new");
  }

  function openEdit(manufacturer: MedicalManufacturer) {
    setNameInput(manufacturer.name);
    setEditTarget(manufacturer);
  }

  function closeModal() {
    setEditTarget(null);
    setNameInput("");
  }

  function handleSave() {
    const name = nameInput.trim();
    if (!name) return;

    if (editTarget === "new") {
      addManufacturer({ id: generateId("mfr"), name });
      showToast(`"${name}" manufacturer was added.`, "success");
    } else if (editTarget) {
      updateManufacturer(editTarget.id, { name });
      showToast(`Manufacturer renamed to "${name}".`, "success");
    }
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.medicineCount > 0) {
      showToast(
        `Can't delete "${deleteTarget.name}" — ${deleteTarget.medicineCount} medicine(s) still use it.`,
        "error",
      );
      setDeleteTarget(null);
      return;
    }
    deleteManufacturer(deleteTarget.id);
    showToast(`"${deleteTarget.name}" manufacturer was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<ManufacturerRow>[] = [
    { key: "name", header: "Manufacturer" },
    { key: "medicineCount", header: "Medicines", render: (m) => `${m.medicineCount}` },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(m)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${m.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(m)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${m.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manufacturers"
        description={`${manufacturers.length} medicine manufacturers`}
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add Manufacturer
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manufacturers..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(m) => m.id}
        emptyTitle="No manufacturers found"
        emptyDescription="Try a different search term, or add a new manufacturer."
      />

      <Modal
        open={editTarget !== null}
        onClose={closeModal}
        title={editTarget === "new" ? "Add Manufacturer" : "Edit Manufacturer"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!nameInput.trim()}>
              Save
            </Button>
          </>
        }
      >
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="manufacturer-name">
          Manufacturer Name
        </label>
        <input
          id="manufacturer-name"
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="e.g. Cipla Ltd."
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Manufacturer"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
          {deleteTarget && deleteTarget.medicineCount > 0 && (
            <> This manufacturer is used by {deleteTarget.medicineCount} medicine(s).</>
          )}
        </p>
      </Modal>
    </div>
  );
}
