import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
  /** When provided, the whole card becomes a link to this route. */
  href?: string;
}

export function StatCard({ label, value, delta, trend = "flat", icon: Icon, href }: StatCardProps) {
  const className = cn(
    "block rounded-xl border border-border bg-surface p-4 shadow-sm",
    href &&
      "cursor-pointer transition-colors hover:border-accent hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
  );

  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
