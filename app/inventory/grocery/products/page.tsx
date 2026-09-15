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
import { ProductForm, type ProductFormOutput } from "@/components/grocery/ProductForm";
import { ExpiryBadge } from "@/components/grocery/ExpiryBadge";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import { generateId } from "@/lib/utils/id";
import type { GroceryProduct } from "@/lib/types/grocery";

const PAGE_SIZE = 8;
const PRODUCT_FORM_ID = "grocery-product-form";

type StockFilter = "all" | "low" | "out";

export default function GroceryProductsPage() {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct } = useGroceryData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);

  const [panel, setPanel] = useState<{ mode: "add" | "edit"; product?: GroceryProduct } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroceryProduct | null>(null);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const brandName = (id?: string) => (id ? brands.find((b) => b.id === id)?.name ?? "—" : "—");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.barcode.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || p.brandId === brandFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stockQty > 0 && p.stockQty <= p.reorderLevel) ||
        (stockFilter === "out" && p.stockQty === 0);
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setCategoryFilter("");
    setBrandFilter("");
    setStockFilter("all");
    setPage(1);
  }

  function handleFormSubmit(values: ProductFormOutput) {
    if (panel?.mode === "edit" && panel.product) {
      updateProduct(panel.product.id, values);
      showToast(`"${values.name}" was updated.`, "success");
    } else {
      addProduct({ id: generateId("gp"), ...values });
      showToast(`"${values.name}" was added to Products.`, "success");
    }
    setPanel(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    showToast(`"${deleteTarget.name}" was deleted.`, "success");
    setDeleteTarget(null);
  }

  const columns: DataTableColumn<GroceryProduct>[] = [
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
    { key: "category", header: "Category", render: (p) => categoryName(p.categoryId) },
    { key: "brand", header: "Brand", render: (p) => brandName(p.brandId) },
    {
      key: "unit",
      header: "Unit",
      render: (p) => (p.weight ? `${p.weight} ${p.unit}` : p.unit),
    },
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
    { key: "price", header: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    { key: "expiry", header: "Expiry", render: (p) => <ExpiryBadge expiryDate={p.expiryDate} /> },
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
        description={`${products.length} products in your grocery catalog`}
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
          placeholder="Search by name, SKU, or barcode..."
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
        description="Enter the product's details for your grocery catalog."
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
