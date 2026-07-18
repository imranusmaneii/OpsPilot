"use client";

import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[#94A3B8]">Manage your account and preferences</p>
      </div>
      <EmptyState
        icon={Settings}
        title="Settings"
        description="Configure your profile, API keys, and platform preferences."
      />
    </div>
  );
}
