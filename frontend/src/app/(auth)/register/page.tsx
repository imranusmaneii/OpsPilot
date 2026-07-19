"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    localStorage.setItem("access_token", "demo-token");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050810] px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/[0.04] blur-[120px]" />
        <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-[#2563EB]/[0.03] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-lg shadow-[#7C3AED]/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Start using OpsPilot AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#64748B]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-white placeholder-[#475569] outline-none transition-all focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#64748B]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-white placeholder-[#475569] outline-none transition-all focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
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
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 pr-12 text-white placeholder-[#475569] outline-none transition-all focus:border-[#7C3AED]/40 focus:bg-white/[0.05]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 font-medium text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/25 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
            <Link href="/login" className="text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
