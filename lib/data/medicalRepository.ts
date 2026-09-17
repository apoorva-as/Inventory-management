import type {
  BatchAllocation,
  MedicalBatch,
  MedicalCategory,
  MedicalCustomer,
  MedicalManufacturer,
  MedicalMedicine,
  MedicalPrescription,
  MedicalPurchase,
  MedicalPurchaseOrder,
  MedicalPurchaseReturn,
  MedicalSale,
  MedicalSaleLineItem,
  MedicalSalesReturn,
  MedicalStockAdjustment,
  MedicalSupplier,
} from "@/lib/types/medical";
import type { OrderStatus } from "@/lib/types/shared";
import { allocateFefo } from "@/lib/utils/medicalFefo";
import { getMedicineActiveBatches } from "@/lib/utils/medicalStock";
import { generateId } from "@/lib/utils/id";
import { medicalCategories } from "@/lib/mock-data/medical/categories";
import { medicalCustomers } from "@/lib/mock-data/medical/customers";
import { medicalManufacturers } from "@/lib/mock-data/medical/manufacturers";
import { medicalMedicines } from "@/lib/mock-data/medical/medicines";
import { medicalBatches } from "@/lib/mock-data/medical/batches";
import { medicalPurchaseOrders } from "@/lib/mock-data/medical/purchaseOrders";
import { medicalPrescriptions } from "@/lib/mock-data/medical/prescriptions";
import { medicalPurchases } from "@/lib/mock-data/medical/purchases";
import { medicalSales } from "@/lib/mock-data/medical/sales";
import { medicalSalesReturns } from "@/lib/mock-data/medical/salesReturns";
import { medicalPurchaseReturns } from "@/lib/mock-data/medical/purchaseReturns";
import { medicalStockAdjustments } from "@/lib/mock-data/medical/stockAdjustments";
import { medicalSuppliers } from "@/lib/mock-data/medical/suppliers";

export const MEDICAL_STORAGE_KEY = "inventory:medical";

export interface MedicalState {
  medicines: MedicalMedicine[];
  batches: MedicalBatch[];
  customers: MedicalCustomer[];
  suppliers: MedicalSupplier[];
  categories: MedicalCategory[];
  manufacturers: MedicalManufacturer[];
  purchaseOrders: MedicalPurchaseOrder[];
  purchases: MedicalPurchase[];
  sales: MedicalSale[];
  salesReturns: MedicalSalesReturn[];
  purchaseReturns: MedicalPurchaseReturn[];
  stockAdjustments: MedicalStockAdjustment[];
  prescriptions: MedicalPrescription[];
}

/**
 * Seeds initial state from mock data. Swap this for an async API/Prisma
 * fetch later without changing anything that consumes MedicalState.
 */
export function getInitialMedicalState(): MedicalState {
  return {
    medicines: medicalMedicines,
    batches: medicalBatches,
    customers: medicalCustomers,
    suppliers: medicalSuppliers,
    categories: medicalCategories,
    manufacturers: medicalManufacturers,
    purchaseOrders: medicalPurchaseOrders,
    purchases: medicalPurchases,
    sales: medicalSales,
    salesReturns: medicalSalesReturns,
    purchaseReturns: medicalPurchaseReturns,
    stockAdjustments: medicalStockAdjustments,
    prescriptions: medicalPrescriptions,
  };
}

// ---- Medicines ----

export function addMedicine(state: MedicalState, medicine: MedicalMedicine): MedicalState {
  return { ...state, medicines: [medicine, ...state.medicines] };
}

export function updateMedicine(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalMedicine>,
): MedicalState {
  return {
    ...state,
    medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...changes } : m)),
  };
}

export function deleteMedicine(state: MedicalState, id: string): MedicalState {
  return { ...state, medicines: state.medicines.filter((m) => m.id !== id) };
}

// ---- Categories / Manufacturers / Customers / Suppliers (unchanged CRUD) ----

export function addCategory(state: MedicalState, category: MedicalCategory): MedicalState {
  return { ...state, categories: [category, ...state.categories] };
}

export function updateCategory(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalCategory>,
): MedicalState {
  return { ...state, categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)) };
}

export function deleteCategory(state: MedicalState, id: string): MedicalState {
  return { ...state, categories: state.categories.filter((c) => c.id !== id) };
}

export function addManufacturer(state: MedicalState, manufacturer: MedicalManufacturer): MedicalState {
  return { ...state, manufacturers: [manufacturer, ...state.manufacturers] };
}

export function updateManufacturer(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalManufacturer>,
): MedicalState {
  return {
    ...state,
    manufacturers: state.manufacturers.map((m) => (m.id === id ? { ...m, ...changes } : m)),
  };
}

export function deleteManufacturer(state: MedicalState, id: string): MedicalState {
  return { ...state, manufacturers: state.manufacturers.filter((m) => m.id !== id) };
}

export function addCustomer(state: MedicalState, customer: MedicalCustomer): MedicalState {
  return { ...state, customers: [customer, ...state.customers] };
}

export function updateCustomer(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalCustomer>,
): MedicalState {
  return { ...state, customers: state.customers.map((c) => (c.id === id ? { ...c, ...changes } : c)) };
}

export function deleteCustomer(state: MedicalState, id: string): MedicalState {
  return { ...state, customers: state.customers.filter((c) => c.id !== id) };
}

export function addSupplier(state: MedicalState, supplier: MedicalSupplier): MedicalState {
  return { ...state, suppliers: [supplier, ...state.suppliers] };
}

export function updateSupplier(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalSupplier>,
): MedicalState {
  return { ...state, suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...changes } : s)) };
}

export function deleteSupplier(state: MedicalState, id: string): MedicalState {
  return { ...state, suppliers: state.suppliers.filter((s) => s.id !== id) };
}

// ---- Batch receiving (shared by direct Purchases and PO receipt) ----

interface BatchReceipt {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: number;
  mrp?: number;
  supplierId: string;
  supplierName: string;
  date: string;
}

/**
 * Matches an existing batch by (medicineId, batchNumber): if found, increases
 * its quantity and refreshes price/expiry/supplier to the newly received
 * values; otherwise appends a new batch. This is the single code path both
 * direct Purchases and Purchase Order receipt funnel through, so "stock goes
 * up" only ever happens here.
 */
function upsertBatchOnReceipt(batches: MedicalBatch[], receipt: BatchReceipt): MedicalBatch[] {
  const existingIndex = batches.findIndex(
    (b) => b.medicineId === receipt.medicineId && b.batchNumber === receipt.batchNumber,
  );

  if (existingIndex === -1) {
    const newBatch: MedicalBatch = { id: generateId("mbatch"), ...receipt };
    return [newBatch, ...batches];
  }

  return batches.map((b, i) =>
    i === existingIndex
      ? {
          ...b,
          quantity: b.quantity + receipt.quantity,
          purchasePrice: receipt.purchasePrice,
          mrp: receipt.mrp ?? b.mrp,
          manufacturingDate: receipt.manufacturingDate,
          expiryDate: receipt.expiryDate,
          supplierId: receipt.supplierId,
          supplierName: receipt.supplierName,
          date: receipt.date,
        }
      : b,
  );
}

function applyPurchaseToBatches(batches: MedicalBatch[], purchase: MedicalPurchase): MedicalBatch[] {
  return purchase.items.reduce(
    (acc, item) =>
      upsertBatchOnReceipt(acc, {
        medicineId: item.productId,
        medicineName: item.productName,
        batchNumber: item.batchNumber,
        manufacturingDate: item.manufacturingDate,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        purchasePrice: item.unitPrice,
        supplierId: purchase.vendorId,
        supplierName: purchase.vendorName,
        date: purchase.date,
      }),
    batches,
  );
}

// ---- Purchases ----

export function addPurchase(state: MedicalState, purchase: MedicalPurchase): MedicalState {
  const batches = purchase.status === "completed" ? applyPurchaseToBatches(state.batches, purchase) : state.batches;
  return { ...state, batches, purchases: [purchase, ...state.purchases] };
}

export function updatePurchaseStatus(
  state: MedicalState,
  id: string,
  status: OrderStatus,
): MedicalState {
  const purchase = state.purchases.find((p) => p.id === id);
  if (!purchase || purchase.status === status) {
    return { ...state, purchases: state.purchases.map((p) => (p.id === id ? { ...p, status } : p)) };
  }

  const becameCompleted = status === "completed" && purchase.status !== "completed";
  const batches = becameCompleted
    ? applyPurchaseToBatches(state.batches, { ...purchase, status })
    : state.batches;

  return {
    ...state,
    batches,
    purchases: state.purchases.map((p) => (p.id === id ? { ...p, status } : p)),
  };
}

// ---- Purchase Orders ----

export function addPurchaseOrder(state: MedicalState, po: MedicalPurchaseOrder): MedicalState {
  return { ...state, purchaseOrders: [po, ...state.purchaseOrders] };
}

export function updatePurchaseOrder(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalPurchaseOrder>,
): MedicalState {
  return {
    ...state,
    purchaseOrders: state.purchaseOrders.map((po) => (po.id === id ? { ...po, ...changes } : po)),
  };
}

export function cancelPurchaseOrder(state: MedicalState, id: string): MedicalState {
  return {
    ...state,
    purchaseOrders: state.purchaseOrders.map((po) =>
      po.id === id && po.status !== "received" ? { ...po, status: "cancelled" } : po,
    ),
  };
}

export interface ReceivedPoLine {
  medicineId: string;
  medicineName: string;
  quantity: number;
  purchasePrice: number;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

/**
 * Receiving a PO builds a completed MedicalPurchase from the received lines
 * and routes it through addPurchase — the same batch-upsert path a direct
 * Purchase uses — so a PO and a direct purchase can never diverge in how
 * they move stock.
 */
export function receivePurchaseOrder(
  state: MedicalState,
  poId: string,
  receivedLines: ReceivedPoLine[],
  date: string,
): MedicalState {
  const po = state.purchaseOrders.find((p) => p.id === poId);
  if (!po || po.status === "received" || po.status === "cancelled") return state;

  const purchase: MedicalPurchase = {
    id: generateId("mpu"),
    vendorId: po.supplierId,
    vendorName: po.supplierName,
    date,
    status: "completed",
    purchaseOrderId: po.id,
    items: receivedLines.map((line) => ({
      productId: line.medicineId,
      productName: line.medicineName,
      quantity: line.quantity,
      unitPrice: line.purchasePrice,
      batchNumber: line.batchNumber,
      manufacturingDate: line.manufacturingDate,
      expiryDate: line.expiryDate,
    })),
    total: receivedLines.reduce((sum, l) => sum + l.quantity * l.purchasePrice, 0),
  };

  const stateWithPurchase = addPurchase(state, purchase);

  return {
    ...stateWithPurchase,
    purchaseOrders: stateWithPurchase.purchaseOrders.map((p) =>
      p.id === poId ? { ...p, status: "received", receivedPurchaseId: purchase.id } : p,
    ),
  };
}

// ---- Sales (FEFO-driven) ----

function consumeSaleItems(
  batches: MedicalBatch[],
  items: MedicalSaleLineItem[],
): { batches: MedicalBatch[]; items: MedicalSaleLineItem[] } {
  let nextBatches = batches;
  const nextItems: MedicalSaleLineItem[] = [];

  for (const item of items) {
    const result = allocateFefo(nextBatches, item.productId, item.quantity);
    const consumedByBatch = new Map(result.allocations.map((a) => [a.batchId, a.quantity]));
    nextBatches = nextBatches.map((b) =>
      consumedByBatch.has(b.id)
        ? { ...b, quantity: Math.max(0, b.quantity - (consumedByBatch.get(b.id) ?? 0)) }
        : b,
    );
    const batchAllocations: BatchAllocation[] = result.allocations.map((a) => ({
      batchId: a.batchId,
      batchNumber: a.batchNumber,
      quantity: a.quantity,
    }));
    nextItems.push({ ...item, batchAllocations });
  }

  return { batches: nextBatches, items: nextItems };
}

export function addSale(state: MedicalState, sale: MedicalSale): MedicalState {
  if (sale.status !== "completed") {
    return { ...state, sales: [sale, ...state.sales] };
  }
  const { batches, items } = consumeSaleItems(state.batches, sale.items);
  return { ...state, batches, sales: [{ ...sale, items }, ...state.sales] };
}

export function updateSaleStatus(state: MedicalState, id: string, status: OrderStatus): MedicalState {
  const sale = state.sales.find((s) => s.id === id);
  if (!sale || sale.status === status) {
    return { ...state, sales: state.sales.map((s) => (s.id === id ? { ...s, status } : s)) };
  }

  const becameCompleted = status === "completed" && sale.status !== "completed";
  if (!becameCompleted) {
    return { ...state, sales: state.sales.map((s) => (s.id === id ? { ...s, status } : s)) };
  }

  const { batches, items } = consumeSaleItems(state.batches, sale.items);
  return {
    ...state,
    batches,
    sales: state.sales.map((s) => (s.id === id ? { ...s, status, items } : s)),
  };
}

// ---- Prescriptions ----

export function addPrescription(state: MedicalState, prescription: MedicalPrescription): MedicalState {
  return { ...state, prescriptions: [prescription, ...state.prescriptions] };
}

export function updatePrescriptionStatus(
  state: MedicalState,
  id: string,
  status: MedicalPrescription["status"],
): MedicalState {
  return {
    ...state,
    prescriptions: state.prescriptions.map((p) => (p.id === id ? { ...p, status } : p)),
  };
}

/** Explicit fulfillment action, driven only by a completed sale — never automatic. */
export function fulfillPrescription(
  state: MedicalState,
  prescriptionId: string,
  saleId: string,
): MedicalState {
  return {
    ...state,
    prescriptions: state.prescriptions.map((p) =>
      p.id === prescriptionId ? { ...p, status: "fulfilled", fulfilledBySaleId: saleId } : p,
    ),
  };
}

// ---- Returns ----

export function addSalesReturn(state: MedicalState, ret: MedicalSalesReturn): MedicalState {
  const originalSale = state.sales.find((s) => s.id === ret.saleId);
  const originalLine = originalSale?.items.find((i) => i.productId === ret.medicineId);
  const originalBatchId = originalLine?.batchAllocations?.[0]?.batchId;

  let targetBatchId = originalBatchId && state.batches.some((b) => b.id === originalBatchId)
    ? originalBatchId
    : undefined;

  if (!targetBatchId) {
    const candidates = getMedicineActiveBatches(state.batches, ret.medicineId).sort(
      (a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime(),
    );
    targetBatchId = candidates[0]?.id;
  }

  let batches: MedicalBatch[];
  let restockedBatchId: string;

  if (targetBatchId) {
    restockedBatchId = targetBatchId;
    batches = state.batches.map((b) =>
      b.id === targetBatchId ? { ...b, quantity: b.quantity + ret.quantity } : b,
    );
  } else {
    const synthetic: MedicalBatch = {
      id: generateId("mbatch"),
      medicineId: ret.medicineId,
      medicineName: ret.medicineName,
      batchNumber: `RETURN-${ret.saleId}`,
      manufacturingDate: ret.date,
      expiryDate: ret.date,
      quantity: ret.quantity,
      purchasePrice: 0,
      supplierId: "",
      supplierName: "Sales Return",
      date: ret.date,
    };
    restockedBatchId = synthetic.id;
    batches = [synthetic, ...state.batches];
  }

  return {
    ...state,
    batches,
    salesReturns: [{ ...ret, restockedBatchId }, ...state.salesReturns],
  };
}

export function addPurchaseReturn(state: MedicalState, ret: MedicalPurchaseReturn): MedicalState {
  const batches = state.batches.map((b) =>
    b.id === ret.batchId ? { ...b, quantity: Math.max(0, b.quantity - ret.quantity) } : b,
  );
  return { ...state, batches, purchaseReturns: [ret, ...state.purchaseReturns] };
}

// ---- Stock Adjustments ----

export function addStockAdjustment(state: MedicalState, adj: MedicalStockAdjustment): MedicalState {
  const sign = adj.type === "increase" ? 1 : -1;

  let batchId = adj.batchId;
  if (!batchId) {
    const activeBatches = getMedicineActiveBatches(state.batches, adj.medicineId);
    if (activeBatches.length !== 1) {
      // Ambiguous or no target batch — never guess, since that would corrupt FEFO ordering.
      return { ...state, stockAdjustments: [adj, ...state.stockAdjustments] };
    }
    batchId = activeBatches[0].id;
  }

  const batches = state.batches.map((b) =>
    b.id === batchId ? { ...b, quantity: Math.max(0, b.quantity + sign * adj.quantity) } : b,
  );

  return {
    ...state,
    batches,
    stockAdjustments: [{ ...adj, batchId }, ...state.stockAdjustments],
  };
}
