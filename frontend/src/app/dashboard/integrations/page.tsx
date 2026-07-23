"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug,
  Github,
  MessageSquare,
  FileText,
  Layout,
  Folder,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Zap,
  ExternalLink,
  Database,
  Mail,
  Globe,
  Webhook,
} from "lucide-react";

interface Integration {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive" | "error";
  lastSync: string | null;
  syncCount: number;
  config: Record<string, string>;
}

const PROVIDERS = [
  {
    id: "github",
    name: "GitHub",
    description: "Sync repositories, issues, and pull requests for code context",
    icon: "github",
    category: "Development",
    color: "bg-white/10 text-white",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Index channel messages and threads for knowledge retrieval",
    icon: "slack",
    category: "Communication",
    color: "bg-[#4A154B]/30 text-[#E01E5A]",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import pages, databases, and wikis into your knowledge base",
    icon: "notion",
    category: "Productivity",
    color: "bg-white/10 text-white",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track issues, sprint data, and project context",
    icon: "jira",
    category: "Project Management",
    color: "bg-[#0052CC]/30 text-[#2684FF]",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Sync documents, spreadsheets, and presentations",
    icon: "google_drive",
    category: "Storage",
    color: "bg-[#0F9D58]/30 text-[#34A853]",
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Import team knowledge base articles and documentation",
    icon: "confluence",
    category: "Documentation",
    color: "bg-[#0052CC]/30 text-[#172B4D]",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Sync issues, projects, and engineering workflows",
    icon: "linear",
    category: "Project Management",
    color: "bg-[#5E6AD2]/30 text-[#5E6AD2]",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Custom integrations via HTTP webhooks and event triggers",
    icon: "webhook",
    category: "Developer",
    color: "bg-[#DC2626]/30 text-[#FCA5A5]",
  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  github: <Github className="h-6 w-6" />,
  slack: <MessageSquare className="h-6 w-6" />,
  notion: <FileText className="h-6 w-6" />,
  jira: <Layout className="h-6 w-6" />,
  google_drive: <Folder className="h-6 w-6" />,
  confluence: <Globe className="h-6 w-6" />,
  linear: <Zap className="h-6 w-6" />,
  webhook: <Webhook className="h-6 w-6" />,
};

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "1",
    provider: "github",
    name: "GitHub — OpsPilot Repos",
    description: "Syncing 3 repositories",
    icon: "github",
    status: "active",
    lastSync: "2 minutes ago",
    syncCount: 847,
    config: { org: "imranusmaneii" },
  },
  {
    id: "2",
    provider: "slack",
    name: "Slack — Engineering",
    description: "Syncing #dev and #ops channels",
    icon: "slack",
    status: "active",
    lastSync: "15 minutes ago",
    syncCount: 2341,
    config: { workspace: "engineering" },
  },
  {
    id: "3",
    provider: "notion",
    name: "Notion — Product Wiki",
    description: "Syncing product documentation",
    icon: "notion",
    status: "inactive",
    lastSync: null,
    syncCount: 0,
    config: {},
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"connected" | "available">("connected");

  const filteredProviders = PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const connectedIds = integrations.map((i) => i.provider);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await new Promise((r) => setTimeout(r, 2000));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, lastSync: "Just now", syncCount: i.syncCount + Math.floor(Math.random() * 50) }
          : i
      )
    );
    setSyncingId(null);
  };

  const handleConnect = (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;

    const newIntegration: Integration = {
      id: Date.now().toString(),
      provider: providerId,
      name: `${provider.name} — Connected`,
      description: provider.description,
      icon: providerId,
      status: "active",
      lastSync: "Just now",
      syncCount: 0,
      config: {},
    };

    setIntegrations((prev) => [...prev, newIntegration]);
    setSelectedProvider(null);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-[#94A3B8]">Connect your tools to enhance OpsPilot&apos;s knowledge</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Connected", value: integrations.filter((i) => i.status === "active").length, color: "text-emerald-400" },
          { label: "Total Synced", value: integrations.reduce((sum, i) => sum + i.syncCount, 0).toLocaleString(), color: "text-[#FCA5A5]" },
          { label: "Available", value: PROVIDERS.length, color: "text-[#94A3B8]" },
          { label: "Last Sync", value: "2m ago", color: "text-[#94A3B8]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/[0.06] bg-[#0A0F1E]/60 p-4 backdrop-blur-xl"
          >
            <p className="text-xs text-[#64748B]">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-2">
        <button
          onClick={() => setActiveTab("connected")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "connected"
              ? "bg-[#DC2626]/15 text-[#FCA5A5]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Connected ({integrations.length})
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "available"
              ? "bg-[#DC2626]/15 text-[#FCA5A5]"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          Available ({PROVIDERS.length})
        </button>
      </div>

      {activeTab === "connected" ? (
        <div className="space-y-3">
          {integrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 py-16">
              <Plug className="mb-4 h-12 w-12 text-[#475569]" />
              <p className="text-sm text-[#94A3B8]">No integrations connected</p>
              <p className="text-xs text-[#475569]">Browse available integrations to get started</p>
              <button
                onClick={() => setActiveTab("available")}
                className="mt-4 rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#DC2626]/90"
              >
                Browse Integrations
              </button>
            </div>
          ) : (
            integrations.map((integration, i) => {
              const provider = PROVIDERS.find((p) => p.id === integration.provider);
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl transition-all hover:border-white/[0.1]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${provider?.color || "bg-white/10 text-white"}`}>
                    {ICON_MAP[integration.icon] || <Plug className="h-6 w-6" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          integration.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : integration.status === "error"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-[#475569]/10 text-[#64748B]"
                        }`}
                      >
                        {integration.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#475569]">{integration.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-[10px] text-[#475569]">
                      {integration.lastSync && <span>Last sync: {integration.lastSync}</span>}
                      <span>{integration.syncCount.toLocaleString()} items synced</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncingId === integration.id}
                      className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#94A3B8] disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncingId === integration.id ? "animate-spin" : ""}`} />
                    </button>
                    <button className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#94A3B8]">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        <div>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 pl-10 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40"
            />
            <Zap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredProviders.map((provider, i) => {
              const isConnected = connectedIds.includes(provider.id);
              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-5 backdrop-blur-xl transition-all hover:border-white/[0.1]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${provider.color}`}>
                    {ICON_MAP[provider.icon]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{provider.name}</h3>
                      <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-[#475569]">
                        {provider.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#475569]">{provider.description}</p>
                  </div>

                  <button
                    onClick={() => (isConnected ? null : handleConnect(provider.id))}
                    disabled={isConnected}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                      isConnected
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "bg-[#DC2626] text-white hover:bg-[#DC2626]/90"
                    }`}
                  >
                    {isConnected ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      "Connect"
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
