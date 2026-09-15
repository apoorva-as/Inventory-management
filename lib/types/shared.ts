export type Vertical = "grocery" | "medical" | "electronics";

export interface BaseEntity {
  id: string;
}

export interface BaseProduct extends BaseEntity {
  name: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  price: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  imageUrl?: string;
}

export interface BaseCategory extends BaseEntity {
  name: string;
}

export interface BaseBrand extends BaseEntity {
  name: string;
}

export interface BaseCustomer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface BaseVendor extends BaseEntity {
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
}

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface BaseLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface BasePurchase extends BaseEntity {
  vendorId: string;
  vendorName: string;
  date: string;
  status: OrderStatus;
  items: BaseLineItem[];
  total: number;
}

export interface BaseSale extends BaseEntity {
  customerId: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  items: BaseLineItem[];
  total: number;
}

export interface StatSummary {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface ChartPoint {
  label: string;
  value: number;
}
