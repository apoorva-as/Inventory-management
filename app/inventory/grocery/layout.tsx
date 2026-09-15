"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { GroceryDataProvider } from "@/lib/context/GroceryDataProvider";
import { groceryNav } from "@/lib/config/navigation";
import { verticalThemes } from "@/lib/config/theme";

const theme = verticalThemes.grocery;

export default function GroceryLayout({ children }: { children: ReactNode }) {
  return (
    <GroceryDataProvider>
      <AppShell
        navItems={groceryNav}
        verticalLabel={theme.label}
        verticalEmoji={theme.emoji}
        themeClass={theme.themeClass}
      >
        {children}
      </AppShell>
    </GroceryDataProvider>
  );
}
