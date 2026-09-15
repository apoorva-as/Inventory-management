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
import type { ElectronicsCategory } from "@/lib/types/electronics";

interface CategoryRow extends ElectronicsCategory {
  productCount: number;
}

export default function ElectronicsCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useElectronicsData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<ElectronicsCategory | "new" | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const rows: CategoryRow[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length }))
      .filter((c) => !term || c.name.toLowerCase().includes(term));
  }, [categories, products, search]);

  function openAdd() {
    setNameInput("");
    setEditTarget("new");
  }

  function openEdit(category: ElectronicsCategory) {
    setNameInput(category.name);
    setEditTarget(category);
  }

  function closeModal() {
    setEditTarget(null);
    setNameInput("");
  }

  function handleSave() {
    const name = nameInput.trim();
    if (!name) return;

    if (editTarget === "new") {
      addCategory({ id: generateId("ecat"), name });
      showToast(`"${name}" category was added.`, "success");
    } else if (editTarget) {
      updateCategory(editTarget.id, { name });
      showToast(`Category renamed to "${name}".`, "success");
    }
    closeModal();
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.productCount > 0) {
      showToast(
        `Can't delete "${deleteTarget.name}" — ${deleteTarget.productCount} product(s) still use it.`,
        "error",
      );
      setDeleteTarget(null);
      return;
    }
    deleteCategory(deleteTarget.id);
    showToast(`"${deleteTarget.name}" category was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<CategoryRow>[] = [
    { key: "name", header: "Category" },
    { key: "productCount", header: "Products", render: (c) => `${c.productCount}` },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => openEdit(c)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${c.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${c.name}`}
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
        title="Categories"
        description={`${categories.length} product categories`}
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add Category
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(c) => c.id}
        emptyTitle="No categories found"
        emptyDescription="Try a different search term, or add a new category."
      />

      <Modal
        open={editTarget !== null}
        onClose={closeModal}
        title={editTarget === "new" ? "Add Category" : "Edit Category"}
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
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="category-name">
          Category Name
        </label>
        <input
          id="category-name"
          autoFocus
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="e.g. Smart Home Devices"
        />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
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
            <> This category is used by {deleteTarget.productCount} product(s).</>
          )}
        </p>
      </Modal>
    </div>
  );
}
