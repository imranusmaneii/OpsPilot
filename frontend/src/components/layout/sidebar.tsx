"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  FileText,
  MessageSquare,
  Bot,
  BarChart3,
  Plug,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Layers,
  DollarSign,
  Network,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/knowledge-base", label: "Knowledge Base", icon: Database },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/evaluation", label: "Evaluation", icon: FlaskConical },
  { href: "/dashboard/playground", label: "Playground", icon: Sparkles },
  { href: "/dashboard/model-comparison", label: "Model Comparison", icon: Layers },
  { href: "/dashboard/cost-estimator", label: "Cost Estimator", icon: DollarSign },
  { href: "/dashboard/embeddings", label: "Embeddings", icon: Network },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-lg shadow-[#7C3AED]/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-bold tracking-tight text-white">OpsPilot</span>
            <span className="text-[10px] font-medium tracking-widest uppercase text-[#7C3AED]">AI Platform</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#7C3AED]/15 text-[#A78BFA] shadow-sm shadow-[#7C3AED]/10"
                  : "text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  isActive ? "text-[#A78BFA]" : "text-[#475569] group-hover:text-[#94A3B8]"
                }`}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={onToggle}
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#475569] transition-colors hover:bg-white/[0.04] hover:text-[#94A3B8]"
        >
          {collapsed ? (
            <>
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex h-screen flex-col border-r border-white/[0.06] bg-[#0A0F1E]/90 backdrop-blur-2xl"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-[#0A0F1E]/95 backdrop-blur-2xl lg:hidden"
            >
              <div className="absolute right-3 top-4">
                <button
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 text-[#475569] hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
