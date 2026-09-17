"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  GroceryBrand,
  GroceryCategory,
  GroceryCustomer,
  GroceryProduct,
  GroceryPurchase,
  GrocerySale,
  GroceryStockAdjustment,
  GroceryVendor,
} from "@/lib/types/grocery";
import {
  addBrand,
  addCategory,
  addCustomer,
  addProduct,
  addPurchase,
  addSale,
  addStockAdjustment,
  addVendor,
  deleteBrand,
  deleteCategory,
  deleteCustomer,
  deleteProduct,
  deleteVendor,
  getInitialGroceryState,
  GROCERY_STORAGE_KEY,
  updateBrand,
  updateCategory,
  updateCustomer,
  updateProduct,
  updateVendor,
  type GroceryState,
} from "@/lib/data/groceryRepository";
import { readStorage, writeStorage } from "@/lib/utils/storage";

type Action =
  | { type: "ADD_PRODUCT"; product: GroceryProduct }
  | { type: "UPDATE_PRODUCT"; id: string; changes: Partial<GroceryProduct> }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "ADD_CATEGORY"; category: GroceryCategory }
  | { type: "UPDATE_CATEGORY"; id: string; changes: Partial<GroceryCategory> }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "ADD_BRAND"; brand: GroceryBrand }
  | { type: "UPDATE_BRAND"; id: string; changes: Partial<GroceryBrand> }
  | { type: "DELETE_BRAND"; id: string }
  | { type: "ADD_CUSTOMER"; customer: GroceryCustomer }
  | { type: "UPDATE_CUSTOMER"; id: string; changes: Partial<GroceryCustomer> }
  | { type: "DELETE_CUSTOMER"; id: string }
  | { type: "ADD_VENDOR"; vendor: GroceryVendor }
  | { type: "UPDATE_VENDOR"; id: string; changes: Partial<GroceryVendor> }
  | { type: "DELETE_VENDOR"; id: string }
  | { type: "ADD_PURCHASE"; purchase: GroceryPurchase }
  | { type: "ADD_SALE"; sale: GrocerySale }
  | { type: "ADD_STOCK_ADJUSTMENT"; adjustment: GroceryStockAdjustment }
  | { type: "HYDRATE"; state: GroceryState };

function reducer(state: GroceryState, action: Action): GroceryState {
  switch (action.type) {
    case "ADD_PRODUCT":
      return addProduct(state, action.product);
    case "UPDATE_PRODUCT":
      return updateProduct(state, action.id, action.changes);
    case "DELETE_PRODUCT":
      return deleteProduct(state, action.id);
    case "ADD_CATEGORY":
      return addCategory(state, action.category);
    case "UPDATE_CATEGORY":
      return updateCategory(state, action.id, action.changes);
    case "DELETE_CATEGORY":
      return deleteCategory(state, action.id);
    case "ADD_BRAND":
      return addBrand(state, action.brand);
    case "UPDATE_BRAND":
      return updateBrand(state, action.id, action.changes);
    case "DELETE_BRAND":
      return deleteBrand(state, action.id);
    case "ADD_CUSTOMER":
      return addCustomer(state, action.customer);
    case "UPDATE_CUSTOMER":
      return updateCustomer(state, action.id, action.changes);
    case "DELETE_CUSTOMER":
      return deleteCustomer(state, action.id);
    case "ADD_VENDOR":
      return addVendor(state, action.vendor);
    case "UPDATE_VENDOR":
      return updateVendor(state, action.id, action.changes);
    case "DELETE_VENDOR":
      return deleteVendor(state, action.id);
    case "ADD_PURCHASE":
      return addPurchase(state, action.purchase);
    case "ADD_SALE":
      return addSale(state, action.sale);
    case "ADD_STOCK_ADJUSTMENT":
      return addStockAdjustment(state, action.adjustment);
    case "HYDRATE":
      return { ...getInitialGroceryState(), ...action.state };
    default:
      return state;
  }
}

interface GroceryDataContextValue extends GroceryState {
  addProduct: (product: GroceryProduct) => void;
  updateProduct: (id: string, changes: Partial<GroceryProduct>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: GroceryCategory) => void;
  updateCategory: (id: string, changes: Partial<GroceryCategory>) => void;
  deleteCategory: (id: string) => void;
  addBrand: (brand: GroceryBrand) => void;
  updateBrand: (id: string, changes: Partial<GroceryBrand>) => void;
  deleteBrand: (id: string) => void;
  addCustomer: (customer: GroceryCustomer) => void;
  updateCustomer: (id: string, changes: Partial<GroceryCustomer>) => void;
  deleteCustomer: (id: string) => void;
  addVendor: (vendor: GroceryVendor) => void;
  updateVendor: (id: string, changes: Partial<GroceryVendor>) => void;
  deleteVendor: (id: string) => void;
  addPurchase: (purchase: GroceryPurchase) => void;
  addSale: (sale: GrocerySale) => void;
  addStockAdjustment: (adjustment: GroceryStockAdjustment) => void;
}

const GroceryDataContext = createContext<GroceryDataContextValue | null>(null);

export function GroceryDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialGroceryState);

  // Gates rendering of `children` (and thus the mock-seeded state) until
  // localStorage has been checked and, if needed, the HYDRATE dispatch below
  // has landed. Starts false on both server and client so the first client
  // render matches the server render (no hydration mismatch); flips to true
  // only after the effect below runs on the client. A dedicated reducer
  // (rather than useState) keeps this a one-way flip via `dispatch`,
  // consistent with how the rest of this provider updates state in effects.
  const [isHydrated, markHydrated] = useReducer(() => true, false);

  // Load persisted data once on mount (client-only, after the deterministic
  // mock-seeded first render) to avoid SSR/hydration mismatches. Only seed
  // storage from mock data when nothing is persisted yet — never write here
  // when `stored` exists, since `state` at this point is still the
  // pre-hydration mock seed and would clobber the real persisted data before
  // the HYDRATE dispatch below has landed.
  useEffect(() => {
    const stored = readStorage<GroceryState>(GROCERY_STORAGE_KEY);
    if (stored) {
      dispatch({ type: "HYDRATE", state: stored });
    } else {
      writeStorage(GROCERY_STORAGE_KEY, state);
    }
    markHydrated();
    // Mount-only: `state` here is intentionally the initial mock seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist every subsequent state change (skip the initial mount render so
  // this never races the hydration effect above with a stale pre-hydration
  // write — by the time this effect fires again, either the HYDRATE dispatch
  // has landed, or a real CRUD change has occurred).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    writeStorage(GROCERY_STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<GroceryDataContextValue>(
    () => ({
      ...state,
      addProduct: (product) => dispatch({ type: "ADD_PRODUCT", product }),
      updateProduct: (id, changes) => dispatch({ type: "UPDATE_PRODUCT", id, changes }),
      deleteProduct: (id) => dispatch({ type: "DELETE_PRODUCT", id }),
      addCategory: (category) => dispatch({ type: "ADD_CATEGORY", category }),
      updateCategory: (id, changes) => dispatch({ type: "UPDATE_CATEGORY", id, changes }),
      deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", id }),
      addBrand: (brand) => dispatch({ type: "ADD_BRAND", brand }),
      updateBrand: (id, changes) => dispatch({ type: "UPDATE_BRAND", id, changes }),
      deleteBrand: (id) => dispatch({ type: "DELETE_BRAND", id }),
      addCustomer: (customer) => dispatch({ type: "ADD_CUSTOMER", customer }),
      updateCustomer: (id, changes) => dispatch({ type: "UPDATE_CUSTOMER", id, changes }),
      deleteCustomer: (id) => dispatch({ type: "DELETE_CUSTOMER", id }),
      addVendor: (vendor) => dispatch({ type: "ADD_VENDOR", vendor }),
      updateVendor: (id, changes) => dispatch({ type: "UPDATE_VENDOR", id, changes }),
      deleteVendor: (id) => dispatch({ type: "DELETE_VENDOR", id }),
      addPurchase: (purchase) => dispatch({ type: "ADD_PURCHASE", purchase }),
      addSale: (sale) => dispatch({ type: "ADD_SALE", sale }),
      addStockAdjustment: (adjustment) => dispatch({ type: "ADD_STOCK_ADJUSTMENT", adjustment }),
    }),
    [state],
  );

  return (
    <GroceryDataContext.Provider value={value}>{isHydrated ? children : null}</GroceryDataContext.Provider>
  );
}

export function useGroceryData() {
  const ctx = useContext(GroceryDataContext);
  if (!ctx) {
    throw new Error("useGroceryData must be used within a GroceryDataProvider");
  }
  return ctx;
}
