"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  ElectronicsBrand,
  ElectronicsCategory,
  ElectronicsCustomer,
  ElectronicsModel,
  ElectronicsProduct,
  ElectronicsPurchase,
  ElectronicsReturn,
  ElectronicsSale,
  ElectronicsVendor,
} from "@/lib/types/electronics";
import {
  addBrand,
  addCategory,
  addCustomer,
  addModel,
  addProduct,
  addPurchase,
  addReturn,
  addSale,
  addVendor,
  deleteBrand,
  deleteCategory,
  deleteCustomer,
  deleteModel,
  deleteProduct,
  deleteVendor,
  ELECTRONICS_STORAGE_KEY,
  getInitialElectronicsState,
  updateBrand,
  updateCategory,
  updateCustomer,
  updateModel,
  updateProduct,
  updateReturnStatus,
  updateVendor,
  type ElectronicsState,
} from "@/lib/data/electronicsRepository";
import { readStorage, writeStorage } from "@/lib/utils/storage";

type Action =
  | { type: "ADD_PRODUCT"; product: ElectronicsProduct }
  | { type: "UPDATE_PRODUCT"; id: string; changes: Partial<ElectronicsProduct> }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "ADD_CATEGORY"; category: ElectronicsCategory }
  | { type: "UPDATE_CATEGORY"; id: string; changes: Partial<ElectronicsCategory> }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "ADD_BRAND"; brand: ElectronicsBrand }
  | { type: "UPDATE_BRAND"; id: string; changes: Partial<ElectronicsBrand> }
  | { type: "DELETE_BRAND"; id: string }
  | { type: "ADD_MODEL"; model: ElectronicsModel }
  | { type: "UPDATE_MODEL"; id: string; changes: Partial<ElectronicsModel> }
  | { type: "DELETE_MODEL"; id: string }
  | { type: "ADD_CUSTOMER"; customer: ElectronicsCustomer }
  | { type: "UPDATE_CUSTOMER"; id: string; changes: Partial<ElectronicsCustomer> }
  | { type: "DELETE_CUSTOMER"; id: string }
  | { type: "ADD_VENDOR"; vendor: ElectronicsVendor }
  | { type: "UPDATE_VENDOR"; id: string; changes: Partial<ElectronicsVendor> }
  | { type: "DELETE_VENDOR"; id: string }
  | { type: "ADD_PURCHASE"; purchase: ElectronicsPurchase }
  | { type: "ADD_SALE"; sale: ElectronicsSale }
  | { type: "ADD_RETURN"; ret: ElectronicsReturn }
  | { type: "UPDATE_RETURN_STATUS"; id: string; status: ElectronicsReturn["status"] }
  | { type: "HYDRATE"; state: ElectronicsState };

function reducer(state: ElectronicsState, action: Action): ElectronicsState {
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
    case "ADD_MODEL":
      return addModel(state, action.model);
    case "UPDATE_MODEL":
      return updateModel(state, action.id, action.changes);
    case "DELETE_MODEL":
      return deleteModel(state, action.id);
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
    case "ADD_RETURN":
      return addReturn(state, action.ret);
    case "UPDATE_RETURN_STATUS":
      return updateReturnStatus(state, action.id, action.status);
    case "HYDRATE":
      return { ...getInitialElectronicsState(), ...action.state };
    default:
      return state;
  }
}

interface ElectronicsDataContextValue extends ElectronicsState {
  addProduct: (product: ElectronicsProduct) => void;
  updateProduct: (id: string, changes: Partial<ElectronicsProduct>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: ElectronicsCategory) => void;
  updateCategory: (id: string, changes: Partial<ElectronicsCategory>) => void;
  deleteCategory: (id: string) => void;
  addBrand: (brand: ElectronicsBrand) => void;
  updateBrand: (id: string, changes: Partial<ElectronicsBrand>) => void;
  deleteBrand: (id: string) => void;
  addModel: (model: ElectronicsModel) => void;
  updateModel: (id: string, changes: Partial<ElectronicsModel>) => void;
  deleteModel: (id: string) => void;
  addCustomer: (customer: ElectronicsCustomer) => void;
  updateCustomer: (id: string, changes: Partial<ElectronicsCustomer>) => void;
  deleteCustomer: (id: string) => void;
  addVendor: (vendor: ElectronicsVendor) => void;
  updateVendor: (id: string, changes: Partial<ElectronicsVendor>) => void;
  deleteVendor: (id: string) => void;
  addPurchase: (purchase: ElectronicsPurchase) => void;
  addSale: (sale: ElectronicsSale) => void;
  addReturn: (ret: ElectronicsReturn) => void;
  updateReturnStatus: (id: string, status: ElectronicsReturn["status"]) => void;
}

const ElectronicsDataContext = createContext<ElectronicsDataContextValue | null>(null);

export function ElectronicsDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialElectronicsState);

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
    const stored = readStorage<ElectronicsState>(ELECTRONICS_STORAGE_KEY);
    if (stored) {
      dispatch({ type: "HYDRATE", state: stored });
    } else {
      writeStorage(ELECTRONICS_STORAGE_KEY, state);
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
    writeStorage(ELECTRONICS_STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<ElectronicsDataContextValue>(
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
      addModel: (model) => dispatch({ type: "ADD_MODEL", model }),
      updateModel: (id, changes) => dispatch({ type: "UPDATE_MODEL", id, changes }),
      deleteModel: (id) => dispatch({ type: "DELETE_MODEL", id }),
      addCustomer: (customer) => dispatch({ type: "ADD_CUSTOMER", customer }),
      updateCustomer: (id, changes) => dispatch({ type: "UPDATE_CUSTOMER", id, changes }),
      deleteCustomer: (id) => dispatch({ type: "DELETE_CUSTOMER", id }),
      addVendor: (vendor) => dispatch({ type: "ADD_VENDOR", vendor }),
      updateVendor: (id, changes) => dispatch({ type: "UPDATE_VENDOR", id, changes }),
      deleteVendor: (id) => dispatch({ type: "DELETE_VENDOR", id }),
      addPurchase: (purchase) => dispatch({ type: "ADD_PURCHASE", purchase }),
      addSale: (sale) => dispatch({ type: "ADD_SALE", sale }),
      addReturn: (ret) => dispatch({ type: "ADD_RETURN", ret }),
      updateReturnStatus: (id, status) => dispatch({ type: "UPDATE_RETURN_STATUS", id, status }),
    }),
    [state],
  );

  return (
    <ElectronicsDataContext.Provider value={value}>
      {isHydrated ? children : null}
    </ElectronicsDataContext.Provider>
  );
}

export function useElectronicsData() {
  const ctx = useContext(ElectronicsDataContext);
  if (!ctx) {
    throw new Error("useElectronicsData must be used within an ElectronicsDataProvider");
  }
  return ctx;
}
