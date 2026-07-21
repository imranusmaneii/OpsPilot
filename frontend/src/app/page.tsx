"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, FileText, MessageSquare, Shield } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050810]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050810]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#7C3AED]/[0.03] blur-[150px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-[#2563EB]/[0.03] blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">OpsPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#6D28D9]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-xl shadow-[#7C3AED]/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Enterprise AI Operations
            <span className="gradient-text"> Copilot</span>
          </h1>

          <p className="mb-8 text-lg text-[#64748B]">
            Upload documents, ask questions, and get intelligent answers powered
            by AI. Secure, fast, and always available.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 font-medium text-white transition-all hover:bg-[#6D28D9] hover:shadow-lg hover:shadow-[#7C3AED]/25"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-6 py-3 font-medium text-[#94A3B8] transition-all hover:border-[#7C3AED]/30 hover:text-white"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#475569]">
            5 free messages — no account required
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            {
              icon: FileText,
              title: "Document Analysis",
              desc: "Upload PDFs, DOCX, or text files and get instant answers",
            },
            {
              icon: MessageSquare,
              title: "Smart Chat",
              desc: "Ask questions and get accurate answers from your documents",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "Your documents stay private. Enterprise-grade security",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left"
            >
              <feature.icon className="mb-3 h-5 w-5 text-[#7C3AED]" />
              <h3 className="mb-1 text-sm font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-[#475569]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-[#475569]">
        OpsPilot AI v0.1.0 — Enterprise AI Operations Platform
      </footer>
    </div>
  );
}
