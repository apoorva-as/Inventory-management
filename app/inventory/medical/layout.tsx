"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { MedicalDataProvider } from "@/lib/context/MedicalDataProvider";
import { NotificationsPanel } from "@/components/medical/NotificationsPanel";
import { medicalNav } from "@/lib/config/navigation";
import { verticalThemes } from "@/lib/config/theme";

const theme = verticalThemes.medical;

export default function MedicalLayout({ children }: { children: ReactNode }) {
  return (
    <MedicalDataProvider>
      <AppShell
        navItems={medicalNav}
        verticalLabel={theme.label}
        verticalEmoji={theme.emoji}
        themeClass={theme.themeClass}
        notificationPanel={<NotificationsPanel />}
      >
        {children}
      </AppShell>
    </MedicalDataProvider>
  );
}
