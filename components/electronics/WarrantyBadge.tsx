import { Badge } from "@/components/shared/Badge";

// Module-scope snapshot (evaluated once at load, not during render) so the
// component body stays a pure function of its props — mirrors the pattern
// used by Medical's expiry-status helper.
const NOW = Date.now();

export type WarrantyStatus = "active" | "expiring" | "expired" | "none";

const EXPIRING_SOON_DAYS = 30;

export function getWarrantyStatus(warrantyExpiry?: string): WarrantyStatus {
  if (!warrantyExpiry) return "none";
  const daysLeft = Math.ceil((new Date(warrantyExpiry).getTime() - NOW) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= EXPIRING_SOON_DAYS) return "expiring";
  return "active";
}

interface WarrantyBadgeProps {
  warrantyExpiry?: string;
}

export function WarrantyBadge({ warrantyExpiry }: WarrantyBadgeProps) {
  const status = getWarrantyStatus(warrantyExpiry);

  if (status === "none") return <Badge tone="neutral">No Warranty</Badge>;
  if (status === "expired") return <Badge tone="danger">Expired</Badge>;
  if (status === "expiring") {
    const daysLeft = Math.ceil((new Date(warrantyExpiry as string).getTime() - NOW) / (1000 * 60 * 60 * 24));
    return <Badge tone="warning">{daysLeft}d left</Badge>;
  }
  return <Badge tone="success">Active</Badge>;
}
