import { Badge } from "@/components/shared/Badge";

// Module-scope snapshot (evaluated once at load, not during render) so the
// component body stays a pure function of its props.
const NOW = Date.now();

interface ExpiryBadgeProps {
  expiryDate?: string;
}

export function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  if (!expiryDate) {
    return <span className="text-muted">—</span>;
  }

  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - NOW) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return <Badge tone="danger">Expired</Badge>;
  if (daysLeft <= 14) return <Badge tone="warning">{daysLeft}d left</Badge>;
  return <span className="text-foreground">{expiryDate}</span>;
}
