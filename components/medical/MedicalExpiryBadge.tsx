import { Badge } from "@/components/shared/Badge";
import { getExpiryDaysLeft, getExpiryStatus } from "@/lib/utils/expiry";

interface MedicalExpiryBadgeProps {
  expiryDate: string;
}

export function MedicalExpiryBadge({ expiryDate }: MedicalExpiryBadgeProps) {
  const status = getExpiryStatus(expiryDate);

  if (status === "expired") return <Badge tone="danger">Expired</Badge>;
  if (status === "expiring") return <Badge tone="warning">{getExpiryDaysLeft(expiryDate)}d left</Badge>;
  return <span className="text-foreground">{expiryDate}</span>;
}
