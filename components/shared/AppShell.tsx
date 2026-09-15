"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  navItems: NavItem[];
  verticalLabel: string;
  verticalEmoji: string;
  themeClass: string;
  pageTitle?: string;
  children: ReactNode;
}

export function AppShell({
  navItems,
  verticalLabel,
  verticalEmoji,
  themeClass,
  pageTitle,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn(themeClass, "flex min-h-screen bg-background")}>
      <Sidebar
        navItems={navItems}
        verticalLabel={verticalLabel}
        verticalEmoji={verticalEmoji}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
