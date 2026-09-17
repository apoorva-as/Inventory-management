"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, Menu } from "lucide-react";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  pageTitle?: string;
  onMenuClick: () => void;
  notificationPanel?: ReactNode;
  verticalLabel?: string;
  verticalEmoji?: string;
}

export function Header({ pageTitle, onMenuClick, notificationPanel, verticalLabel, verticalEmoji }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <button
        onClick={onMenuClick}
        className="text-muted hover:text-foreground lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {(verticalLabel || verticalEmoji) && (
        <div className="flex items-center gap-2">
          {verticalEmoji && <span className="text-xl">{verticalEmoji}</span>}
          {verticalLabel && <span className="text-base font-semibold text-foreground">{verticalLabel}</span>}
        </div>
      )}

      {pageTitle && (
        <span className="hidden text-sm font-medium text-muted lg:block">{pageTitle}</span>
      )}

      <div className="ml-auto flex flex-1 items-center gap-3 sm:flex-none">
        <SearchBar placeholder="Search..." containerClassName="flex-1 sm:w-72" />
        <div ref={containerRef} className="relative">
          <button
            onClick={() => notificationPanel && setNotificationsOpen((prev) => !prev)}
            className="relative rounded-lg p-2 text-muted hover:bg-accent-soft hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </button>
          {notificationPanel && notificationsOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
              {notificationPanel}
            </div>
          )}
        </div>
        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent sm:flex">
          DM
        </div>
      </div>
    </header>
  );
}
