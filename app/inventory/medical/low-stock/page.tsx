"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { getMedicineActiveBatches, getMedicineTotalStock, isLowStock } from "@/lib/utils/medicalStock";
import type { MedicalMedicine } from "@/lib/types/medical";

interface LowStockRow {
  medicine: MedicalMedicine;
  stock: number;
  batchCount: number;
}

export default function MedicalLowStockPage() {
  const { medicines, batches, categories, manufacturers } = useMedicalData();
  const [search, setSearch] = useState("");

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const manufacturerName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? "—";

  const lowStockRows = useMemo<LowStockRow[]>(() => {
    const term = search.trim().toLowerCase();
    return medicines
      .map((medicine) => ({
        medicine,
        stock: getMedicineTotalStock(batches, medicine.id),
        batchCount: getMedicineActiveBatches(batches, medicine.id).length,
      }))
      .filter(({ medicine, stock }) => isLowStock(stock, medicine.minimumStock))
      .filter(
        ({ medicine }) =>
          !term ||
          medicine.name.toLowerCase().includes(term) ||
          medicine.genericName.toLowerCase().includes(term),
      )
      .sort((a, b) => a.stock - b.stock);
  }, [medicines, batches, search]);

  const columns: DataTableColumn<LowStockRow>[] = [
    {
      key: "name",
      header: "Medicine",
      render: ({ medicine }) => (
        <div>
          <p className="font-medium text-foreground">{medicine.name}</p>
          <p className="text-xs text-muted">{medicine.genericName}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: ({ medicine }) => categoryName(medicine.categoryId) },
    {
      key: "manufacturer",
      header: "Manufacturer",
      render: ({ medicine }) => manufacturerName(medicine.manufacturerId),
    },
    { key: "batches", header: "Active Batches", render: ({ batchCount }) => String(batchCount) },
    { key: "stock", header: "Current Stock", render: ({ stock }) => String(stock) },
    { key: "minimum", header: "Minimum Stock", render: ({ medicine }) => String(medicine.minimumStock) },
  ];

  return (
    <div>
      <PageHeader
        title="Low Stock"
        description={`${lowStockRows.length} medicines at or below their minimum stock`}
      />

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or generic name..."
          containerClassName="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        rows={lowStockRows}
        getRowKey={({ medicine }) => medicine.id}
        emptyTitle="No low stock medicines"
        emptyDescription="Every medicine is currently above its minimum stock threshold."
      />
    </div>
  );
}
