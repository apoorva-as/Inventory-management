"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardList, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMedicalData } from "@/lib/context/MedicalDataProvider";
import {
  getBatchExpiryStatus,
  getExpiringOrExpiredBatches,
  getMedicineTotalStock,
  isLowStock,
} from "@/lib/utils/medicalStock";

interface Notification {
  id: string;
  icon: LucideIcon;
  tone: "danger" | "warning";
  title: string;
  description: string;
  href: string;
}

export function NotificationsPanel() {
  const { medicines, batches, prescriptions, purchaseOrders } = useMedicalData();

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    for (const batch of getExpiringOrExpiredBatches(batches)) {
      const status = getBatchExpiryStatus(batch);
      items.push({
        id: `batch-${batch.id}`,
        icon: CalendarClock,
        tone: status === "expired" ? "danger" : "warning",
        title: status === "expired" ? `${batch.medicineName} batch expired` : `${batch.medicineName} batch expiring soon`,
        description: `Batch ${batch.batchNumber} — ${batch.quantity} units, expiry ${batch.expiryDate}`,
        href: "/inventory/medical/expiry",
      });
    }

    for (const medicine of medicines) {
      const stock = getMedicineTotalStock(batches, medicine.id);
      if (isLowStock(stock, medicine.minimumStock)) {
        items.push({
          id: `low-stock-${medicine.id}`,
          icon: AlertTriangle,
          tone: "warning",
          title: `${medicine.name} is low on stock`,
          description: `${stock} on hand, minimum ${medicine.minimumStock}`,
          href: "/inventory/medical/low-stock",
        });
      }
    }

    for (const prescription of prescriptions) {
      if (prescription.status === "pending") {
        items.push({
          id: `rx-${prescription.id}`,
          icon: ClipboardList,
          tone: "warning",
          title: `Pending prescription for ${prescription.customerName}`,
          description: `${prescription.medicines.length} medicine(s) — ${prescription.doctorName}`,
          href: "/inventory/medical/prescriptions",
        });
      }
    }

    for (const po of purchaseOrders) {
      if (po.status === "draft" || po.status === "pending") {
        items.push({
          id: `po-${po.id}`,
          icon: ShoppingCart,
          tone: "warning",
          title: `${po.poNumber} awaiting receipt`,
          description: `${po.supplierName} — ${po.items.length} item(s), status: ${po.status}`,
          href: "/inventory/medical/purchases?tab=purchase-orders",
        });
      }
    }

    return items;
  }, [medicines, batches, prescriptions, purchaseOrders]);

  return (
    <div className="w-80 max-w-[calc(100vw-2rem)]">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <p className="text-xs text-muted">{notifications.length} active alerts</p>
      </div>

      <div className="max-h-96 overflow-y-auto p-2">
        {notifications.length === 0 ? (
          <div className="p-2">
            <EmptyState title="No active alerts" description="Everything is in good shape right now." />
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent-soft"
                >
                  <span
                    className={
                      n.tone === "danger"
                        ? "rounded-lg bg-red-100 p-1.5 text-red-600"
                        : "rounded-lg bg-amber-100 p-1.5 text-amber-700"
                    }
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground">{n.title}</p>
                      <Badge tone={n.tone === "danger" ? "danger" : "warning"}>
                        {n.tone === "danger" ? "Urgent" : "Attention"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">{n.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
