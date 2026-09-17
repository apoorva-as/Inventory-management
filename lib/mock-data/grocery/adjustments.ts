import type { GroceryStockAdjustment } from "@/lib/types/grocery";

export const groceryAdjustments: GroceryStockAdjustment[] = [
  {
    id: "gadj-001",
    productId: "gp-006",
    productName: "Whole Wheat Bread",
    type: "decrease",
    reason: "Damaged",
    quantity: 5,
    date: "2026-09-10",
    notes: "Crushed during delivery unloading.",
  },
  {
    id: "gadj-002",
    productId: "gp-009",
    productName: "Free Range Eggs (Tray of 30)",
    type: "decrease",
    reason: "Wastage",
    quantity: 3,
    date: "2026-09-12",
    notes: "Trays cracked in cold storage.",
  },
  {
    id: "gadj-003",
    productId: "gp-002",
    productName: "White Sugar",
    type: "increase",
    reason: "Stock Count",
    quantity: 8,
    date: "2026-09-13",
    notes: "Physical count found extra sealed bags.",
  },
];
