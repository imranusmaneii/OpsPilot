"use client";

import { Bell, Search, Command } from "lucide-react";
import { useCommandPalette } from "@/hooks/use-command-palette";

export function Navbar() {
  const { openPalette } = useCommandPalette();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#0F172A]/30 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-[#94A3B8] transition-all hover:border-[#7C3AED]/30 hover:bg-[rgba(255,255,255,0.08)]"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-8 flex items-center gap-1 rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 text-[10px]">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 text-[#94A3B8] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#7C3AED]" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED]/20 text-xs font-medium text-[#7C3AED]">
            IM
          </div>
          <span className="text-sm font-medium">Imran</span>
        </div>
      </div>
    </header>
  );
}
