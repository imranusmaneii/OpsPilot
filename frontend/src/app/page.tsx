"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#050810]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/[0.04] blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] shadow-xl shadow-[#7C3AED]/20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">OpsPilot</h1>
          <p className="text-sm text-[#64748B]">AI Engineering Platform</p>
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
      </div>
    </div>
  );
}
