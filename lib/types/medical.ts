import type {
  BaseBrand,
  BaseCategory,
  BaseCustomer,
  BaseEntity,
  BaseLineItem,
  BaseVendor,
  OrderStatus,
} from "./shared";

// ---- Master data ----
// Medicine is master/catalog data only. Stock and expiry are never stored
// here — they are always derived from `MedicalBatch` records via
// lib/utils/medicalStock.ts. Do not reintroduce stockQty/expiryDate/
// batchNumber fields on this interface.
export interface MedicalMedicine extends BaseEntity {
  name: string;
  genericName: string;
  brandName?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  manufacturerId: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  minimumStock: number;
  prescriptionRequired: boolean;
  imageUrl?: string;
  active: boolean;
}

// A single received stock lot of a medicine. Stock-bearing entity — a
// medicine's total stock is SUM(quantity) across its batches.
export interface MedicalBatch extends BaseEntity {
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

// ---- Purchase Orders ----

export type PurchaseOrderStatus = "draft" | "pending" | "received" | "cancelled";

export interface PurchaseOrderLine {
  medicineId: string;
  medicineName: string;
  quantity: number;
  purchasePrice: number;
}

export interface MedicalPurchaseOrder extends BaseEntity {
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderLine[];
  total: number;
  receivedPurchaseId?: string;
}

// ---- Purchases / Sales ----

export interface MedicalPurchaseLineItem extends BaseLineItem {
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

export interface MedicalPurchase extends BaseEntity {
  vendorId: string;
  vendorName: string;
  date: string;
  status: OrderStatus;
  items: MedicalPurchaseLineItem[];
  total: number;
  purchaseOrderId?: string;
}

export interface BatchAllocation {
  batchId: string;
  batchNumber: string;
  quantity: number;
}

export interface MedicalSaleLineItem extends BaseLineItem {
  batchAllocations?: BatchAllocation[];
}

export interface MedicalSale extends BaseEntity {
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  items: MedicalSaleLineItem[];
  total: number;
  prescriptionId?: string;
}

// ---- Returns ----

export interface MedicalSalesReturn extends BaseEntity {
  saleId: string;
  customerId: string;
  customerName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  reason: string;
  date: string;
  restockedBatchId?: string;
}

export interface MedicalPurchaseReturn extends BaseEntity {
  purchaseId: string;
  supplierId: string;
  supplierName: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  reason: string;
  date: string;
}

// ---- Stock Adjustments ----

export type MedicalStockAdjustmentType = "increase" | "decrease";
export type MedicalStockAdjustmentReason =
  | "Damaged"
  | "Expired"
  | "Lost"
  | "Manual Correction"
  | "Stock Count"
  | "Other";

export interface MedicalStockAdjustment extends BaseEntity {
  medicineId: string;
  medicineName: string;
  batchId?: string;
  batchNumber?: string;
  type: MedicalStockAdjustmentType;
  quantity: number;
  reason: MedicalStockAdjustmentReason;
  date: string;
  notes?: string;
}

// ---- Prescriptions ----

export interface MedicalPrescription extends BaseEntity {
  customerId: string;
  customerName: string;
  doctorName: string;
  date: string;
  medicines: { medicineId: string; medicineName: string; quantity: number }[];
  status: "pending" | "fulfilled";
  fulfilledBySaleId?: string;
}

// ---- Reference passthrough types ----
export type MedicalCategory = BaseCategory;
export type MedicalManufacturer = BaseBrand;
export type MedicalCustomer = BaseCustomer;
export type MedicalSupplier = BaseVendor;
