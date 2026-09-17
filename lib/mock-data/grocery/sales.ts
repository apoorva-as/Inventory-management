import type { GrocerySale } from "@/lib/types/grocery";

export const grocerySales: GrocerySale[] = [
  {
    id: "gs-001",
    customerId: "gc-001",
    customerName: "Anjali Mehta",
    date: "2026-09-10",
    status: "completed",
    items: [
      { productId: "gp-001", productName: "Basmati Rice", quantity: 2, unitPrice: 4.99 },
      { productId: "gp-004", productName: "Sunflower Cooking Oil", quantity: 1, unitPrice: 7.49 },
    ],
    total: 17.47,
  },
  {
    id: "gs-002",
    customerId: "gc-003",
    customerName: "Priya Nair",
    date: "2026-09-10",
    status: "completed",
    items: [
      { productId: "gp-005", productName: "Full Cream Milk", quantity: 3, unitPrice: 1.29 },
      { productId: "gp-006", productName: "Whole Wheat Bread", quantity: 2, unitPrice: 2.19 },
      { productId: "gp-009", productName: "Free Range Eggs (Tray of 30)", quantity: 1, unitPrice: 5.49 },
    ],
    total: 13.24,
  },
  {
    id: "gs-003",
    customerId: "gc-005",
    customerName: "Ayesha Siddiqui",
    date: "2026-09-09",
    status: "completed",
    items: [
      { productId: "gp-002", productName: "White Sugar", quantity: 4, unitPrice: 2.49 },
      { productId: "gp-012", productName: "Ghee (Clarified Butter)", quantity: 1, unitPrice: 9.99 },
    ],
    total: 19.95,
  },
  {
    id: "gs-004",
    customerId: "gc-002",
    customerName: "Rahul Verma",
    date: "2026-09-08",
    status: "pending",
    items: [{ productId: "gp-011", productName: "Orange Juice", quantity: 6, unitPrice: 3.19 }],
    total: 19.14,
  },
  {
    id: "gs-005",
    customerId: "gc-004",
    customerName: "Suresh Patil",
    date: "2026-09-07",
    status: "completed",
    items: [
      { productId: "gp-007", productName: "Cream Biscuits", quantity: 5, unitPrice: 1.49 },
      { productId: "gp-003", productName: "Iodized Salt", quantity: 2, unitPrice: 0.99 },
    ],
    total: 9.43,
  },
  {
    id: "gs-006",
    customerId: "gc-006",
    customerName: "Karan Chopra",
    date: "2026-09-05",
    status: "cancelled",
    items: [{ productId: "gp-008", productName: "Refined Wheat Flour (Maida)", quantity: 3, unitPrice: 3.29 }],
    total: 9.87,
  },
];
