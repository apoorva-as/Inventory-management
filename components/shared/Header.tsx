"use client";

import { Bell, Menu } from "lucide-react";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  pageTitle?: string;
  onMenuClick: () => void;
}

export function Header({ pageTitle, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <button
        onClick={onMenuClick}
        className="text-muted hover:text-foreground lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {pageTitle && (
        <span className="hidden text-sm font-medium text-muted lg:block">{pageTitle}</span>
      )}

      <div className="ml-auto flex flex-1 items-center gap-3 sm:flex-none">
        <SearchBar placeholder="Search..." containerClassName="flex-1 sm:w-72" />
        <button
          className="relative rounded-lg p-2 text-muted hover:bg-accent-soft hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent sm:flex">
          DM
        </div>
      </div>
    </header>
  );
}
