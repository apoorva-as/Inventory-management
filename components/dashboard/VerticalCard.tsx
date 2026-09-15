import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Vertical } from "@/lib/types/shared";
import { verticalThemes } from "@/lib/config/theme";

interface VerticalCardProps {
  vertical: Vertical;
  description: string;
  stats: { label: string; value: string }[];
}

export function VerticalCard({ vertical, description, stats }: VerticalCardProps) {
  const theme = verticalThemes[vertical];

  return (
    <Link
      href={`/inventory/${vertical}/dashboard`}
      className={`${theme.themeClass} group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{theme.emoji}</span>
        <ArrowRight
          size={18}
          className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{theme.label}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-sm font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}
