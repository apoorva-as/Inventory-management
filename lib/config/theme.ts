import type { Vertical } from "@/lib/types/shared";

export interface VerticalTheme {
  label: string;
  themeClass: string;
  accentHex: string;
  emoji: string;
}

export const verticalThemes: Record<Vertical, VerticalTheme> = {
  grocery: {
    label: "Grocery",
    themeClass: "theme-grocery",
    accentHex: "#16a34a",
    emoji: "🛒",
  },
  medical: {
    label: "Medical",
    themeClass: "theme-medical",
    accentHex: "#0891b2",
    emoji: "💊",
  },
  electronics: {
    label: "Electronics",
    themeClass: "theme-electronics",
    accentHex: "#7c3aed",
    emoji: "💻",
  },
};
