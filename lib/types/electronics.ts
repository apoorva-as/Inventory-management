import type {
  BaseBrand,
  BaseCategory,
  BaseCustomer,
  BasePurchase,
  BaseProduct,
  BaseSale,
  BaseVendor,
} from "./shared";

export interface ElectronicsProduct extends BaseProduct {
  modelId: string;
  specifications: Record<string, string>;
  warrantyMonths: number;
  /** Unit-level IMEI tracking — phones only. Mutually exclusive with hasSerial. */
  hasImei: boolean;
  /** Unit-level serial number tracking — laptops and similar. Mutually exclusive with hasImei. */
  hasSerial: boolean;
}

export interface ElectronicsModel {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
}

export interface ElectronicsSerial {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  imei?: string;
  warrantyExpiry: string;
  status: "in_stock" | "sold" | "returned";
  /** Populated once the unit has been sold. */
  saleId?: string;
  customerId?: string;
  customerName?: string;
  saleDate?: string;
}

export type ElectronicsReturnReason =
  | "defective"
  | "damaged"
  | "wrong_item"
  | "changed_mind"
  | "warranty_claim";

export interface ElectronicsReturn {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  date: string;
  reason: ElectronicsReturnReason;
  status: "pending" | "approved" | "rejected";
}

export type ElectronicsCategory = BaseCategory;
export type ElectronicsBrand = BaseBrand;
export type ElectronicsCustomer = BaseCustomer;
export type ElectronicsVendor = BaseVendor;
export type ElectronicsPurchase = BasePurchase;
export type ElectronicsSale = BaseSale;
