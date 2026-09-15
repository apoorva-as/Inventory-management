import { Badge } from "@/components/shared/Badge";

// Module-scope snapshot (evaluated once at load, not during render) so the
// component body stays a pure function of its props.
const NOW = Date.now();

interface MedicalExpiryBadgeProps {
  expiryDate: string;
}

export type MedicalExpiryStatus = "expired" | "expiring" | "healthy";

export function getMedicalExpiryStatus(expiryDate: string): MedicalExpiryStatus {
  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - NOW) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 14) return "expiring";
  return "healthy";
}

export function MedicalExpiryBadge({ expiryDate }: MedicalExpiryBadgeProps) {
  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - NOW) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return <Badge tone="danger">Expired</Badge>;
  if (daysLeft <= 14) return <Badge tone="warning">{daysLeft}d left</Badge>;
  return <span className="text-foreground">{expiryDate}</span>;
}
