import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
}

export function StatCard({ label, value, delta, trend = "flat", icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <span className="rounded-lg bg-accent-soft p-2 text-accent">
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {delta && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-red-600",
            trend === "flat" && "text-muted",
          )}
        >
          {trend === "up" && <ArrowUpRight size={14} />}
          {trend === "down" && <ArrowDownRight size={14} />}
          {delta}
        </p>
      )}
    </div>
  );
}
