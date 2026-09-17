import { Badge } from "@/components/shared/Badge";
import { getExpiryDaysLeft, getExpiryStatus } from "@/lib/utils/expiry";

interface ExpiryBadgeProps {
  expiryDate?: string;
}

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  if (!expiryDate) {
    return <span className="text-muted">—</span>;
  }

  const status = getExpiryStatus(expiryDate);

  if (status === "expired") return <Badge tone="danger">Expired</Badge>;
  if (status === "expiring") return <Badge tone="warning">{getExpiryDaysLeft(expiryDate)}d left</Badge>;
  return <span className="text-foreground">{expiryDate}</span>;
}
