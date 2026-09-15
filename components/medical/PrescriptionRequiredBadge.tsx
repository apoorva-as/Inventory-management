import { Badge } from "@/components/shared/Badge";

interface PrescriptionRequiredBadgeProps {
  required: boolean;
}

export function PrescriptionRequiredBadge({ required }: PrescriptionRequiredBadgeProps) {
  if (!required) return <span className="text-muted">OTC</span>;
  return <Badge tone="accent">Rx Required</Badge>;
}
