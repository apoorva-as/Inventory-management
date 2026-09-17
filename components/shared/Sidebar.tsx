"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import type { NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  navItems: NavItem[];
  open: boolean;
  onClose: () => void;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted hover:bg-accent-soft hover:text-foreground",
      )}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

/** Groups nav items by `section` in first-seen order. Only meaningful when every item carries one. */
function groupBySection(navItems: NavItem[]): [string, NavItem[]][] {
  const order: string[] = [];
  const groups = new Map<string, NavItem[]>();
  for (const item of navItems) {
    const section = item.section ?? "";
    if (!groups.has(section)) {
      order.push(section);
      groups.set(section, []);
    }
    groups.get(section)!.push(item);
  }
  return order.map((section) => [section, groups.get(section)!]);
}

export function Sidebar({ navItems, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const hasSections = navItems.length > 0 && navItems.every((item) => item.section);
  const sections = hasSections ? groupBySection(navItems) : [];

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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
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

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {hasSections
            ? sections.map(([section, items]) => (
                <div key={section} className="mb-3">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {section}
                  </p>
                  {items.map((item) => (
                    <NavLink key={item.href} item={item} active={pathname === item.href} />
                  ))}
                </div>
              ))
            : navItems.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href} />
              ))}
        </nav>
      </aside>
    </>
  );
}
