"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/components/shared/NotificationCenter";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import { generateId } from "@/lib/utils/id";
import { getBatchExpiryStatus, getMedicineTotalStock } from "@/lib/utils/medicalStock";
import type { MedicalMedicine } from "@/lib/types/medical";

function toCsvValue(value: string | number | boolean | undefined): string {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(headers: string[], rows: (string | number | boolean | undefined)[][]): string {
  return [headers.join(","), ...rows.map((row) => row.map(toCsvValue).join(","))].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Minimal CSV line parser — handles quoted fields with embedded commas, not full RFC 4180 (no
// embedded newlines inside a quoted field). Sufficient for the plain export format above.
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

interface ImportError {
  row: number;
  message: string;
}

export function ImportExportSection() {
  const { medicines, batches, sales, purchases, categories, manufacturers, addMedicine } = useMedicalData();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  function exportMedicines() {
    const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
    const manufacturerName = (id: string) => manufacturers.find((m) => m.id === id)?.name ?? "";
    const csv = toCsv(
      ["name", "genericName", "brandName", "sku", "barcode", "category", "manufacturer", "dosageForm", "strength", "packSize", "unit", "purchasePrice", "sellingPrice", "mrp", "minimumStock", "prescriptionRequired", "active"],
      medicines.map((m) => [
        m.name,
        m.genericName,
        m.brandName,
        m.sku,
        m.barcode,
        categoryName(m.categoryId),
        manufacturerName(m.manufacturerId),
        m.dosageForm,
        m.strength,
        m.packSize,
        m.unit,
        m.purchasePrice,
        m.sellingPrice,
        m.mrp,
        m.minimumStock,
        m.prescriptionRequired,
        m.active,
      ]),
    );
    downloadCsv("medicines.csv", csv);
  }

  function exportInventory() {
    const csv = toCsv(
      ["medicine", "genericName", "totalStock", "minimumStock", "purchasePrice", "stockValue"],
      medicines.map((m) => {
        const stock = getMedicineTotalStock(batches, m.id);
        return [m.name, m.genericName, stock, m.minimumStock, m.purchasePrice, Number((stock * m.purchasePrice).toFixed(2))];
      }),
    );
    downloadCsv("inventory.csv", csv);
  }

  function exportSales() {
    const csv = toCsv(
      ["saleId", "date", "customer", "status", "medicine", "quantity", "unitPrice", "lineTotal"],
      sales.flatMap((s) => s.items.map((i) => [s.id, s.date, s.customerName, s.status, i.productName, i.quantity, i.unitPrice, Number((i.quantity * i.unitPrice).toFixed(2))])),
    );
    downloadCsv("sales.csv", csv);
  }

  function exportPurchases() {
    const csv = toCsv(
      ["purchaseId", "date", "supplier", "status", "medicine", "batchNumber", "quantity", "unitPrice", "lineTotal"],
      purchases.flatMap((p) => p.items.map((i) => [p.id, p.date, p.vendorName, p.status, i.productName, i.batchNumber, i.quantity, i.unitPrice, Number((i.quantity * i.unitPrice).toFixed(2))])),
    );
    downloadCsv("purchases.csv", csv);
  }

  function exportExpiry() {
    const csv = toCsv(
      ["medicine", "batchNumber", "quantity", "expiryDate", "status"],
      batches
        .filter((b) => b.quantity > 0)
        .map((b) => [b.medicineName, b.batchNumber, b.quantity, b.expiryDate, getBatchExpiryStatus(b)]),
    );
    downloadCsv("expiry.csv", csv);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setImportErrors([{ row: 0, message: "File has no data rows." }]);
        return;
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.trim());
      const required = ["name", "genericName", "sku", "category", "manufacturer", "dosageForm", "strength", "packSize", "unit", "purchasePrice", "sellingPrice", "mrp", "minimumStock"];
      const missingHeaders = required.filter((h) => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setImportErrors([{ row: 0, message: `Missing required column(s): ${missingHeaders.join(", ")}` }]);
        return;
      }

      const errors: ImportError[] = [];
      const parsedMedicines: MedicalMedicine[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rowNumber = i + 1;
        const fields = parseCsvLine(lines[i]);
        const row = Object.fromEntries(headers.map((h, idx) => [h, fields[idx] ?? ""]));

        const category = categories.find((c) => c.name === row.category);
        const manufacturer = manufacturers.find((m) => m.name === row.manufacturer);

        if (!row.name?.trim()) errors.push({ row: rowNumber, message: "Missing medicine name." });
        if (!row.sku?.trim()) errors.push({ row: rowNumber, message: "Missing SKU." });
        if (!category) errors.push({ row: rowNumber, message: `Unknown category "${row.category}".` });
        if (!manufacturer) errors.push({ row: rowNumber, message: `Unknown manufacturer "${row.manufacturer}".` });
        const mrp = Number(row.mrp);
        const sellingPrice = Number(row.sellingPrice);
        const purchasePrice = Number(row.purchasePrice);
        const minimumStock = Number(row.minimumStock);
        if (Number.isNaN(mrp) || Number.isNaN(sellingPrice) || Number.isNaN(purchasePrice) || Number.isNaN(minimumStock)) {
          errors.push({ row: rowNumber, message: "Prices and minimum stock must be numbers." });
        }

        if (category && manufacturer && !Number.isNaN(mrp) && !Number.isNaN(sellingPrice) && !Number.isNaN(purchasePrice) && !Number.isNaN(minimumStock)) {
          parsedMedicines.push({
            id: generateId("mm"),
            name: row.name.trim(),
            genericName: row.genericName?.trim() ?? "",
            brandName: row.brandName?.trim() || undefined,
            sku: row.sku.trim(),
            barcode: row.barcode?.trim() || undefined,
            categoryId: category.id,
            manufacturerId: manufacturer.id,
            dosageForm: row.dosageForm?.trim() ?? "",
            strength: row.strength?.trim() ?? "",
            packSize: row.packSize?.trim() ?? "",
            unit: row.unit?.trim() ?? "",
            purchasePrice,
            sellingPrice,
            mrp,
            minimumStock,
            prescriptionRequired: row.prescriptionRequired?.toLowerCase() === "true",
            active: row.active?.toLowerCase() !== "false",
          });
        }
      }

      setImportErrors(errors);
      if (errors.length === 0) {
        for (const medicine of parsedMedicines) addMedicine(medicine);
        showToast(`Imported ${parsedMedicines.length} medicine(s).`, "success");
      } else {
        showToast(`Import failed — ${errors.length} row error(s) found. No rows were saved.`, "error");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Export</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportMedicines}>
            <Download size={14} />
            Medicines
          </Button>
          <Button variant="secondary" size="sm" onClick={exportInventory}>
            <Download size={14} />
            Inventory
          </Button>
          <Button variant="secondary" size="sm" onClick={exportSales}>
            <Download size={14} />
            Sales
          </Button>
          <Button variant="secondary" size="sm" onClick={exportPurchases}>
            <Download size={14} />
            Purchases
          </Button>
          <Button variant="secondary" size="sm" onClick={exportExpiry}>
            <Download size={14} />
            Expiry
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Import Medicines</h2>
        <p className="mb-3 text-xs text-muted">
          CSV columns: name, genericName, brandName, sku, barcode, category, manufacturer, dosageForm,
          strength, packSize, unit, purchasePrice, sellingPrice, mrp, minimumStock, prescriptionRequired,
          active. Category and manufacturer must match existing names exactly. The whole file is
          validated before anything is saved — a single bad row cancels the import.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button variant="secondary" size="sm" onClick={handleImportClick}>
          <Upload size={14} />
          Choose CSV File
        </Button>

        {importErrors.length > 0 && (
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {importErrors.map((err, i) => (
              <p key={i}>
                Row {err.row}: {err.message}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
