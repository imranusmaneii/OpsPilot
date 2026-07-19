"use client";

import { useState } from "react";
import {
  User,
  Key,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Check,
  Sparkles,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

type Theme = "dark" | "midnight" | "oled";
type AccentColor = string;

const ACCENT_COLORS = [
  { name: "Purple", value: "#7C3AED" },
  { name: "Blue", value: "#2563EB" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#D97706" },
  { name: "Red", value: "#DC2626" },
  { name: "Pink", value: "#EC4899" },
];

const THEMES: { label: string; value: Theme; icon: typeof Moon; bg: string }[] = [
  { label: "Dark", value: "dark", icon: Moon, bg: "bg-[#050810]" },
  { label: "Midnight", value: "midnight", icon: Monitor, bg: "bg-[#0B1120]" },
  { label: "OLED", value: "oled", icon: Sun, bg: "bg-black" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKey] = useState("opspilot_k8x92mN4pQ7wR3tY6bV1cZ5aF0dG");

  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");
  const [currentAccent, setCurrentAccent] = useState<AccentColor>("#7C3AED");
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [notifications, setNotifications] = useState({
    docIndexing: true,
    evaluation: true,
    apiKeyUsage: true,
    newIntegration: false,
    weeklySummary: false,
    securityAlerts: true,
  });

  const handleSave = () => {
    // Apply accent color as CSS variable
    document.documentElement.style.setProperty("--accent-purple", currentAccent);

    // Apply theme
    const root = document.documentElement;
    root.classList.remove("dark", "midnight", "oled");
    root.classList.add(currentTheme);

    if (currentTheme === "oled") {
      root.style.setProperty("--background", "#000000");
      root.style.setProperty("--secondary", "#0A0A0A");
    } else if (currentTheme === "midnight") {
      root.style.setProperty("--background", "#0B1120");
      root.style.setProperty("--secondary", "#111827");
    } else {
      root.style.setProperty("--background", "#050810");
      root.style.setProperty("--secondary", "#0A0F1E");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[#64748B]">Manage your account, API keys, and preferences</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Tabs */}
        <div className="w-full shrink-0 md:w-56">
          <div className="flex gap-2 overflow-x-auto md:flex-col md:gap-1 md:rounded-2xl md:border md:border-white/[0.06] md:bg-[#0A0F1E]/60 md:p-2 md:backdrop-blur-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#7C3AED]/15 text-[#A78BFA]"
                      : "text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Profile Information</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-2xl font-bold text-white shadow-lg shadow-[#7C3AED]/20">
                    OP
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">Admin User</p>
                    <p className="text-sm text-[#64748B]">admin@opspilot.ai</p>
                    <p className="mt-1 text-xs text-[#475569]">Member since Jan 2025</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@opspilot.ai"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Role</label>
                    <input
                      type="text"
                      defaultValue="AI Engineer"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Organization</label>
                    <input
                      type="text"
                      defaultValue="OpsPilot AI"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/25"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">API Keys</h3>
                  <button className="flex items-center gap-2 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-2 text-xs font-medium text-[#A78BFA] transition-colors hover:bg-[#7C3AED]/20">
                    <Key className="h-3.5 w-3.5" />
                    Generate New Key
                  </button>
                </div>
                <p className="mb-6 text-sm text-[#64748B]">
                  Use API keys to authenticate requests to the OpsPilot API. Keep your keys secure.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
                      <Sparkles className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#7C3AED]">Production</span>
                        <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          Active
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="font-mono text-sm text-[#94A3B8]">
                          {showApiKey ? apiKey : apiKey.slice(0, 12) + "••••••••••••"}
                        </code>
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="rounded p-1 text-[#475569] hover:text-[#94A3B8]"
                        >
                          {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={copyApiKey} className="rounded p-1 text-[#475569] hover:text-[#94A3B8]">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-[#475569] transition-colors hover:bg-white/[0.06] hover:text-[#EF4444]">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                      <Key className="h-5 w-5 text-[#475569]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-[#64748B]">Development</span>
                      <div className="mt-1">
                        <code className="font-mono text-sm text-[#475569]">opspilot_dev_••••••••••••</code>
                      </div>
                    </div>
                    <span className="rounded-md bg-[#475569]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#64748B]">
                      Inactive
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
                <h3 className="mb-3 text-lg font-semibold text-white">Usage Limits</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-[#64748B]">Requests Today</p>
                    <p className="mt-1 text-2xl font-bold text-white">1,247</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[62%] rounded-full bg-[#7C3AED]" />
                    </div>
                    <p className="mt-1 text-[10px] text-[#475569]">62% of 2,000 daily limit</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-[#64748B]">Tokens This Month</p>
                    <p className="mt-1 text-2xl font-bold text-white">2.4M</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[48%] rounded-full bg-[#2563EB]" />
                    </div>
                    <p className="mt-1 text-[10px] text-[#475569]">48% of 5M monthly limit</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs text-[#64748B]">Cost This Month</p>
                    <p className="mt-1 text-2xl font-bold text-white">$18.42</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-[18%] rounded-full bg-emerald-500" />
                    </div>
                    <p className="mt-1 text-[10px] text-[#475569]">18% of $100 budget</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "docIndexing" as const, label: "Document indexing complete", desc: "Get notified when documents finish processing" },
                  { key: "evaluation" as const, label: "Evaluation finished", desc: "Receive alerts when evaluations complete" },
                  { key: "apiKeyUsage" as const, label: "API key usage warnings", desc: "Alert when approaching usage limits" },
                  { key: "newIntegration" as const, label: "New integration available", desc: "Updates on new connector releases" },
                  { key: "weeklySummary" as const, label: "Weekly usage summary", desc: "Receive a weekly analytics digest" },
                  { key: "securityAlerts" as const, label: "Security alerts", desc: "Critical security notifications" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#475569]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifications[item.key] ? "bg-[#7C3AED]" : "bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          notifications[item.key] ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/25"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#7C3AED]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-lg font-semibold text-white">Session Management</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on Windows", location: "Lagos, Nigeria", time: "Current session", current: true },
                    { device: "Safari on macOS", location: "Lagos, Nigeria", time: "2 hours ago", current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{session.device}</p>
                          {session.current && (
                            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#475569]">{session.location} &middot; {session.time}</p>
                      </div>
                      {!session.current && (
                        <button className="text-xs text-[#EF4444] hover:text-[#DC2626]">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl">
              <h3 className="mb-6 text-lg font-semibold text-white">Appearance</h3>
              <div className="space-y-8">
                {/* Theme Selection */}
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Theme</p>
                  <div className="flex gap-3">
                    {THEMES.map((theme) => {
                      const Icon = theme.icon;
                      const isActive = currentTheme === theme.value;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => setCurrentTheme(theme.value)}
                          className={`flex items-center gap-3 rounded-xl border px-6 py-3 text-sm font-medium transition-all ${
                            isActive
                              ? "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#A78BFA]"
                              : "border-white/[0.06] bg-white/[0.02] text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <div className="text-left">
                            <div>{theme.label}</div>
                            <div className={`mt-1 h-2 w-8 rounded-full ${theme.bg} border border-white/[0.1]`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Accent Color</p>
                  <div className="flex gap-3">
                    {ACCENT_COLORS.map((color) => {
                      const isActive = currentAccent === color.value;
                      return (
                        <button
                          key={color.value}
                          onClick={() => setCurrentAccent(color.value)}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <div
                            className={`h-9 w-9 rounded-full transition-all hover:scale-110 ${
                              isActive ? "ring-2 ring-offset-2 ring-offset-[#0A0F1E]" : ""
                            }`}
                            style={{
                              backgroundColor: color.value,
                              boxShadow: isActive
                                ? `0 0 0 2px #0A0F1E, 0 0 0 4px ${color.value}`
                                : undefined,
                            }}
                          />
                          <span className={`text-[10px] ${isActive ? "text-white" : "text-[#475569]"}`}>
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Preview</p>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: currentAccent }}
                      />
                      <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full w-3/4 rounded-full transition-colors"
                          style={{ backgroundColor: currentAccent }}
                        />
                      </div>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors"
                        style={{ backgroundColor: currentAccent }}
                      >
                        Button
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Compact */}
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Sidebar</p>
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div>
                      <p className="text-sm text-white">Compact Mode</p>
                      <p className="text-xs text-[#475569]">Show only icons in sidebar</p>
                    </div>
                    <button
                      onClick={() => setCompactSidebar(!compactSidebar)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        compactSidebar ? "bg-[#7C3AED]" : "bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          compactSidebar ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/25"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
