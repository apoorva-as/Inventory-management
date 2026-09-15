"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/shared/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Modal } from "@/components/shared/Modal";
import { WarrantyBadge } from "@/components/electronics/WarrantyBadge";
import { useElectronicsData } from "@/lib/context/ElectronicsDataProvider";
import type { ElectronicsSerial } from "@/lib/types/electronics";

const PAGE_SIZE = 10;

type StatusFilter = "all" | ElectronicsSerial["status"];

const statusTone: Record<ElectronicsSerial["status"], "success" | "accent" | "neutral"> = {
  in_stock: "success",
  sold: "accent",
  returned: "neutral",
};

const statusLabel: Record<ElectronicsSerial["status"], string> = {
  in_stock: "In Stock",
  sold: "Sold",
  returned: "Returned",
};

export default function ElectronicsSerialNumbersPage() {
  const { serials, products, brands, categories } = useElectronicsData();

  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [detailsTarget, setDetailsTarget] = useState<ElectronicsSerial | null>(null);

  const productOf = (id: string) => products.find((p) => p.id === id);
  const brandName = (id?: string) => brands.find((b) => b.id === id)?.name ?? "—";
  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const filteredSerials = useMemo(() => {
    const term = search.trim().toLowerCase();
    return serials.filter((s) => {
      const product = products.find((p) => p.id === s.productId);
      const matchesSearch =
        !term ||
        s.serialNumber.toLowerCase().includes(term) ||
        (s.imei ?? "").toLowerCase().includes(term) ||
        s.productName.toLowerCase().includes(term);
      const matchesProduct = !productFilter || s.productId === productFilter;
      const matchesBrand = !brandFilter || product?.brandId === brandFilter;
      const matchesCategory = !categoryFilter || product?.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesProduct && matchesBrand && matchesCategory && matchesStatus;
    });
  }, [serials, products, search, productFilter, brandFilter, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSerials.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedSerials = filteredSerials.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setProductFilter("");
    setBrandFilter("");
    setCategoryFilter("");
    setStatusFilter("all");
    setPage(1);
  }

  const columns: DataTableColumn<ElectronicsSerial>[] = [
    {
      key: "product",
      header: "Product",
      render: (s) => {
        const product = productOf(s.productId);
        return (
          <div>
            <p className="font-medium text-foreground">{s.productName}</p>
            <p className="text-xs text-muted">
              {brandName(product?.brandId)} · {categoryName(product?.categoryId)}
            </p>
          </div>
        );
      },
    },
    {
      key: "identifier",
      header: "Serial / IMEI",
      render: (s) => (
        <div>
          <p className="text-foreground">{s.serialNumber || "—"}</p>
          {s.imei && <p className="text-xs text-muted">IMEI: {s.imei}</p>}
        </div>
      ),
    },
    { key: "customer", header: "Customer", render: (s) => s.customerName ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge tone={statusTone[s.status]}>{statusLabel[s.status]}</Badge>,
    },
    { key: "warranty", header: "Warranty", render: (s) => <WarrantyBadge warrantyExpiry={s.warrantyExpiry} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end">
          <button
            onClick={() => setDetailsTarget(s)}
            className="rounded-lg p-1.5 text-muted hover:bg-accent-soft hover:text-accent"
            aria-label={`View unit ${s.serialNumber}`}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Serial Numbers" description={`${serials.length} tracked units`} />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by serial number, IMEI, or product..."
          containerClassName="max-w-md"
        />
      </div>

      <FilterBar onClear={resetFilters}>
        <select
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All Products</option>
          {products
            .filter((p) => p.hasImei || p.hasSerial)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="all">All Statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="sold">Sold</option>
          <option value="returned">Returned</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={pagedSerials}
        getRowKey={(s) => s.id}
        onRowClick={(s) => setDetailsTarget(s)}
        emptyTitle="No units found"
        emptyDescription="Try a different search term or clear your filters."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? detailsTarget.productName : "Unit Details"}
        size="sm"
      >
        {detailsTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Serial Number</span>
              <span className="font-medium text-foreground">{detailsTarget.serialNumber || "—"}</span>
            </div>
            {detailsTarget.imei && (
              <div className="flex items-center justify-between">
                <span className="text-muted">IMEI</span>
                <span className="font-medium text-foreground">{detailsTarget.imei}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <Badge tone={statusTone[detailsTarget.status]}>{statusLabel[detailsTarget.status]}</Badge>
            </div>
            {detailsTarget.customerName && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Customer</span>
                <span className="font-medium text-foreground">{detailsTarget.customerName}</span>
              </div>
            )}
            {detailsTarget.saleDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Sale Date</span>
                <span className="font-medium text-foreground">{detailsTarget.saleDate}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted">Warranty Expiry</span>
              <span className="font-medium text-foreground">{detailsTarget.warrantyExpiry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Warranty Status</span>
              <WarrantyBadge warrantyExpiry={detailsTarget.warrantyExpiry} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
