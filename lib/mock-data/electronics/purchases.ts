import type { ElectronicsPurchase } from "@/lib/types/electronics";

export const electronicsPurchases: ElectronicsPurchase[] = [
  {
    id: "epu-001",
    vendorId: "ev-005",
    vendorName: "Apple Authorized Distribution Inc.",
    date: "2026-09-01",
    status: "completed",
    items: [
      { productId: "ep-001", productName: "iPhone 15 128GB", quantity: 20, unitPrice: 650 },
      { productId: "ep-003", productName: "iPhone 15 Pro 256GB", quantity: 10, unitPrice: 830 },
    ],
    total: 21300,
  },
  {
    id: "epu-002",
    vendorId: "ev-006",
    vendorName: "Samsung Direct Distribution",
    date: "2026-09-02",
    status: "completed",
    items: [
      { productId: "ep-004", productName: "Samsung Galaxy S24 128GB", quantity: 15, unitPrice: 600 },
      { productId: "ep-005", productName: "Samsung Galaxy S24 Ultra 512GB", quantity: 6, unitPrice: 1180 },
    ],
    total: 16080,
  },
  {
    id: "epu-003",
    vendorId: "ev-004",
    vendorName: "CDW Business Solutions",
    date: "2026-09-04",
    status: "completed",
    items: [
      { productId: "ep-008", productName: "Dell Inspiron 15 3000 (i5/8GB/512GB)", quantity: 12, unitPrice: 430 },
      { productId: "ep-009", productName: "Dell XPS 13 (i7/16GB/512GB)", quantity: 5, unitPrice: 1050 },
      { productId: "ep-021", productName: "Dell UltraSharp U2723QE 27\" Monitor", quantity: 8, unitPrice: 460 },
    ],
    total: 15410,
  },
  {
    id: "epu-004",
    vendorId: "ev-002",
    vendorName: "TechDistro Wholesale",
    date: "2026-09-06",
    status: "completed",
    items: [
      { productId: "ep-013", productName: "Sony WH-1000XM5 Headphones", quantity: 15, unitPrice: 290 },
      { productId: "ep-016", productName: "Logitech MX Master 3S Mouse", quantity: 25, unitPrice: 65 },
      { productId: "ep-017", productName: "Logitech MX Keys Keyboard", quantity: 20, unitPrice: 72 },
    ],
    total: 7415,
  },
  {
    id: "epu-005",
    vendorId: "ev-003",
    vendorName: "Global Electronics Supply Co.",
    date: "2026-09-08",
    status: "pending",
    items: [
      { productId: "ep-023", productName: "Samsung 990 Pro SSD 1TB", quantity: 30, unitPrice: 92 },
      { productId: "ep-024", productName: "WD Black SN850X SSD 2TB", quantity: 10, unitPrice: 135 },
    ],
    total: 4110,
  },
  {
    id: "epu-006",
    vendorId: "ev-001",
    vendorName: "Ingram Micro Electronics",
    date: "2026-09-10",
    status: "completed",
    items: [
      { productId: "ep-025", productName: "Samsung Galaxy Watch 6 44mm", quantity: 12, unitPrice: 250 },
      { productId: "ep-026", productName: "Apple Watch Series 9 45mm", quantity: 14, unitPrice: 340 },
    ],
    total: 7760,
  },
  {
    id: "epu-007",
    vendorId: "ev-004",
    vendorName: "CDW Business Solutions",
    date: "2026-09-13",
    status: "pending",
    items: [
      { productId: "ep-019", productName: "Anker PowerCore 20000 Power Bank", quantity: 40, unitPrice: 34 },
      { productId: "ep-020", productName: "Anker PowerPort III 65W Charger", quantity: 25, unitPrice: 24 },
    ],
    total: 1960,
  },
];
