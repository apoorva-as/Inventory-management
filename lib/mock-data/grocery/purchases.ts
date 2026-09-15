import type { GroceryPurchase } from "@/lib/types/grocery";

export const groceryPurchases: GroceryPurchase[] = [
  {
    id: "gpu-001",
    vendorId: "gv-001",
    vendorName: "Golden Harvest Distributors",
    date: "2026-09-01",
    status: "completed",
    items: [
      { productId: "gp-001", productName: "Basmati Rice", quantity: 200, unitPrice: 3.6 },
      { productId: "gp-008", productName: "Refined Wheat Flour (Maida)", quantity: 150, unitPrice: 2.3 },
    ],
    total: 1065,
  },
  {
    id: "gpu-002",
    vendorId: "gv-003",
    vendorName: "Daily Fresh Dairy Co.",
    date: "2026-09-04",
    status: "completed",
    items: [
      { productId: "gp-005", productName: "Full Cream Milk", quantity: 100, unitPrice: 0.85 },
      { productId: "gp-009", productName: "Free Range Eggs (Tray of 30)", quantity: 40, unitPrice: 4.1 },
    ],
    total: 249,
  },
  {
    id: "gpu-003",
    vendorId: "gv-002",
    vendorName: "SunCrop Wholesale",
    date: "2026-09-06",
    status: "pending",
    items: [
      { productId: "gp-002", productName: "White Sugar", quantity: 180, unitPrice: 1.8 },
      { productId: "gp-004", productName: "Sunflower Cooking Oil", quantity: 120, unitPrice: 5.9 },
    ],
    total: 1032,
  },
  {
    id: "gpu-004",
    vendorId: "gv-004",
    vendorName: "Farmhouse Bakers Supply",
    date: "2026-09-08",
    status: "completed",
    items: [
      { productId: "gp-006", productName: "Whole Wheat Bread", quantity: 60, unitPrice: 1.4 },
      { productId: "gp-007", productName: "Cream Biscuits", quantity: 220, unitPrice: 0.95 },
    ],
    total: 293,
  },
  {
    id: "gpu-005",
    vendorId: "gv-005",
    vendorName: "PureNest Trading",
    date: "2026-09-09",
    status: "cancelled",
    items: [
      { productId: "gp-003", productName: "Iodized Salt", quantity: 50, unitPrice: 0.5 },
      { productId: "gp-010", productName: "Ground Turmeric Powder", quantity: 80, unitPrice: 1.1 },
    ],
    total: 113,
  },
];
