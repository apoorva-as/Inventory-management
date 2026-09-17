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
  notificationPanel?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  navItems,
  verticalLabel,
  verticalEmoji,
  themeClass,
  pageTitle,
  notificationPanel,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn(themeClass, "flex h-screen overflow-hidden bg-background")}>
      <Sidebar navItems={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
          notificationPanel={notificationPanel}
          verticalLabel={verticalLabel}
          verticalEmoji={verticalEmoji}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
