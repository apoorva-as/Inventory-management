"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import type {
  MedicalCategory,
  MedicalCustomer,
  MedicalManufacturer,
  MedicalMedicine,
  MedicalPrescription,
  MedicalPurchase,
  MedicalPurchaseOrder,
  MedicalPurchaseReturn,
  MedicalSale,
  MedicalSalesReturn,
  MedicalStockAdjustment,
  MedicalSupplier,
} from "@/lib/types/medical";
import type { OrderStatus } from "@/lib/types/shared";
import {
  addCategory,
  addCustomer,
  addManufacturer,
  addMedicine,
  addPrescription,
  addPurchase,
  addPurchaseOrder,
  addPurchaseReturn,
  addSale,
  addSalesReturn,
  addStockAdjustment,
  addSupplier,
  cancelPurchaseOrder,
  deleteCategory,
  deleteCustomer,
  deleteManufacturer,
  deleteMedicine,
  deleteSupplier,
  fulfillPrescription,
  getInitialMedicalState,
  MEDICAL_STORAGE_KEY,
  receivePurchaseOrder,
  updateCategory,
  updateCustomer,
  updateManufacturer,
  updateMedicine,
  updatePrescriptionStatus,
  updatePurchaseOrder,
  updatePurchaseStatus,
  updateSaleStatus,
  updateSupplier,
  type MedicalState,
  type ReceivedPoLine,
} from "@/lib/data/medicalRepository";
import { readStorage, writeStorage } from "@/lib/utils/storage";

type Action =
  | { type: "ADD_MEDICINE"; medicine: MedicalMedicine }
  | { type: "UPDATE_MEDICINE"; id: string; changes: Partial<MedicalMedicine> }
  | { type: "DELETE_MEDICINE"; id: string }
  | { type: "ADD_CATEGORY"; category: MedicalCategory }
  | { type: "UPDATE_CATEGORY"; id: string; changes: Partial<MedicalCategory> }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "ADD_MANUFACTURER"; manufacturer: MedicalManufacturer }
  | { type: "UPDATE_MANUFACTURER"; id: string; changes: Partial<MedicalManufacturer> }
  | { type: "DELETE_MANUFACTURER"; id: string }
  | { type: "ADD_CUSTOMER"; customer: MedicalCustomer }
  | { type: "UPDATE_CUSTOMER"; id: string; changes: Partial<MedicalCustomer> }
  | { type: "DELETE_CUSTOMER"; id: string }
  | { type: "ADD_SUPPLIER"; supplier: MedicalSupplier }
  | { type: "UPDATE_SUPPLIER"; id: string; changes: Partial<MedicalSupplier> }
  | { type: "DELETE_SUPPLIER"; id: string }
  | { type: "ADD_PURCHASE"; purchase: MedicalPurchase }
  | { type: "UPDATE_PURCHASE_STATUS"; id: string; status: OrderStatus }
  | { type: "ADD_PURCHASE_ORDER"; po: MedicalPurchaseOrder }
  | { type: "UPDATE_PURCHASE_ORDER"; id: string; changes: Partial<MedicalPurchaseOrder> }
  | { type: "CANCEL_PURCHASE_ORDER"; id: string }
  | { type: "RECEIVE_PURCHASE_ORDER"; poId: string; receivedLines: ReceivedPoLine[]; date: string }
  | { type: "ADD_SALE"; sale: MedicalSale }
  | { type: "UPDATE_SALE_STATUS"; id: string; status: OrderStatus }
  | { type: "ADD_PRESCRIPTION"; prescription: MedicalPrescription }
  | { type: "UPDATE_PRESCRIPTION_STATUS"; id: string; status: MedicalPrescription["status"] }
  | { type: "FULFILL_PRESCRIPTION"; prescriptionId: string; saleId: string }
  | { type: "ADD_SALES_RETURN"; ret: MedicalSalesReturn }
  | { type: "ADD_PURCHASE_RETURN"; ret: MedicalPurchaseReturn }
  | { type: "ADD_STOCK_ADJUSTMENT"; adjustment: MedicalStockAdjustment }
  | { type: "HYDRATE"; state: MedicalState };

function reducer(state: MedicalState, action: Action): MedicalState {
  switch (action.type) {
    case "ADD_MEDICINE":
      return addMedicine(state, action.medicine);
    case "UPDATE_MEDICINE":
      return updateMedicine(state, action.id, action.changes);
    case "DELETE_MEDICINE":
      return deleteMedicine(state, action.id);
    case "ADD_CATEGORY":
      return addCategory(state, action.category);
    case "UPDATE_CATEGORY":
      return updateCategory(state, action.id, action.changes);
    case "DELETE_CATEGORY":
      return deleteCategory(state, action.id);
    case "ADD_MANUFACTURER":
      return addManufacturer(state, action.manufacturer);
    case "UPDATE_MANUFACTURER":
      return updateManufacturer(state, action.id, action.changes);
    case "DELETE_MANUFACTURER":
      return deleteManufacturer(state, action.id);
    case "ADD_CUSTOMER":
      return addCustomer(state, action.customer);
    case "UPDATE_CUSTOMER":
      return updateCustomer(state, action.id, action.changes);
    case "DELETE_CUSTOMER":
      return deleteCustomer(state, action.id);
    case "ADD_SUPPLIER":
      return addSupplier(state, action.supplier);
    case "UPDATE_SUPPLIER":
      return updateSupplier(state, action.id, action.changes);
    case "DELETE_SUPPLIER":
      return deleteSupplier(state, action.id);
    case "ADD_PURCHASE":
      return addPurchase(state, action.purchase);
    case "UPDATE_PURCHASE_STATUS":
      return updatePurchaseStatus(state, action.id, action.status);
    case "ADD_PURCHASE_ORDER":
      return addPurchaseOrder(state, action.po);
    case "UPDATE_PURCHASE_ORDER":
      return updatePurchaseOrder(state, action.id, action.changes);
    case "CANCEL_PURCHASE_ORDER":
      return cancelPurchaseOrder(state, action.id);
    case "RECEIVE_PURCHASE_ORDER":
      return receivePurchaseOrder(state, action.poId, action.receivedLines, action.date);
    case "ADD_SALE":
      return addSale(state, action.sale);
    case "UPDATE_SALE_STATUS":
      return updateSaleStatus(state, action.id, action.status);
    case "ADD_PRESCRIPTION":
      return addPrescription(state, action.prescription);
    case "UPDATE_PRESCRIPTION_STATUS":
      return updatePrescriptionStatus(state, action.id, action.status);
    case "FULFILL_PRESCRIPTION":
      return fulfillPrescription(state, action.prescriptionId, action.saleId);
    case "ADD_SALES_RETURN":
      return addSalesReturn(state, action.ret);
    case "ADD_PURCHASE_RETURN":
      return addPurchaseReturn(state, action.ret);
    case "ADD_STOCK_ADJUSTMENT":
      return addStockAdjustment(state, action.adjustment);
    case "HYDRATE":
      return { ...getInitialMedicalState(), ...action.state };
    default:
      return state;
  }
}

interface MedicalDataContextValue extends MedicalState {
  addMedicine: (medicine: MedicalMedicine) => void;
  updateMedicine: (id: string, changes: Partial<MedicalMedicine>) => void;
  deleteMedicine: (id: string) => void;
  addCategory: (category: MedicalCategory) => void;
  updateCategory: (id: string, changes: Partial<MedicalCategory>) => void;
  deleteCategory: (id: string) => void;
  addManufacturer: (manufacturer: MedicalManufacturer) => void;
  updateManufacturer: (id: string, changes: Partial<MedicalManufacturer>) => void;
  deleteManufacturer: (id: string) => void;
  addCustomer: (customer: MedicalCustomer) => void;
  updateCustomer: (id: string, changes: Partial<MedicalCustomer>) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (supplier: MedicalSupplier) => void;
  updateSupplier: (id: string, changes: Partial<MedicalSupplier>) => void;
  deleteSupplier: (id: string) => void;
  addPurchase: (purchase: MedicalPurchase) => void;
  updatePurchaseStatus: (id: string, status: OrderStatus) => void;
  addPurchaseOrder: (po: MedicalPurchaseOrder) => void;
  updatePurchaseOrder: (id: string, changes: Partial<MedicalPurchaseOrder>) => void;
  cancelPurchaseOrder: (id: string) => void;
  receivePurchaseOrder: (poId: string, receivedLines: ReceivedPoLine[], date: string) => void;
  addSale: (sale: MedicalSale) => void;
  updateSaleStatus: (id: string, status: OrderStatus) => void;
  addPrescription: (prescription: MedicalPrescription) => void;
  updatePrescriptionStatus: (id: string, status: MedicalPrescription["status"]) => void;
  fulfillPrescription: (prescriptionId: string, saleId: string) => void;
  addSalesReturn: (ret: MedicalSalesReturn) => void;
  addPurchaseReturn: (ret: MedicalPurchaseReturn) => void;
  addStockAdjustment: (adjustment: MedicalStockAdjustment) => void;
}

const MedicalDataContext = createContext<MedicalDataContextValue | null>(null);

export function MedicalDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialMedicalState);

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
    const stored = readStorage<MedicalState>(MEDICAL_STORAGE_KEY);
    if (stored) {
      dispatch({ type: "HYDRATE", state: stored });
    } else {
      writeStorage(MEDICAL_STORAGE_KEY, state);
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
    writeStorage(MEDICAL_STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<MedicalDataContextValue>(
    () => ({
      ...state,
      addMedicine: (medicine) => dispatch({ type: "ADD_MEDICINE", medicine }),
      updateMedicine: (id, changes) => dispatch({ type: "UPDATE_MEDICINE", id, changes }),
      deleteMedicine: (id) => dispatch({ type: "DELETE_MEDICINE", id }),
      addCategory: (category) => dispatch({ type: "ADD_CATEGORY", category }),
      updateCategory: (id, changes) => dispatch({ type: "UPDATE_CATEGORY", id, changes }),
      deleteCategory: (id) => dispatch({ type: "DELETE_CATEGORY", id }),
      addManufacturer: (manufacturer) => dispatch({ type: "ADD_MANUFACTURER", manufacturer }),
      updateManufacturer: (id, changes) => dispatch({ type: "UPDATE_MANUFACTURER", id, changes }),
      deleteManufacturer: (id) => dispatch({ type: "DELETE_MANUFACTURER", id }),
      addCustomer: (customer) => dispatch({ type: "ADD_CUSTOMER", customer }),
      updateCustomer: (id, changes) => dispatch({ type: "UPDATE_CUSTOMER", id, changes }),
      deleteCustomer: (id) => dispatch({ type: "DELETE_CUSTOMER", id }),
      addSupplier: (supplier) => dispatch({ type: "ADD_SUPPLIER", supplier }),
      updateSupplier: (id, changes) => dispatch({ type: "UPDATE_SUPPLIER", id, changes }),
      deleteSupplier: (id) => dispatch({ type: "DELETE_SUPPLIER", id }),
      addPurchase: (purchase) => dispatch({ type: "ADD_PURCHASE", purchase }),
      updatePurchaseStatus: (id, status) => dispatch({ type: "UPDATE_PURCHASE_STATUS", id, status }),
      addPurchaseOrder: (po) => dispatch({ type: "ADD_PURCHASE_ORDER", po }),
      updatePurchaseOrder: (id, changes) => dispatch({ type: "UPDATE_PURCHASE_ORDER", id, changes }),
      cancelPurchaseOrder: (id) => dispatch({ type: "CANCEL_PURCHASE_ORDER", id }),
      receivePurchaseOrder: (poId, receivedLines, date) =>
        dispatch({ type: "RECEIVE_PURCHASE_ORDER", poId, receivedLines, date }),
      addSale: (sale) => dispatch({ type: "ADD_SALE", sale }),
      updateSaleStatus: (id, status) => dispatch({ type: "UPDATE_SALE_STATUS", id, status }),
      addPrescription: (prescription) => dispatch({ type: "ADD_PRESCRIPTION", prescription }),
      updatePrescriptionStatus: (id, status) =>
        dispatch({ type: "UPDATE_PRESCRIPTION_STATUS", id, status }),
      fulfillPrescription: (prescriptionId, saleId) =>
        dispatch({ type: "FULFILL_PRESCRIPTION", prescriptionId, saleId }),
      addSalesReturn: (ret) => dispatch({ type: "ADD_SALES_RETURN", ret }),
      addPurchaseReturn: (ret) => dispatch({ type: "ADD_PURCHASE_RETURN", ret }),
      addStockAdjustment: (adjustment) => dispatch({ type: "ADD_STOCK_ADJUSTMENT", adjustment }),
    }),
    [state],
  );

  return (
    <MedicalDataContext.Provider value={value}>{isHydrated ? children : null}</MedicalDataContext.Provider>
  );
}

export function useMedicalData() {
  const ctx = useContext(MedicalDataContext);
  if (!ctx) {
    throw new Error("useMedicalData must be used within a MedicalDataProvider");
  }
  return ctx;
}
