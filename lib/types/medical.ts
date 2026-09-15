import type {
  BaseBrand,
  BaseCategory,
  BaseCustomer,
  BasePurchase,
  BaseProduct,
  BaseSale,
  BaseVendor,
} from "./shared";

export interface MedicalMedicine extends BaseProduct {
  genericName: string;
  manufacturerId: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  mrp: number;
  prescriptionRequired: boolean;
}

export interface MedicalBatch {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
}

export interface MedicalPrescription {
  id: string;
  customerId: string;
  customerName: string;
  doctorName: string;
  date: string;
  medicines: { medicineId: string; medicineName: string; quantity: number }[];
  status: "pending" | "fulfilled";
}

export type MedicalCategory = BaseCategory;
export type MedicalManufacturer = BaseBrand;
export type MedicalCustomer = BaseCustomer;
export type MedicalSupplier = BaseVendor;
export type MedicalPurchase = BasePurchase;
export type MedicalSale = BaseSale;
