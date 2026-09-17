import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Tags,
  Award,
  PlusCircle,
  ShoppingCart,
  Receipt,
  Boxes,
  AlertTriangle,
  CalendarClock,
  FileBarChart,
  Pill,
  Factory,
  Layers,
  ClipboardList,
  Smartphone,
  ScanBarcode,
  ShieldCheck,
  Undo2,
  SlidersHorizontal,
  Recycle,
  ReceiptIndianRupee,
} from "lucide-react";
import type { Vertical } from "@/lib/types/shared";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional section header this item is grouped under. Verticals that omit
   *  it on every item (Grocery, Electronics) render as a flat list, unchanged. */
  section?: string;
}

const base = (vertical: Vertical) => `/inventory/${vertical}`;

export const groceryNav: NavItem[] = [
  { label: "Dashboard", href: `${base("grocery")}/dashboard`, icon: LayoutDashboard },
  { label: "Customers", href: `${base("grocery")}/customers`, icon: Users },
  { label: "Vendors", href: `${base("grocery")}/vendors`, icon: Truck },
  { label: "Products", href: `${base("grocery")}/products`, icon: Package },
  { label: "Categories", href: `${base("grocery")}/categories`, icon: Tags },
  { label: "Brands", href: `${base("grocery")}/brands`, icon: Award },
  { label: "New Entry", href: `${base("grocery")}/new-entry`, icon: PlusCircle },
  { label: "Purchases", href: `${base("grocery")}/purchases`, icon: ShoppingCart },
  { label: "Sales", href: `${base("grocery")}/sales`, icon: Receipt },
  { label: "Inventory", href: `${base("grocery")}/inventory`, icon: Boxes },
  { label: "Low Stock", href: `${base("grocery")}/low-stock`, icon: AlertTriangle },
  { label: "Expiry", href: `${base("grocery")}/expiry`, icon: CalendarClock },
  { label: "Stock Adjustments", href: `${base("grocery")}/stock-adjustments`, icon: SlidersHorizontal },
  { label: "Wastage", href: `${base("grocery")}/wastage`, icon: Recycle },
  { label: "Reports", href: `${base("grocery")}/reports`, icon: FileBarChart },
];

export const medicalNav: NavItem[] = [
  { label: "Dashboard", href: `${base("medical")}/dashboard`, icon: LayoutDashboard, section: "Dashboard" },

  { label: "Customers", href: `${base("medical")}/customers`, icon: Users, section: "Masters" },
  { label: "Suppliers", href: `${base("medical")}/suppliers`, icon: Truck, section: "Masters" },
  { label: "Medicines", href: `${base("medical")}/medicines`, icon: Pill, section: "Masters" },
  { label: "Categories", href: `${base("medical")}/categories`, icon: Tags, section: "Masters" },
  { label: "Manufacturers", href: `${base("medical")}/manufacturers`, icon: Factory, section: "Masters" },

  { label: "Purchases", href: `${base("medical")}/purchases`, icon: ShoppingCart, section: "Purchasing" },

  { label: "Sales", href: `${base("medical")}/sales`, icon: ReceiptIndianRupee, section: "Sales" },
  { label: "Prescriptions", href: `${base("medical")}/prescriptions`, icon: ClipboardList, section: "Sales" },

  { label: "Inventory", href: `${base("medical")}/inventory`, icon: Boxes, section: "Inventory" },
  {
    label: "Stock Adjustments",
    href: `${base("medical")}/stock-adjustments`,
    icon: SlidersHorizontal,
    section: "Inventory",
  },
  { label: "Batches", href: `${base("medical")}/batches`, icon: Layers, section: "Inventory" },
  { label: "Low Stock", href: `${base("medical")}/low-stock`, icon: AlertTriangle, section: "Inventory" },
  { label: "Expiry", href: `${base("medical")}/expiry`, icon: CalendarClock, section: "Inventory" },
];

export const electronicsNav: NavItem[] = [
  { label: "Dashboard", href: `${base("electronics")}/dashboard`, icon: LayoutDashboard },
  { label: "Customers", href: `${base("electronics")}/customers`, icon: Users },
  { label: "Vendors", href: `${base("electronics")}/vendors`, icon: Truck },
  { label: "Products", href: `${base("electronics")}/products`, icon: Package },
  { label: "Categories", href: `${base("electronics")}/categories`, icon: Tags },
  { label: "Brands", href: `${base("electronics")}/brands`, icon: Award },
  { label: "Models", href: `${base("electronics")}/models`, icon: Smartphone },
  { label: "New Entry", href: `${base("electronics")}/new-entry`, icon: PlusCircle },
  { label: "Purchases", href: `${base("electronics")}/purchases`, icon: ShoppingCart },
  { label: "Sales", href: `${base("electronics")}/sales`, icon: Receipt },
  { label: "Inventory", href: `${base("electronics")}/inventory`, icon: Boxes },
  { label: "Serial Numbers", href: `${base("electronics")}/serial-numbers`, icon: ScanBarcode },
  { label: "Warranty", href: `${base("electronics")}/warranty`, icon: ShieldCheck },
  { label: "Returns", href: `${base("electronics")}/returns`, icon: Undo2 },
  { label: "Reports", href: `${base("electronics")}/reports`, icon: FileBarChart },
];

export const navByVertical: Record<Vertical, NavItem[]> = {
  grocery: groceryNav,
  medical: medicalNav,
  electronics: electronicsNav,
};
