import type { MedicalSale } from "@/lib/types/medical";

export const medicalSales: MedicalSale[] = [
  {
    id: "msa-001",
    customerId: "mc-001",
    customerName: "Sarah Johnson",
    date: "2026-09-10",
    status: "completed",
    items: [
      { productId: "mm-001", productName: "Paracetamol 500mg Tablets", quantity: 2, unitPrice: 2.2 },
      { productId: "mm-004", productName: "Vitamin C Effervescent Tablets", quantity: 1, unitPrice: 5.99 },
    ],
    total: 10.39,
  },
  {
    id: "msa-002",
    customerId: "mc-002",
    customerName: "Robert Chen",
    date: "2026-09-10",
    status: "completed",
    items: [
      { productId: "mm-002", productName: "Amoxicillin 500mg Capsules", quantity: 1, unitPrice: 4.2 },
      { productId: "mm-006", productName: "Omeprazole 20mg Capsules", quantity: 1, unitPrice: 3.5 },
    ],
    total: 7.7,
  },
  {
    id: "msa-003",
    customerId: "mc-005",
    customerName: "Emily Novak",
    date: "2026-09-09",
    status: "completed",
    items: [
      { productId: "mm-007", productName: "Metformin 500mg Tablets", quantity: 2, unitPrice: 2.6 },
      { productId: "mm-008", productName: "Atorvastatin 10mg Tablets", quantity: 1, unitPrice: 5.1 },
    ],
    total: 10.3,
  },
  {
    id: "msa-004",
    customerId: "mc-003",
    customerName: "Fatima Al-Sayed",
    date: "2026-09-08",
    status: "pending",
    items: [{ productId: "mm-003", productName: "Cetirizine 10mg Tablets", quantity: 1, unitPrice: 1.6 }],
    total: 1.6,
  },
  {
    id: "msa-005",
    customerId: "mc-004",
    customerName: "David Kim",
    date: "2026-09-07",
    status: "completed",
    items: [
      { productId: "mm-011", productName: "ORS Rehydration Sachets", quantity: 5, unitPrice: 0.75 },
      { productId: "mm-005", productName: "Dextromethorphan Cough Syrup 100ml", quantity: 1, unitPrice: 4.75 },
    ],
    total: 8.5,
  },
  {
    id: "msa-006",
    customerId: "mc-006",
    customerName: "Carlos Mendes",
    date: "2026-09-05",
    status: "cancelled",
    items: [{ productId: "mm-013", productName: "Multivitamin Tablets (Daily)", quantity: 1, unitPrice: 7.99 }],
    total: 7.99,
  },
];
