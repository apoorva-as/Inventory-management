"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { FormPanel } from "@/components/shared/FormPanel";
import { Modal } from "@/components/shared/Modal";
import { useToast } from "@/components/shared/NotificationCenter";
import { ProductForm, type ProductFormOutput } from "@/components/electronics/ProductForm";
import { SerialImeiBadge } from "@/components/electronics/SerialImeiBadge";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import { generateId } from "@/lib/utils/id";
import { formatCurrency } from "@/lib/utils/formatters";
import type { ElectronicsProduct } from "@/lib/types/electronics";

const PAGE_SIZE = 8;
const PRODUCT_FORM_ID = "electronics-product-form";

type StockFilter = "all" | "low" | "out";
type WarrantyFilter = "all" | "covered" | "none";

export default function ElectronicsProductsPage() {
  const {
    products,
    categories,
    brands,
    models,
    sales,
    purchases,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useElectronicsData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [warrantyFilter, setWarrantyFilter] = useState<WarrantyFilter>("all");
  const [page, setPage] = useState(1);

  const [panel, setPanel] = useState<{ mode: "add" | "edit"; product?: ElectronicsProduct } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ElectronicsProduct | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const brandName = (id?: string) => brands.find((b) => b.id === id)?.name ?? "—";
  const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? "—";

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const matchesModel = !modelFilter || p.modelId === modelFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stockQty > 0 && p.stockQty <= p.reorderLevel) ||
        (stockFilter === "out" && p.stockQty === 0);
      const matchesWarranty =
        warrantyFilter === "all" ||
        (warrantyFilter === "covered" && p.warrantyMonths > 0) ||
        (warrantyFilter === "none" && p.warrantyMonths === 0);
      return matchesSearch && matchesCategory && matchesBrand && matchesModel && matchesStock && matchesWarranty;
    });
  }, [products, search, categoryFilter, brandFilter, modelFilter, stockFilter, warrantyFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setBrandFilter("");
    setModelFilter("");
    setStockFilter("all");
    setWarrantyFilter("all");
    setPage(1);
  }

  function handleFormSubmit(values: ProductFormOutput) {
    if (panel?.mode === "edit" && panel.product) {
      updateProduct(panel.product.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addProduct({ id: generateId("ep"), ...values });
      showToast(`"${values.name}" was added to Products.`, "success");
    }
    setPanel(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const isReferenced =
      sales.some((s) => s.items.some((i) => i.productId === deleteTarget.id)) ||
      purchases.some((p) => p.items.some((i) => i.productId === deleteTarget.id));
    if (isReferenced) {
      showToast(`Can't delete "${deleteTarget.name}" — it has purchase or sale records on file.`, "error");
      setDeleteTarget(null);
      return;
    }
    deleteProduct(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<ElectronicsProduct>[] = [
    {
      key: "name",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-medium text-foreground">{p.name}</p>
          <p className="text-xs text-muted">{p.sku}</p>
        </div>
      ),
    },
    { key: "brand", header: "Brand", render: (p) => brandName(p.brandId) },
    { key: "model", header: "Model", render: (p) => modelName(p.modelId) },
    { key: "category", header: "Category", render: (p) => categoryName(p.categoryId) },
    { key: "price", header: "Price", render: (p) => formatCurrency(p.price) },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span>{p.stockQty}</span>
          {p.stockQty === 0 && <Badge tone="danger">Out</Badge>}
          {p.stockQty > 0 && p.stockQty <= p.reorderLevel && <Badge tone="warning">Low</Badge>}
        </div>
      ),
    },
    { key: "warranty", header: "Warranty", render: (p) => `${p.warrantyMonths} mo` },
    { key: "tracking", header: "Tracking", render: (p) => <SerialImeiBadge product={p} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setPanel({ mode: "edit", product: p })}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${p.name}`}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${p.name}`}
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
        title="Products"
        description={`${products.length} products in your electronics catalog`}
        actions={
          <Button onClick={() => setPanel({ mode: "add" })}>
            <Plus size={16} />
            Add Product
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
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
          value={modelFilter}
          onChange={(e) => {
            setModelFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Models</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value as StockFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select
          value={warrantyFilter}
          onChange={(e) => {
            setWarrantyFilter(e.target.value as WarrantyFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Warranty</option>
          <option value="covered">Has Warranty</option>
          <option value="none">No Warranty</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedProducts}
        getRowKey={(p) => p.id}
        emptyTitle="No products found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <FormPanel
        open={panel !== null}
        onClose={() => setPanel(null)}
        title={panel?.mode === "edit" ? "Edit Product" : "Add Product"}
        description="Enter the product's catalog details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setPanel(null)}>
              Cancel
            </Button>
            <Button type="submit" form={PRODUCT_FORM_ID}>
              {panel?.mode === "edit" ? "Save Changes" : "Add Product"}
            </Button>
          </>
        }
      >
        {panel && (
          <ProductForm
            formId={PRODUCT_FORM_ID}
            categories={categories}
            brands={brands}
            models={models}
            initialProduct={panel.product}
            onSubmit={handleFormSubmit}
          />
        )}
      </FormPanel>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
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
          Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
