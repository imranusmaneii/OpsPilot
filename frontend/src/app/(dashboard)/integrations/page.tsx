"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug, Github, MessageSquare, FileText, Layout, Folder,
  CheckCircle, XCircle, RefreshCw, Settings, Plus, Trash2,
  Zap, Search, ChevronRight, ExternalLink, ArrowLeftRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Provider {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: { name: string; type: string; label: string; required: boolean }[];
}

interface Integration {
  id: string;
  provider: string;
  name: string;
  config: Record<string, unknown>;
  status: string;
  created_at: string;
}

const ICONS: Record<string, React.ReactNode> = {
  github: <Github className="h-6 w-6" />,
  slack: <MessageSquare className="h-6 w-6" />,
  notion: <FileText className="h-6 w-6" />,
  jira: <Layout className="h-6 w-6" />,
  google_drive: <Folder className="h-6 w-6" />,
};

const ICON_COLORS: Record<string, string> = {
  github: "bg-white/10 text-white",
  slack: "bg-[#4A154B]/30 text-[#E01E5A]",
  notion: "bg-white/10 text-white",
  jira: "bg-[#0052CC]/30 text-[#2684FF]",
  google_drive: "bg-[#0F9D58]/30 text-[#34A853]",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  error: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function IntegrationsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [showConfig, setShowConfig] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [provRes, intRes] = await Promise.all([
        apiClient.get<Provider[]>("/integrations/providers"),
        apiClient.get<{ integrations: Integration[]; total: number }>("/integrations"),
      ]);
      if (provRes.data) setProviders(provRes.data);
      if (intRes.data) setIntegrations(intRes.data.integrations || []);
    } catch {
      setProviders([
        { id: "github", name: "GitHub", description: "Sync repositories, issues, PRs", icon: "github", fields: [{ name: "token", type: "password", label: "PAT Token", required: true }] },
        { id: "slack", name: "Slack", description: "Sync messages & channels", icon: "slack", fields: [{ name: "token", type: "password", label: "Bot Token", required: true }] },
        { id: "notion", name: "Notion", description: "Sync pages & databases", icon: "notion", fields: [{ name: "token", type: "password", label: "Integration Token", required: true }] },
        { id: "jira", name: "Jira", description: "Sync issues & projects", icon: "jira", fields: [{ name: "token", type: "password", label: "API Token", required: true }] },
        { id: "google_drive", name: "Google Drive", description: "Sync documents & files", icon: "google_drive", fields: [{ name: "token", type: "password", label: "OAuth2 Token", required: true }] },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = (provider: Provider) => {
    setSelectedProvider(provider);
    setConfigForm({ name: provider.name });
    setShowConfig(true);
  };

  const handleCreate = async () => {
    if (!selectedProvider) return;
    try {
      await apiClient.post("/integrations", {
        provider: selectedProvider.id,
        name: configForm.name || selectedProvider.name,
        config: configForm,
        credentials: configForm.token || null,
      });
      setShowConfig(false);
      fetchData();
    } catch {}
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await apiClient.post(`/integrations/${id}/test`);
    } catch {}
    setTestingId(null);
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await apiClient.post(`/integrations/${id}/sync`);
    } catch {}
    setSyncingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/integrations/${id}`);
      fetchData();
    } catch {}
  };

  const getProviderForIntegration = (integ: Integration) =>
    providers.find((p) => p.id === integ.provider) || null;

  const filteredProviders = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-sm text-[#94A3B8]">Connect external services to power your AI operations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
          />
        </div>
      </div>

      {integrations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Active Connections</h2>
          <div className="grid gap-3">
            {integrations.map((integ) => {
              const provider = getProviderForIntegration(integ);
              return (
                <motion.div
                  key={integ.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_COLORS[integ.provider] || "bg-white/10 text-white"}`}>
                      {ICONS[integ.provider] || <Plug className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{integ.name}</div>
                      <div className="text-xs text-[#94A3B8]">{provider?.name || integ.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[integ.status]}`}>
                      {integ.status}
                    </span>
                    <button
                      onClick={() => handleTest(integ.id)}
                      disabled={testingId === integ.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#94A3B8] transition-colors hover:text-white"
                    >
                      <Zap className={`h-4 w-4 ${testingId === integ.id ? "animate-pulse text-[#7C3AED]" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleSync(integ.id)}
                      disabled={syncingId === integ.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#94A3B8] transition-colors hover:text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncingId === integ.id ? "animate-spin text-[#2563EB]" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(integ.id)}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#94A3B8] transition-colors hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider">Available Providers</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider, i) => (
            <motion.button
              key={provider.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleAdd(provider)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-[#7C3AED]/30 hover:bg-white/[0.08]"
            >
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-100 ${provider.id === "github" ? "bg-white/10" : provider.id === "slack" ? "bg-[#4A154B]/20" : provider.id === "notion" ? "bg-white/10" : provider.id === "jira" ? "bg-[#0052CC]/20" : "bg-[#0F9D58]/20"}`} />
              <div className="relative">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${ICON_COLORS[provider.id] || "bg-white/10 text-white"}`}>
                  {ICONS[provider.id] || <Plug className="h-6 w-6" />}
                </div>
                <h3 className="mb-1 font-semibold text-white">{provider.name}</h3>
                <p className="mb-4 text-sm text-[#94A3B8]">{provider.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">{provider.fields.length} fields</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]/15 text-[#7C3AED] transition-all group-hover:bg-[#7C3AED] group-hover:text-white">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showConfig && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfig(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${ICON_COLORS[selectedProvider.id] || "bg-white/10 text-white"}`}>
                  {ICONS[selectedProvider.id] || <Plug className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">Connect {selectedProvider.name}</h3>
                  <p className="text-xs text-[#94A3B8]">{selectedProvider.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">Connection Name</label>
                  <input
                    type="text"
                    value={configForm.name || ""}
                    onChange={(e) => setConfigForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={selectedProvider.name}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
                  />
                </div>
                {selectedProvider.fields.map((field) => (
                  <div key={field.name}>
                    <label className="mb-1.5 block text-xs font-medium text-[#94A3B8]">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type={field.type === "password" ? "password" : "text"}
                      value={configForm[field.name] || ""}
                      onChange={(e) => setConfigForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-[#94A3B8] outline-none focus:border-[#7C3AED]/50"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfig(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-[#94A3B8] transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED]/90"
                >
                  Connect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
