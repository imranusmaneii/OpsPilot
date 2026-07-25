"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
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
import { CardTilt } from "@/components/shared/card-tilt";

type Theme = "dark" | "midnight" | "oled";
type AccentColor = string;

const ACCENT_COLORS = [
  { name: "Red", value: "#DC2626" },
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

function AvatarCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.15;
    }
  });
  return (
    <RoundedBox ref={meshRef} args={[2.2, 2.2, 0.3]} radius={0.15} smoothness={4}>
      <meshPhysicalMaterial
        color="#DC2626"
        transmission={0.7}
        roughness={0.15}
        metalness={0.1}
        thickness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        ior={1.5}
        envMapIntensity={1.5}
        emissive="#DC2626"
        emissiveIntensity={0.15}
      />
    </RoundedBox>
  );
}

function ToggleOrb({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      const target = active ? 1 : 0.3;
      const current = (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity += (target - current) * delta * 5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  return (
    <mesh ref={meshRef} scale={active ? 1.1 : 0.8}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshStandardMaterial
        color={active ? "#DC2626" : "#475569"}
        emissive={active ? "#DC2626" : "#475569"}
        emissiveIntensity={active ? 1 : 0.1}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function UsageRing({ percentage, color }: { percentage: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetAngle = (percentage / 100) * Math.PI * 2;
  const currentAngle = useRef(0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      currentAngle.current += (targetAngle - currentAngle.current) * delta * 3;
      meshRef.current.rotation.z = -currentAngle.current;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      <mesh>
        <torusGeometry args={[1, 0.08, 16, 64]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.1, 16, 64, targetAngle]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

function SessionOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      const t = Date.now() * 0.002;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(t) * 0.3;
      meshRef.current.rotation.y += delta * 0.4;
    }
  });
  return (
    <mesh ref={meshRef} scale={0.6}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#059669"
        emissive="#059669"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  );
}

function ThemePreview({ bg }: { bg: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });
  const color = bg === "bg-black" ? "#000000" : bg === "bg-[#0B1120]" ? "#0B1120" : "#050810";
  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[-2, -1, 2]} intensity={0.5} color="#DC2626" />
      <RoundedBox ref={meshRef} args={[1.5, 1.5, 1.5]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
      </RoundedBox>
    </group>
  );
}

function AccentSphere({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      const t = Date.now() * 0.002;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.sin(t) * 0.2;
    }
  });
  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 3]} intensity={1} color={color} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

function GlowingKeyIcon({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      const t = Date.now() * 0.002;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        active ? 0.6 + Math.sin(t) * 0.3 : 0.1;
    }
  });
  return (
    <group>
      <ambientLight intensity={active ? 0.5 : 0.2} />
      <pointLight position={[2, 2, 3]} intensity={active ? 1.5 : 0.3} color={active ? "#DC2626" : "#475569"} />
      <mesh ref={meshRef} scale={0.8}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={active ? "#DC2626" : "#475569"}
          emissive={active ? "#DC2626" : "#475569"}
          emissiveIntensity={active ? 0.8 : 0.1}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

function applyTheme(theme: Theme, accent: string) {
  const root = document.documentElement;
  root.classList.remove("dark", "midnight", "oled");
  root.classList.add(theme);
  root.style.setProperty("--accent-red", accent);

  if (theme === "oled") {
    root.style.setProperty("--background", "#000000");
    root.style.setProperty("--secondary", "#0A0A0A");
  } else if (theme === "midnight") {
    root.style.setProperty("--background", "#0B1120");
    root.style.setProperty("--secondary", "#111827");
  } else {
    root.style.setProperty("--background", "#050810");
    root.style.setProperty("--secondary", "#0A0F1E");
  }
}

function loadSettings(): { theme: Theme; accent: string } {
  if (typeof window === "undefined") return { theme: "dark", accent: "#DC2626" };
  try {
    const saved = localStorage.getItem("opspilot-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { theme: parsed.theme || "dark", accent: parsed.accent || "#DC2626" };
    }
  } catch {}
  return { theme: "dark", accent: "#DC2626" };
}

function saveSettings(theme: Theme, accent: string) {
  try {
    localStorage.setItem("opspilot-settings", JSON.stringify({ theme, accent }));
  } catch {}
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKey] = useState("opspilot_k8x92mN4pQ7wR3tY6bV1cZ5aF0dG");

  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");
  const [currentAccent, setCurrentAccent] = useState<AccentColor>("#DC2626");
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [notifications, setNotifications] = useState({
    docIndexing: true,
    evaluation: true,
    apiKeyUsage: true,
    newIntegration: false,
    weeklySummary: false,
    securityAlerts: true,
  });

  useEffect(() => {
    const settings = loadSettings();
    setCurrentTheme(settings.theme);
    setCurrentAccent(settings.accent);
    applyTheme(settings.theme, settings.accent);
    setMounted(true);
  }, []);

  const handleSave = () => {
    applyTheme(currentTheme, currentAccent);
    saveSettings(currentTheme, currentAccent);
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
                      ? "bg-[#DC2626]/15 text-[#FCA5A5]"
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
              <CardTilt className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl" tiltAmount={4} perspective={1000}>
                <h3 className="mb-4 text-lg font-semibold text-white">Profile Information</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <Canvas
                      gl={{ alpha: true, antialias: true }}
                      camera={{ position: [0, 0, 3.5], fov: 40 }}
                      style={{ background: "transparent" }}
                    >
                      <ambientLight intensity={0.4} />
                      <pointLight position={[3, 3, 5]} intensity={1.2} color="#DC2626" />
                      <pointLight position={[-3, -2, 4]} intensity={0.6} color="#2563EB" />
                      <AvatarCrystal />
                    </Canvas>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-white drop-shadow-lg z-10">OP</span>
                    </div>
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
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@opspilot.ai"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Role</label>
                    <input
                      type="text"
                      defaultValue="AI Engineer"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Organization</label>
                    <input
                      type="text"
                      defaultValue="OpsPilot AI"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                    />
                  </div>
                </div>
              </CardTilt>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 ${
                    saved
                      ? "bg-emerald-600 shadow-lg shadow-emerald-500/30 scale-[0.97]"
                      : "bg-[#DC2626] hover:bg-[#991B1B] hover:shadow-lg hover:shadow-[#DC2626]/25 active:scale-[0.97] active:translate-y-px"
                  }`}
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
                  <button className="flex items-center gap-2 rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/10 px-4 py-2 text-xs font-medium text-[#FCA5A5] transition-colors hover:bg-[#DC2626]/20">
                    <Key className="h-3.5 w-3.5" />
                    Generate New Key
                  </button>
                </div>
                <p className="mb-6 text-sm text-[#64748B]">
                  Use API keys to authenticate requests to the OpsPilot API. Keep your keys secure.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                      <Canvas
                        gl={{ alpha: true, antialias: true }}
                        camera={{ position: [0, 0, 2.5], fov: 35 }}
                        style={{ background: "transparent" }}
                      >
                        <GlowingKeyIcon active={true} />
                      </Canvas>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#DC2626]">Production</span>
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
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                      <Canvas
                        gl={{ alpha: true, antialias: true }}
                        camera={{ position: [0, 0, 2.5], fov: 35 }}
                        style={{ background: "transparent" }}
                      >
                        <GlowingKeyIcon active={false} />
                      </Canvas>
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
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col items-center">
                    <div className="relative h-28 w-28">
                      <Canvas
                        gl={{ alpha: true, antialias: true }}
                        camera={{ position: [0, 0, 3.5], fov: 40 }}
                        style={{ background: "transparent" }}
                      >
                        <ambientLight intensity={0.3} />
                        <pointLight position={[3, 3, 5]} intensity={1} color="#DC2626" />
                        <UsageRing percentage={62} color="#DC2626" />
                      </Canvas>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-white">62%</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">Requests Today</p>
                    <p className="text-lg font-bold text-white">1,247</p>
                    <p className="text-[10px] text-[#475569]">of 2,000 daily limit</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col items-center">
                    <div className="relative h-28 w-28">
                      <Canvas
                        gl={{ alpha: true, antialias: true }}
                        camera={{ position: [0, 0, 3.5], fov: 40 }}
                        style={{ background: "transparent" }}
                      >
                        <ambientLight intensity={0.3} />
                        <pointLight position={[3, 3, 5]} intensity={1} color="#2563EB" />
                        <UsageRing percentage={48} color="#2563EB" />
                      </Canvas>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-white">48%</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">Tokens This Month</p>
                    <p className="text-lg font-bold text-white">2.4M</p>
                    <p className="text-[10px] text-[#475569]">of 5M monthly limit</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col items-center">
                    <div className="relative h-28 w-28">
                      <Canvas
                        gl={{ alpha: true, antialias: true }}
                        camera={{ position: [0, 0, 3.5], fov: 40 }}
                        style={{ background: "transparent" }}
                      >
                        <ambientLight intensity={0.3} />
                        <pointLight position={[3, 3, 5]} intensity={1} color="#059669" />
                        <UsageRing percentage={18} color="#059669" />
                      </Canvas>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-white">18%</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">Cost This Month</p>
                    <p className="text-lg font-bold text-white">$18.42</p>
                    <p className="text-[10px] text-[#475569]">of $100 budget</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="rounded-2xl border border-white/[0.06] bg-[#0A0F1E]/60 p-6 backdrop-blur-xl"
            >
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
                  <motion.div
                    key={item.key}
                    variants={{
                      hidden: { opacity: 0, y: 12, rotateX: -4 },
                      visible: { opacity: 1, y: 0, rotateX: 0 },
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                    style={{ perspective: 600 }}
                  >
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
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                        notifications[item.key] ? "bg-[#DC2626]/80" : "bg-white/[0.08]"
                      }`}
                      style={{
                        boxShadow: notifications[item.key]
                          ? "0 0 12px 2px rgba(220,38,38,0.3), inset 0 1px 2px rgba(0,0,0,0.2)"
                          : "inset 0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200 ${
                          notifications[item.key] ? "left-[22px]" : "left-0.5"
                        }`}
                        style={{
                          background: notifications[item.key]
                            ? "radial-gradient(circle at 35% 35%, #ffffff, #fca5a5 60%, #dc2626)"
                            : "radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8 60%, #64748b)",
                          boxShadow: notifications[item.key]
                            ? "0 0 8px 2px rgba(220,38,38,0.4), 0 2px 4px rgba(0,0,0,0.3)"
                            : "0 1px 3px rgba(0,0,0,0.3)",
                        }}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 ${
                    saved
                      ? "bg-emerald-600 shadow-lg shadow-emerald-500/30 scale-[0.97]"
                      : "bg-[#DC2626] hover:bg-[#991B1B] hover:shadow-lg hover:shadow-[#DC2626]/25 active:scale-[0.97] active:translate-y-px"
                  }`}
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved!" : "Save Preferences"}
                </button>
              </div>
            </motion.div>
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
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors focus:border-[#DC2626]/40"
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
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                        session.current
                          ? "border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_20px_4px_rgba(5,150,105,0.08)]"
                          : "border-white/[0.06] bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0">
                          {session.current ? (
                            <Canvas
                              gl={{ alpha: true, antialias: true }}
                              camera={{ position: [0, 0, 2.5], fov: 35 }}
                              style={{ background: "transparent" }}
                            >
                              <SessionOrb />
                            </Canvas>
                          ) : (
                            <div className="h-full w-full rounded-full bg-[#475569]/30" />
                          )}
                        </div>
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
                          className={`flex flex-col items-center gap-2 rounded-xl border px-5 py-4 text-sm font-medium transition-all ${
                            isActive
                              ? "border-[#DC2626]/40 bg-[#DC2626]/10 text-[#FCA5A5] shadow-[0_0_20px_4px_rgba(220,38,38,0.1)]"
                              : "border-white/[0.06] bg-white/[0.02] text-[#475569] hover:bg-white/[0.04] hover:text-[#94A3B8]"
                          }`}
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                            <Canvas
                              gl={{ alpha: true, antialias: true }}
                              camera={{ position: [0, 0, 3.5], fov: 35 }}
                              style={{ background: "transparent" }}
                            >
                              <ThemePreview bg={theme.bg} />
                            </Canvas>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5" />
                            <span>{theme.label}</span>
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
                            className={`h-9 w-9 rounded-full transition-all duration-200 hover:scale-110 ${
                              isActive ? "scale-110" : ""
                            }`}
                            style={{
                              backgroundColor: color.value,
                              boxShadow: isActive
                                ? `0 0 0 2px #0A0F1E, 0 0 0 4px ${color.value}, 0 0 16px 4px ${color.value}40`
                                : `0 0 0 0px transparent`,
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
                      <div className="relative h-6 w-6 shrink-0">
                        <Canvas
                          gl={{ alpha: true, antialias: true }}
                          camera={{ position: [0, 0, 2.5], fov: 35 }}
                          style={{ background: "transparent" }}
                        >
                          <AccentSphere color={currentAccent} />
                        </Canvas>
                      </div>
                      <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full w-3/4 rounded-full transition-colors"
                          style={{ backgroundColor: currentAccent }}
                        />
                      </div>
                      <button
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 active:scale-[0.97]"
                        style={{
                          backgroundColor: currentAccent,
                          boxShadow: `0 0 12px 2px ${currentAccent}30`,
                        }}
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
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                        compactSidebar ? "bg-[#DC2626]/80" : "bg-white/[0.08]"
                      }`}
                      style={{
                        boxShadow: compactSidebar
                          ? "0 0 12px 2px rgba(220,38,38,0.3), inset 0 1px 2px rgba(0,0,0,0.2)"
                          : "inset 0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200 ${
                          compactSidebar ? "left-[22px]" : "left-0.5"
                        }`}
                        style={{
                          background: compactSidebar
                            ? "radial-gradient(circle at 35% 35%, #ffffff, #fca5a5 60%, #dc2626)"
                            : "radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8 60%, #64748b)",
                          boxShadow: compactSidebar
                            ? "0 0 8px 2px rgba(220,38,38,0.4), 0 2px 4px rgba(0,0,0,0.3)"
                            : "0 1px 3px rgba(0,0,0,0.3)",
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 ${
                    saved
                      ? "bg-emerald-600 shadow-lg shadow-emerald-500/30 scale-[0.97]"
                      : "bg-[#DC2626] hover:bg-[#991B1B] hover:shadow-lg hover:shadow-[#DC2626]/25 active:scale-[0.97] active:translate-y-px"
                  }`}
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
