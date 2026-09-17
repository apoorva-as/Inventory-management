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

export type StockAdjustmentType = "increase" | "decrease";
export type StockAdjustmentReason = "Damaged" | "Lost" | "Wastage" | "Stock Count" | "Manual Correction";

export interface GroceryStockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: StockAdjustmentType;
  reason: StockAdjustmentReason;
  quantity: number;
  date: string;
  notes?: string;
}
