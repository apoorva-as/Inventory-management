"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
