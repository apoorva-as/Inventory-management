import type { ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "./Button";

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
}

export function FilterBar({ children, onClear }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted">
        <SlidersHorizontal size={16} />
        Filters
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  );
}
