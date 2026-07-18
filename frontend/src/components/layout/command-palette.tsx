"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  MessageSquare,
  Database,
  Bot,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "knowledge-base", label: "Go to Knowledge Base", icon: Database, href: "/dashboard/knowledge-base" },
  { id: "documents", label: "Go to Documents", icon: FileText, href: "/dashboard/documents" },
  { id: "chat", label: "Go to Chat", icon: MessageSquare, href: "/dashboard/chat" },
  { id: "agents", label: "Go to Agents", icon: Bot, href: "/dashboard/agents" },
  { id: "evaluation", label: "Go to Evaluation", icon: BarChart3, href: "/dashboard/evaluation" },
  { id: "settings", label: "Go to Settings", icon: Settings, href: "/dashboard/settings" },
];

let paletteState = { open: false, setOpen: (_: boolean) => {} };

export function useCommandPalette() {
  return paletteState;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  paletteState = { open, setOpen };

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    },
    [open]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="glass rounded-2xl border border-[rgba(255,255,255,0.1)] p-2 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.08)] px-4 py-3">
                <Search className="h-5 w-5 text-[#94A3B8]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#94A3B8]/50 outline-none"
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
                {filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => executeCommand(cmd.href)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        i === selectedIndex
                          ? "bg-[#7C3AED]/15 text-[#7C3AED]"
                          : "text-[#94A3B8] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{cmd.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-50" />
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#94A3B8]">
                    No commands found
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
