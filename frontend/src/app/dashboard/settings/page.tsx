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
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKey] = useState("opspilot_k8x92mN4pQ7wR3tY6bV1cZ5aF0dG");

  const handleSave = () => {
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

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-56 shrink-0">
          <div className="space-y-1 rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-2 backdrop-blur-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
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
                  { label: "Document indexing complete", desc: "Get notified when documents finish processing", default: true },
                  { label: "Evaluation finished", desc: "Receive alerts when evaluations complete", default: true },
                  { label: "API key usage warnings", desc: "Alert when approaching usage limits", default: true },
                  { label: "New integration available", desc: "Updates on new connector releases", default: false },
                  { label: "Weekly usage summary", desc: "Receive a weekly analytics digest", default: false },
                  { label: "Security alerts", desc: "Critical security notifications", default: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#475569]">{item.desc}</p>
                    </div>
                    <button
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        item.default ? "bg-[#7C3AED]" : "bg-white/[0.08]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          item.default ? "left-[22px]" : "left-0.5"
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
              <h3 className="mb-4 text-lg font-semibold text-white">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Theme</p>
                  <div className="flex gap-3">
                    {[
                      { label: "Dark", active: true },
                      { label: "Midnight", active: false },
                      { label: "OLED", active: false },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`rounded-xl border px-6 py-3 text-sm font-medium transition-all ${
                          theme.active
                            ? "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#A78BFA]"
                            : "border-white/[0.06] bg-white/[0.02] text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Accent Color</p>
                  <div className="flex gap-2">
                    {["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#EC4899"].map(
                      (color, i) => (
                        <button
                          key={color}
                          className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                            i === 0 ? "ring-2 ring-offset-2 ring-offset-[#0A0F1E]" : ""
                          }`}
                          style={{ backgroundColor: color, boxShadow: i === 0 ? `0 0 0 2px #0A0F1E, 0 0 0 4px ${color}` : undefined }}
                        />
                      )
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-white">Sidebar</p>
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div>
                      <p className="text-sm text-white">Compact Mode</p>
                      <p className="text-xs text-[#475569]">Show only icons in sidebar</p>
                    </div>
                    <button className="relative h-6 w-11 rounded-full bg-white/[0.08]">
                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
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
