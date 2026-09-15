import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotificationCenter } from "@/components/shared/NotificationCenter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Management — Demo",
  description:
    "A showcase inventory management platform with Grocery, Medical, and Electronics demo experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NotificationCenter>{children}</NotificationCenter>
      </body>
    </html>
  );
}
