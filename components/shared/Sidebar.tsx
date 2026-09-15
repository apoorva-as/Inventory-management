"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import type { NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  navItems: NavItem[];
  verticalLabel: string;
  verticalEmoji: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ navItems, verticalLabel, verticalEmoji, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-4">
          <span className="text-2xl">{verticalEmoji}</span>
          <span className="text-lg font-semibold text-foreground">{verticalLabel}</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:bg-accent-soft hover:text-foreground",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
