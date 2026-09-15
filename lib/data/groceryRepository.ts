import type {
  GroceryBrand,
  GroceryCategory,
  GroceryCustomer,
  GroceryProduct,
  GroceryPurchase,
  GrocerySale,
  GroceryVendor,
} from "@/lib/types/grocery";
import { groceryBrands } from "@/lib/mock-data/grocery/brands";
import { groceryCategories } from "@/lib/mock-data/grocery/categories";
import { groceryCustomers } from "@/lib/mock-data/grocery/customers";
import { groceryProducts } from "@/lib/mock-data/grocery/products";
import { groceryPurchases } from "@/lib/mock-data/grocery/purchases";
import { grocerySales } from "@/lib/mock-data/grocery/sales";
import { groceryVendors } from "@/lib/mock-data/grocery/vendors";

export const GROCERY_STORAGE_KEY = "inventory:grocery";

export interface GroceryState {
  products: GroceryProduct[];
  customers: GroceryCustomer[];
  vendors: GroceryVendor[];
  categories: GroceryCategory[];
  brands: GroceryBrand[];
  purchases: GroceryPurchase[];
  sales: GrocerySale[];
}

/**
 * Seeds initial state from mock data. Swap this for an async API/Prisma
 * fetch later without changing anything that consumes GroceryState.
 */
export function getInitialGroceryState(): GroceryState {
  return {
    products: groceryProducts,
    customers: groceryCustomers,
    vendors: groceryVendors,
    categories: groceryCategories,
    brands: groceryBrands,
    purchases: groceryPurchases,
    sales: grocerySales,
  };
}

export function addProduct(state: GroceryState, product: GroceryProduct): GroceryState {
  return { ...state, products: [product, ...state.products] };
}

export function updateProduct(
  state: GroceryState,
  id: string,
  changes: Partial<GroceryProduct>,
): GroceryState {
  return {
    ...state,
    products: state.products.map((p) => (p.id === id ? { ...p, ...changes } : p)),
  };
}

export function deleteProduct(state: GroceryState, id: string): GroceryState {
  return { ...state, products: state.products.filter((p) => p.id !== id) };
}

export function addCategory(state: GroceryState, category: GroceryCategory): GroceryState {
  return { ...state, categories: [category, ...state.categories] };
}

export function updateCategory(
  state: GroceryState,
  id: string,
  changes: Partial<GroceryCategory>,
): GroceryState {
  return {
    ...state,
    categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCategory(state: GroceryState, id: string): GroceryState {
  return { ...state, categories: state.categories.filter((c) => c.id !== id) };
}

export function addBrand(state: GroceryState, brand: GroceryBrand): GroceryState {
  return { ...state, brands: [brand, ...state.brands] };
}

export function updateBrand(
  state: GroceryState,
  id: string,
  changes: Partial<GroceryBrand>,
): GroceryState {
  return {
    ...state,
    brands: state.brands.map((b) => (b.id === id ? { ...b, ...changes } : b)),
  };
}

export function deleteBrand(state: GroceryState, id: string): GroceryState {
  return { ...state, brands: state.brands.filter((b) => b.id !== id) };
}

export function addCustomer(state: GroceryState, customer: GroceryCustomer): GroceryState {
  return { ...state, customers: [customer, ...state.customers] };
}

export function updateCustomer(
  state: GroceryState,
  id: string,
  changes: Partial<GroceryCustomer>,
): GroceryState {
  return {
    ...state,
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCustomer(state: GroceryState, id: string): GroceryState {
  return { ...state, customers: state.customers.filter((c) => c.id !== id) };
}

export function addVendor(state: GroceryState, vendor: GroceryVendor): GroceryState {
  return { ...state, vendors: [vendor, ...state.vendors] };
}

export function updateVendor(
  state: GroceryState,
  id: string,
  changes: Partial<GroceryVendor>,
): GroceryState {
  return {
    ...state,
    vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...changes } : v)),
  };
}

export function deleteVendor(state: GroceryState, id: string): GroceryState {
  return { ...state, vendors: state.vendors.filter((v) => v.id !== id) };
}

export function addPurchase(state: GroceryState, purchase: GroceryPurchase): GroceryState {
  return { ...state, purchases: [purchase, ...state.purchases] };
}

export function addSale(state: GroceryState, sale: GrocerySale): GroceryState {
  return { ...state, sales: [sale, ...state.sales] };
}
