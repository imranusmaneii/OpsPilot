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
  Plug,
  FlaskConical,
  Sparkles,
  Layers,
  DollarSign,
  Network,
} from "lucide-react";
import { _setCommandPaletteState } from "@/hooks/use-command-palette";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "knowledge-base", label: "Go to Knowledge Base", icon: Database, href: "/dashboard/knowledge-base" },
  { id: "documents", label: "Go to Documents", icon: FileText, href: "/dashboard/documents" },
  { id: "chat", label: "Go to Chat", icon: MessageSquare, href: "/dashboard/chat" },
  { id: "agents", label: "Go to Agents", icon: Bot, href: "/dashboard/agents" },
  { id: "evaluation", label: "Go to Evaluation", icon: FlaskConical, href: "/dashboard/evaluation" },
  { id: "playground", label: "Go to Playground", icon: Sparkles, href: "/dashboard/playground" },
  { id: "model-comparison", label: "Go to Model Comparison", icon: Layers, href: "/dashboard/model-comparison" },
  { id: "cost-estimator", label: "Go to Cost Estimator", icon: DollarSign, href: "/dashboard/cost-estimator" },
  { id: "embeddings", label: "Go to Embeddings", icon: Network, href: "/dashboard/embeddings" },
  { id: "integrations", label: "Go to Integrations", icon: Plug, href: "/dashboard/integrations" },
  { id: "settings", label: "Go to Settings", icon: Settings, href: "/dashboard/settings" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    _setCommandPaletteState({ open, setOpen, openPalette: () => setOpen(true) });
  }, [open]);

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    },
    []
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
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-[100] w-full max-w-lg -translate-x-1/2"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0F1E] p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <Search className="h-5 w-5 text-[#94A3B8]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#94A3B8]/50 outline-none"
                />
                <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-[#475569]">
                  ESC
                </kbd>
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
                          ? "bg-[#DC2626]/15 text-[#FCA5A5]"
                          : "text-[#94A3B8] hover:bg-white/[0.05] hover:text-white"
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
