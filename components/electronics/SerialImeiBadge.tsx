import { Badge } from "@/components/shared/Badge";
import type { ElectronicsProduct } from "@/lib/types/electronics";

interface SerialImeiBadgeProps {
  product: Pick<ElectronicsProduct, "hasImei" | "hasSerial">;
}

/** Shows whether a product line is unit-tracked by IMEI, serial number, or not at all. */
export function SerialImeiBadge({ product }: SerialImeiBadgeProps) {
  if (product.hasImei) return <Badge tone="accent">IMEI Tracked</Badge>;
  if (product.hasSerial) return <Badge tone="accent">Serial Tracked</Badge>;
  return <span className="text-muted">Not Tracked</span>;
}
