"use client";

import { Bell, Search, Command, Menu } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { openPalette } = useCommandPalette();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A0F1E]/60 px-4 md:px-6 backdrop-blur-2xl">
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
        <button className="relative rounded-xl p-2.5 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#94A3B8]">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED] shadow-sm shadow-[#7C3AED]/50" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-[10px] font-bold text-white">
            OP
          </div>
          <span className="hidden sm:inline text-sm font-medium text-[#CBD5E1]">Admin</span>
        </div>
      </div>
    </header>
  );
}
