import type {
  MedicalCategory,
  MedicalCustomer,
  MedicalManufacturer,
  MedicalMedicine,
  MedicalPrescription,
  MedicalPurchase,
  MedicalSale,
  MedicalSupplier,
} from "@/lib/types/medical";
import { medicalCategories } from "@/lib/mock-data/medical/categories";
import { medicalCustomers } from "@/lib/mock-data/medical/customers";
import { medicalManufacturers } from "@/lib/mock-data/medical/manufacturers";
import { medicalMedicines } from "@/lib/mock-data/medical/medicines";
import { medicalPrescriptions } from "@/lib/mock-data/medical/prescriptions";
import { medicalPurchases } from "@/lib/mock-data/medical/purchases";
import { medicalSales } from "@/lib/mock-data/medical/sales";
import { medicalSuppliers } from "@/lib/mock-data/medical/suppliers";

export const MEDICAL_STORAGE_KEY = "inventory:medical";

export interface MedicalState {
  medicines: MedicalMedicine[];
  customers: MedicalCustomer[];
  suppliers: MedicalSupplier[];
  categories: MedicalCategory[];
  manufacturers: MedicalManufacturer[];
  purchases: MedicalPurchase[];
  sales: MedicalSale[];
  prescriptions: MedicalPrescription[];
}

/**
 * Seeds initial state from mock data. Swap this for an async API/Prisma
 * fetch later without changing anything that consumes MedicalState.
 */
export function getInitialMedicalState(): MedicalState {
  return {
    medicines: medicalMedicines,
    customers: medicalCustomers,
    suppliers: medicalSuppliers,
    categories: medicalCategories,
    manufacturers: medicalManufacturers,
    purchases: medicalPurchases,
    sales: medicalSales,
    prescriptions: medicalPrescriptions,
  };
}

export function addMedicine(state: MedicalState, medicine: MedicalMedicine): MedicalState {
  return { ...state, medicines: [medicine, ...state.medicines] };
}

export function updateMedicine(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalMedicine>,
): MedicalState {
  return {
    ...state,
    medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...changes } : m)),
  };
}

export function deleteMedicine(state: MedicalState, id: string): MedicalState {
  return { ...state, medicines: state.medicines.filter((m) => m.id !== id) };
}

export function addCategory(state: MedicalState, category: MedicalCategory): MedicalState {
  return { ...state, categories: [category, ...state.categories] };
}

export function updateCategory(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalCategory>,
): MedicalState {
  return {
    ...state,
    categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCategory(state: MedicalState, id: string): MedicalState {
  return { ...state, categories: state.categories.filter((c) => c.id !== id) };
}

export function addManufacturer(state: MedicalState, manufacturer: MedicalManufacturer): MedicalState {
  return { ...state, manufacturers: [manufacturer, ...state.manufacturers] };
}

export function updateManufacturer(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalManufacturer>,
): MedicalState {
  return {
    ...state,
    manufacturers: state.manufacturers.map((m) => (m.id === id ? { ...m, ...changes } : m)),
  };
}

export function deleteManufacturer(state: MedicalState, id: string): MedicalState {
  return { ...state, manufacturers: state.manufacturers.filter((m) => m.id !== id) };
}

export function addCustomer(state: MedicalState, customer: MedicalCustomer): MedicalState {
  return { ...state, customers: [customer, ...state.customers] };
}

export function updateCustomer(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalCustomer>,
): MedicalState {
  return {
    ...state,
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...changes } : c)),
  };
}

export function deleteCustomer(state: MedicalState, id: string): MedicalState {
  return { ...state, customers: state.customers.filter((c) => c.id !== id) };
}

export function addSupplier(state: MedicalState, supplier: MedicalSupplier): MedicalState {
  return { ...state, suppliers: [supplier, ...state.suppliers] };
}

export function updateSupplier(
  state: MedicalState,
  id: string,
  changes: Partial<MedicalSupplier>,
): MedicalState {
  return {
    ...state,
    suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...changes } : s)),
  };
}

export function deleteSupplier(state: MedicalState, id: string): MedicalState {
  return { ...state, suppliers: state.suppliers.filter((s) => s.id !== id) };
}

export function addPurchase(state: MedicalState, purchase: MedicalPurchase): MedicalState {
  return { ...state, purchases: [purchase, ...state.purchases] };
}

export function addSale(state: MedicalState, sale: MedicalSale): MedicalState {
  return { ...state, sales: [sale, ...state.sales] };
}

export function updatePrescriptionStatus(
  state: MedicalState,
  id: string,
  status: MedicalPrescription["status"],
): MedicalState {
  return {
    ...state,
    prescriptions: state.prescriptions.map((p) => (p.id === id ? { ...p, status } : p)),
  };
}
