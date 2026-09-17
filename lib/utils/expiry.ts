export const EXPIRY_WARNING_DAYS = 14;

export type ExpiryStatus = "expired" | "expiring" | "healthy" | "none";

export function getExpiryDaysLeft(expiryDate: string, referenceDate: Date = new Date()): number {
  return Math.ceil((new Date(expiryDate).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(
  expiryDate: string | undefined,
  referenceDate: Date = new Date(),
): ExpiryStatus {
  if (!expiryDate) return "none";
  const daysLeft = getExpiryDaysLeft(expiryDate, referenceDate);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= EXPIRY_WARNING_DAYS) return "expiring";
  return "healthy";
}
