"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ElectronicsDataProvider } from "@/lib/context/ElectronicsDataProvider";
import { electronicsNav } from "@/lib/config/navigation";
import { verticalThemes } from "@/lib/config/theme";

const theme = verticalThemes.electronics;

export default function ElectronicsLayout({ children }: { children: ReactNode }) {
  return (
    <ElectronicsDataProvider>
      <AppShell
        navItems={electronicsNav}
        verticalLabel={theme.label}
        verticalEmoji={theme.emoji}
        themeClass={theme.themeClass}
      >
        {children}
      </AppShell>
    </ElectronicsDataProvider>
  );
}
