"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/chat");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#050810]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#DC2626] border-t-transparent" />
    </div>
  );
}
