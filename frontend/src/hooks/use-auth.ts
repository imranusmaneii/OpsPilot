"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setTokens, logout } = useAuthStore();

  const signOut = () => {
    logout();
    router.push("/login");
  };

  return { user, isAuthenticated, setUser, setTokens, signOut };
}
