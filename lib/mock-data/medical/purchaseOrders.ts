import type { MedicalPurchaseOrder } from "@/lib/types/medical";

export const medicalPurchaseOrders: MedicalPurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-2026-0001",
    supplierId: "ms-001",
    supplierName: "MedPlus Pharma Distributors",
    date: "2026-08-30",
    status: "received",
    items: [
      { medicineId: "mm-001", medicineName: "Paracetamol 500mg Tablets", quantity: 300, purchasePrice: 1.5 },
      { medicineId: "mm-009", medicineName: "Ibuprofen 400mg Tablets", quantity: 200, purchasePrice: 1.95 },
    ],
    total: 840,
    receivedPurchaseId: "mpu-001",
  },
  {
    id: "po-002",
    poNumber: "PO-2026-0002",
    supplierId: "ms-002",
    supplierName: "HealthFirst Wholesale Pharma",
    date: "2026-09-12",
    expectedDate: "2026-09-20",
    status: "pending",
    items: [
      {
        medicineId: "mm-012",
        medicineName: "Insulin Glargine Injection 10ml",
        quantity: 30,
        purchasePrice: 19.5,
      },
    ],
    total: 585,
  },
  {
    id: "po-003",
    poNumber: "PO-2026-0003",
    supplierId: "ms-005",
    supplierName: "Wellness Pharma Traders",
    date: "2026-09-14",
    expectedDate: "2026-09-22",
    status: "draft",
    items: [
      {
        medicineId: "mm-005",
        medicineName: "Dextromethorphan Cough Syrup 100ml",
        quantity: 50,
        purchasePrice: 3.2,
      },
    ],
    total: 160,
  },
  {
    id: "po-004",
    poNumber: "PO-2026-0004",
    supplierId: "ms-003",
    supplierName: "National Drug House",
    date: "2026-09-05",
    status: "cancelled",
    items: [
      { medicineId: "mm-010", medicineName: "Azithromycin 250mg Tablets", quantity: 40, purchasePrice: 4.9 },
    ],
    total: 196,
  },
];
