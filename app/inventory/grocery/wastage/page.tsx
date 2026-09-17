"use client";

import { useMemo, useState } from "react";
import { Recycle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { useGroceryData } from "@/lib/context/GroceryDataProvider";
import type { GroceryStockAdjustment } from "@/lib/types/grocery";

const PAGE_SIZE = 10;

export default function GroceryWastagePage() {
  const { adjustments } = useGroceryData();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const wastageRecords = useMemo(
    () => adjustments.filter((a) => a.type === "decrease" && (a.reason === "Damaged" || a.reason === "Wastage")),
    [adjustments],
  );

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return wastageRecords;
    return wastageRecords.filter((a) => a.productName.toLowerCase().includes(term));
  }, [wastageRecords, search]);

  const totalUnitsWasted = wastageRecords.reduce((sum, a) => sum + a.quantity, 0);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedRecords = filteredRecords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns: DataTableColumn<GroceryStockAdjustment>[] = [
    {
      key: "product",
      header: "Product",
      render: (a) => (
        <div>
          <p className="font-medium text-foreground">{a.productName}</p>
          <p className="text-xs text-muted">{a.date}</p>
        </div>
      ),
    },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "quantity", header: "Quantity Wasted", render: (a) => a.quantity },
    { key: "notes", header: "Notes", render: (a) => a.notes ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Wastage"
        description="Units lost to damage or wastage, derived from Stock Adjustments"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Units Wasted" value={String(totalUnitsWasted)} icon={Recycle} trend="down" />
        <StatCard label="Wastage Records" value={String(wastageRecords.length)} icon={Recycle} />
      </div>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by product..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={pagedRecords}
        getRowKey={(a) => a.id}
        emptyTitle="No wastage recorded"
        emptyDescription="Stock adjustments with reason Damaged or Wastage will appear here."
      />

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
