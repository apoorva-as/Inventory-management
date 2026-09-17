import type { MedicalBatch } from "@/lib/types/medical";
import { getMedicineActiveBatches } from "@/lib/utils/medicalStock";

export interface FefoAllocation {
  batchId: string;
  batchNumber: string;
  quantity: number;
}

export interface FefoResult {
  allocations: FefoAllocation[];
  fulfilled: number;
  shortfall: number;
}

/**
 * First-Expiry-First-Out allocation. Pure, no mutation: sorts the medicine's
 * active (quantity > 0) batches by expiryDate ascending and greedily
 * allocates requestedQty starting from the earliest-expiring batch. Never
 * allocates more than a batch's available quantity. `shortfall` is 0 when
 * requestedQty was fully satisfiable across the medicine's batches.
 */
export function allocateFefo(
  batches: MedicalBatch[],
  medicineId: string,
  requestedQty: number,
): FefoResult {
  const sorted = getMedicineActiveBatches(batches, medicineId).sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
  );

  const allocations: FefoAllocation[] = [];
  let remaining = requestedQty;

  for (const batch of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(batch.quantity, remaining);
    if (take <= 0) continue;
    allocations.push({ batchId: batch.id, batchNumber: batch.batchNumber, quantity: take });
    remaining -= take;
  }

  const fulfilled = requestedQty - remaining;
  return { allocations, fulfilled, shortfall: remaining };
}
