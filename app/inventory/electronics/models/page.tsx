"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { generateId } from "@/lib/utils/id";
import { cn } from "@/lib/utils/cn";
import type { ElectronicsModel } from "@/lib/types/electronics";

interface ModelRow extends ElectronicsModel {
  productCount: number;
  warrantyLabel: string;
  keySpecs: string[];
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";
const labelClass = "mb-1 block text-sm font-medium text-foreground";

export default function ElectronicsModelsPage() {
  const { models, brands, categories, products, addModel, updateModel, deleteModel } = useElectronicsData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editTarget, setEditTarget] = useState<ElectronicsModel | "new" | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ModelRow | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<ModelRow | null>(null);

  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? "—";
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const rows: ModelRow[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    return models
      .map((m) => {
        const modelProducts = products.filter((p) => p.modelId === m.id);
        const warrantyMonths = [...new Set(modelProducts.map((p) => p.warrantyMonths))];
        const warrantyLabel =
          warrantyMonths.length === 0
            ? "—"
            : warrantyMonths.length === 1
              ? `${warrantyMonths[0]} mo`
              : `${Math.min(...warrantyMonths)}–${Math.max(...warrantyMonths)} mo`;
        const keySpecs = modelProducts[0]
          ? Object.entries(modelProducts[0].specifications)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
          : [];
        return { ...m, productCount: modelProducts.length, warrantyLabel, keySpecs };
      })
      .filter((m) => {
        const matchesSearch = !term || m.name.toLowerCase().includes(term);
        const matchesBrand = !brandFilter || m.brandId === brandFilter;
        const matchesCategory = !categoryFilter || m.categoryId === categoryFilter;
        return matchesSearch && matchesBrand && matchesCategory;
      });
  }, [models, products, search, brandFilter, categoryFilter]);

  function resetFilters() {
    setSearch("");
    setBrandFilter("");
    setCategoryFilter("");
  }

  function openAdd() {
    setNameInput("");
    setBrandInput("");
    setCategoryInput("");
    setEditTarget("new");
  }

  function openEdit(model: ElectronicsModel) {
    setNameInput(model.name);
    setBrandInput(model.brandId);
    setCategoryInput(model.categoryId);
    setEditTarget(model);
  }

  function closeModal() {
    setEditTarget(null);
  }

  function handleSave() {
    const name = nameInput.trim();
    if (!name || !brandInput || !categoryInput) return;

    if (editTarget === "new") {
      addModel({ id: generateId("emodel"), name, brandId: brandInput, categoryId: categoryInput });
      showToast(`"${name}" model was added.`, "success");
    } else if (editTarget) {
      updateModel(editTarget.id, { name, brandId: brandInput, categoryId: categoryInput });
      showToast(`Model renamed to "${name}".`, "success");
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
    deleteModel(deleteTarget.id);
    showToast(`"${deleteTarget.name}" model was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<ModelRow>[] = [
    { key: "name", header: "Model" },
    { key: "brand", header: "Brand", render: (m) => brandName(m.brandId) },
    { key: "category", header: "Category", render: (m) => categoryName(m.categoryId) },
    { key: "productCount", header: "Products", render: (m) => `${m.productCount}` },
    { key: "warranty", header: "Warranty", render: (m) => m.warrantyLabel },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setDetailsTarget(m)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View ${m.name}`}
          >
            <Eye size={16} />
          </button>
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
        title="Models"
        description={`${models.length} product lines across your electronics catalog`}
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add Model
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(m) => m.id}
        onRowClick={(m) => setDetailsTarget(m)}
        emptyTitle="No models found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Modal
        open={editTarget !== null}
        onClose={closeModal}
        title={editTarget === "new" ? "Add Model" : "Edit Model"}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!nameInput.trim() || !brandInput || !categoryInput}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="model-name">
              Model Name
            </label>
            <input
              id="model-name"
              autoFocus
              className={inputClass}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Galaxy Tab S9"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="model-brand">
              Brand
            </label>
            <select
              id="model-brand"
              className={inputClass}
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="model-category">
              Category
            </label>
            <select
              id="model-category"
              className={inputClass}
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Model"
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
            <> This model is used by {deleteTarget.productCount} product(s).</>
          )}
        </p>
      </Modal>

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? detailsTarget.name : "Model Details"}
        size="sm"
      >
        {detailsTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Brand</span>
              <span className="font-medium text-foreground">{brandName(detailsTarget.brandId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Category</span>
              <span className="font-medium text-foreground">{categoryName(detailsTarget.categoryId)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Products</span>
              <span className="font-medium text-foreground">{detailsTarget.productCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Warranty</span>
              <span className="font-medium text-foreground">{detailsTarget.warrantyLabel}</span>
            </div>
            {detailsTarget.keySpecs.length > 0 && (
              <div>
                <p className="mb-1 text-muted">Key Specs</p>
                <div className="flex flex-wrap gap-1.5">
                  {detailsTarget.keySpecs.map((spec) => (
                    <Badge key={spec} tone="neutral" className={cn("font-normal")}>
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
