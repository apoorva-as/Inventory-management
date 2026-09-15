import type {
  BaseBrand,
  BaseCategory,
  BaseCustomer,
  BasePurchase,
  BaseProduct,
  BaseSale,
  BaseVendor,
} from "./shared";

export type GroceryUnit = "kg" | "g" | "litre" | "packet" | "piece";

export interface GroceryProduct extends BaseProduct {
  unit: GroceryUnit;
  weight?: number;
  barcode: string;
  expiryDate?: string;
}

export type GroceryCategory = BaseCategory;
export type GroceryBrand = BaseBrand;
export type GroceryCustomer = BaseCustomer;
export type GroceryVendor = BaseVendor;
export type GroceryPurchase = BasePurchase;
export type GrocerySale = BaseSale;
