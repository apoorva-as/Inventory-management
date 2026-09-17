import type { MedicalPurchaseReturn } from "@/lib/types/medical";

export const medicalPurchaseReturns: MedicalPurchaseReturn[] = [
  {
    id: "mpret-001",
    purchaseId: "mpu-002",
    supplierId: "ms-003",
    supplierName: "National Drug House",
    medicineId: "mm-002",
    medicineName: "Amoxicillin 500mg Capsules",
    batchId: "mbatch-003",
    batchNumber: "BN-24B102",
    quantity: 10,
    reason: "Damaged",
    date: "2026-09-04",
  },
  {
    id: "mpret-002",
    purchaseId: "mpu-004",
    supplierId: "ms-004",
    supplierName: "CarePoint Pharma Supply",
    medicineId: "mm-007",
    medicineName: "Metformin 500mg Tablets",
    batchId: "mbatch-009",
    batchNumber: "BN-24G077",
    quantity: 15,
    reason: "Quality Issue",
    date: "2026-09-09",
  },
];
