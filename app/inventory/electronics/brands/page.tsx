"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { generateId } from "@/lib/utils/id";
import type { ElectronicsBrand } from "@/lib/types/electronics";

interface BrandRow extends ElectronicsBrand {
  productCount: number;
}

export default function ElectronicsBrandsPage() {
  const { brands, products, models, addBrand, updateBrand, deleteBrand } = useElectronicsData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<ElectronicsBrand | "new" | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BrandRow | null>(null);

  const rows: BrandRow[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    return brands
      .map((b) => ({ ...b, productCount: products.filter((p) => p.brandId === b.id).length }))
      .filter((b) => !term || b.name.toLowerCase().includes(term));
  }, [brands, products, search]);

  function openAdd() {
    setNameInput("");
    setEditTarget("new");
  }

  function openEdit(brand: ElectronicsBrand) {
    setNameInput(brand.name);
    setEditTarget(brand);
  }

  function closeModal() {
    setEditTarget(null);
    setNameInput("");
  }

  function handleSave() {
    const name = nameInput.trim();
    if (!name) return;

    if (editTarget === "new") {
      addBrand({ id: generateId("ebrand"), name });
      showToast(`"${name}" brand was added.`, "success");
    } else if (editTarget) {
      updateBrand(editTarget.id, { name });
      showToast(`Brand renamed to "${name}".`, "success");
    }
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const hasModels = models.some((m) => m.brandId === deleteTarget.id);
    if (deleteTarget.productCount > 0 || hasModels) {
      showToast(
        `Can't delete "${deleteTarget.name}" — it still has products or models associated with it.`,
        "error",
      );
      setDeleteTarget(null);
      return;
    }
    deleteBrand(deleteTarget.id);
    showToast(`"${deleteTarget.name}" brand was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<BrandRow>[] = [
    { key: "name", header: "Brand" },
    { key: "productCount", header: "Products", render: (b) => `${b.productCount}` },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(b)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${b.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(b)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${b.name}`}
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
        title="Brands"
        description={`${brands.length} brands in your electronics catalog`}
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add Brand
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(b) => b.id}
        emptyTitle="No brands found"
        emptyDescription="Try a different search term, or add a new brand."
      />

      <Modal
        open={editTarget !== null}
        onClose={closeModal}
        title={editTarget === "new" ? "Add Brand" : "Edit Brand"}
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
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="brand-name">
          Brand Name
        </label>
        <input
          id="brand-name"
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="e.g. Xiaomi"
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Brand"
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
          {deleteTarget && deleteTarget.productCount > 0 && (
            <> This brand is used by {deleteTarget.productCount} product(s).</>
          )}
        </p>
      </Modal>
    </div>
  );
}
