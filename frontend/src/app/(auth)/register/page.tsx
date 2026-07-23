"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import dynamic from "next/dynamic";

const LoginHero3D = dynamic(
  () => import("@/components/shared/login-hero-3d").then((m) => m.LoginHero3D),
  { ssr: false }
);
const TiltCard = dynamic(
  () => import("@/components/shared/login-hero-3d").then((m) => m.TiltCard),
  { ssr: false }
);

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (regRes.ok) {
        const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          setTokens(data.access_token, data.refresh_token);

          const meRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          if (meRes.ok) {
            const user = await meRes.json();
            setUser(user);
          }
          router.push("/chat");
          return;
        }
      }

      const errData = await regRes.json().catch(() => ({}));
      setError(errData.detail || "Registration failed");
    } catch {
      // Backend not available — demo mode
      localStorage.setItem("access_token", "demo-token");
      setUser({
        id: "demo-user",
        email: email || "demo@opspilot.ai",
        name: name || "Demo User",
        avatar_url: null,
        api_key: null,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      router.push("/chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/api/v1/auth/google`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.access_token, data.refresh_token);
        router.push("/chat");
        return;
      }
    } catch {
      // Demo fallback
    }
    localStorage.setItem("access_token", "demo-token-google");
    setUser({
      id: "google-demo-user",
      email: "user@gmail.com",
      name: "Google User",
      avatar_url: null,
      api_key: null,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050810] px-4">
      <LoginHero3D />

      <TiltCard className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#DC2626] to-[#2563EB] shadow-lg shadow-[#DC2626]/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Start using OpsPilot AI
            </p>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06] disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A0F1E] px-2 text-[#475569]">or</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#64748B]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-white placeholder-[#475569] outline-none transition-all focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#64748B]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-white placeholder-[#475569] outline-none transition-all focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#64748B]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 pr-12 text-white placeholder-[#475569] outline-none transition-all focus:border-[#DC2626]/40 focus:bg-white/[0.05]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-4 py-3 font-medium text-white transition-all hover:bg-[#991B1B] hover:shadow-lg hover:shadow-[#DC2626]/25 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FCA5A5] hover:text-[#C4B5FD] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </TiltCard>
    </div>
  );
}
