import type { MedicalBatch } from "@/lib/types/medical";
import { getExpiryStatus, type ExpiryStatus } from "@/lib/utils/expiry";

/** Batches with quantity > 0 count as active inventory for a medicine. */
export function getMedicineActiveBatches(batches: MedicalBatch[], medicineId: string): MedicalBatch[] {
  return batches.filter((b) => b.medicineId === medicineId && b.quantity > 0);
}

/** A medicine's total stock is always the sum of its active batch quantities — never a stored field. */
export function getMedicineTotalStock(batches: MedicalBatch[], medicineId: string): number {
  return getMedicineActiveBatches(batches, medicineId).reduce((sum, b) => sum + b.quantity, 0);
}

export function isLowStock(totalStock: number, minimumStock: number): boolean {
  return totalStock <= minimumStock;
}

/** Thin wrapper around the shared expiry helper — never fork this logic. */
export function getBatchExpiryStatus(batch: Pick<MedicalBatch, "expiryDate">): ExpiryStatus {
  return getExpiryStatus(batch.expiryDate);
}

/** Batches with quantity <= 0 are excluded — they're not active inventory to alert on. */
export function getExpiringOrExpiredBatches(batches: MedicalBatch[]): MedicalBatch[] {
  return batches.filter((b) => b.quantity > 0 && getBatchExpiryStatus(b) !== "healthy");
}
