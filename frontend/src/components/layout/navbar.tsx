"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Command, Menu, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onMenuClick?: () => void;
}

type Theme = "dark" | "midnight" | "oled";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("opspilot-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.theme || "dark";
    }
  } catch {}
  return "dark";
}

function applyNavbarTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "midnight", "oled");
  root.classList.add(theme);
  if (theme === "oled") {
    root.style.setProperty("--background", "#000000");
    root.style.setProperty("--secondary", "#0A0A0A");
  } else if (theme === "midnight") {
    root.style.setProperty("--background", "#0B1120");
    root.style.setProperty("--secondary", "#111827");
  } else {
    root.style.setProperty("--background", "#050810");
    root.style.setProperty("--secondary", "#0A0F1E");
  }
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { openPalette } = useCommandPalette();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    const themes: Theme[] = ["dark", "midnight", "oled"];
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
    applyNavbarTheme(next);

    try {
      const saved = localStorage.getItem("opspilot-settings");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "opspilot-settings",
        JSON.stringify({ ...parsed, theme: next })
      );
    } catch {}
  };

  const ThemeIcon = !mounted
    ? Monitor
    : theme === "dark"
      ? Moon
      : theme === "midnight"
        ? Monitor
        : Sun;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[var(--secondary,#0A0F1E)]/60 px-4 md:px-6 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-[#475569] transition-all hover:border-[#7C3AED]/20 hover:bg-white/[0.05] hover:text-[#94A3B8]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="ml-4 hidden sm:flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-[#475569]">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={cycleTheme}
          className="relative rounded-xl p-2.5 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#94A3B8]"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-[18px] w-[18px]" />
        </button>

        <button className="relative rounded-xl p-2.5 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#94A3B8]">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED] shadow-sm shadow-[#7C3AED]/50" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-[10px] font-bold text-white">
            {initials}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-[#CBD5E1]">
            {displayName}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl p-2.5 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#EF4444]"
          title="Sign out"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
