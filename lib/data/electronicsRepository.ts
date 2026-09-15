import type {
  ElectronicsBrand,
  ElectronicsCategory,
  ElectronicsCustomer,
  ElectronicsModel,
  ElectronicsProduct,
  ElectronicsPurchase,
  ElectronicsReturn,
  ElectronicsSale,
  ElectronicsSerial,
  ElectronicsVendor,
} from "@/lib/types/electronics";
import { electronicsBrands } from "@/lib/mock-data/electronics/brands";
import { electronicsCategories } from "@/lib/mock-data/electronics/categories";
import { electronicsCustomers } from "@/lib/mock-data/electronics/customers";
import { electronicsModels } from "@/lib/mock-data/electronics/models";
import { electronicsProducts } from "@/lib/mock-data/electronics/products";
import { electronicsPurchases } from "@/lib/mock-data/electronics/purchases";
import { electronicsReturns } from "@/lib/mock-data/electronics/returns";
import { electronicsSales } from "@/lib/mock-data/electronics/sales";
import { electronicsSerials } from "@/lib/mock-data/electronics/serials";
import { electronicsVendors } from "@/lib/mock-data/electronics/vendors";

export const ELECTRONICS_STORAGE_KEY = "inventory:electronics";

export interface ElectronicsState {
  products: ElectronicsProduct[];
  customers: ElectronicsCustomer[];
  vendors: ElectronicsVendor[];
  categories: ElectronicsCategory[];
  brands: ElectronicsBrand[];
  models: ElectronicsModel[];
  purchases: ElectronicsPurchase[];
  sales: ElectronicsSale[];
  serials: ElectronicsSerial[];
  returns: ElectronicsReturn[];
}

/**
 * Seeds initial state from mock data. Swap this for an async API/Prisma
 * fetch later without changing anything that consumes ElectronicsState.
 */
export function getInitialElectronicsState(): ElectronicsState {
  return {
    products: electronicsProducts,
    customers: electronicsCustomers,
    vendors: electronicsVendors,
    categories: electronicsCategories,
    brands: electronicsBrands,
    models: electronicsModels,
    purchases: electronicsPurchases,
    sales: electronicsSales,
    serials: electronicsSerials,
    returns: electronicsReturns,
  };
}

// --- Products ---

export function addProduct(state: ElectronicsState, product: ElectronicsProduct): ElectronicsState {
  return { ...state, products: [product, ...state.products] };
}

export function updateProduct(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsProduct>,
): ElectronicsState {
  return {
    ...state,
    products: state.products.map((p) => (p.id === id ? { ...p, ...changes } : p)),
  };
}

export function deleteProduct(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, products: state.products.filter((p) => p.id !== id) };
}

// --- Categories ---

export function addCategory(state: ElectronicsState, category: ElectronicsCategory): ElectronicsState {
  return { ...state, categories: [category, ...state.categories] };
}

export function updateCategory(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsCategory>,
): ElectronicsState {
  return {
    ...state,
    categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCategory(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, categories: state.categories.filter((c) => c.id !== id) };
}

// --- Brands ---

export function addBrand(state: ElectronicsState, brand: ElectronicsBrand): ElectronicsState {
  return { ...state, brands: [brand, ...state.brands] };
}

export function updateBrand(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsBrand>,
): ElectronicsState {
  return {
    ...state,
    brands: state.brands.map((b) => (b.id === id ? { ...b, ...changes } : b)),
  };
}

export function deleteBrand(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, brands: state.brands.filter((b) => b.id !== id) };
}

// --- Models ---

export function addModel(state: ElectronicsState, model: ElectronicsModel): ElectronicsState {
  return { ...state, models: [model, ...state.models] };
}

export function updateModel(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsModel>,
): ElectronicsState {
  return {
    ...state,
    models: state.models.map((m) => (m.id === id ? { ...m, ...changes } : m)),
  };
}

export function deleteModel(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, models: state.models.filter((m) => m.id !== id) };
}

// --- Customers ---

export function addCustomer(state: ElectronicsState, customer: ElectronicsCustomer): ElectronicsState {
  return { ...state, customers: [customer, ...state.customers] };
}

export function updateCustomer(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsCustomer>,
): ElectronicsState {
  return {
    ...state,
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCustomer(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, customers: state.customers.filter((c) => c.id !== id) };
}

// --- Vendors ---

export function addVendor(state: ElectronicsState, vendor: ElectronicsVendor): ElectronicsState {
  return { ...state, vendors: [vendor, ...state.vendors] };
}

export function updateVendor(
  state: ElectronicsState,
  id: string,
  changes: Partial<ElectronicsVendor>,
): ElectronicsState {
  return {
    ...state,
    vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...changes } : v)),
  };
}

export function deleteVendor(state: ElectronicsState, id: string): ElectronicsState {
  return { ...state, vendors: state.vendors.filter((v) => v.id !== id) };
}

// --- Purchases & Sales (add-only, mirroring Grocery/Medical) ---

export function addPurchase(state: ElectronicsState, purchase: ElectronicsPurchase): ElectronicsState {
  return { ...state, purchases: [purchase, ...state.purchases] };
}

export function addSale(state: ElectronicsState, sale: ElectronicsSale): ElectronicsState {
  return { ...state, sales: [sale, ...state.sales] };
}

// --- Returns ---

export function addReturn(state: ElectronicsState, ret: ElectronicsReturn): ElectronicsState {
  return { ...state, returns: [ret, ...state.returns] };
}

export function updateReturnStatus(
  state: ElectronicsState,
  id: string,
  status: ElectronicsReturn["status"],
): ElectronicsState {
  const target = state.returns.find((r) => r.id === id);
  const nextReturns = state.returns.map((r) => (r.id === id ? { ...r, status } : r));

  // Approving a return marks the corresponding unit as returned so it drops
  // out of "sold" reporting on the Serial Numbers / Warranty pages.
  if (status === "approved" && target?.serialNumber) {
    return {
      ...state,
      returns: nextReturns,
      serials: state.serials.map((s) =>
        s.serialNumber === target.serialNumber ? { ...s, status: "returned" } : s,
      ),
    };
  }

  return { ...state, returns: nextReturns };
}
