"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { api } from "@/lib/api";
import { ShieldCheck, Lock } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // 1. Check if token is present in client store
    if (!token) {
      router.replace("/login");
      return;
    }

    // 2. Validate token on backend via /api/auth/me
    const verifyAuth = async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        setIsVerifying(false);
      } catch (err) {
        console.error("Auth session expired or invalid", err);
        logout();
        router.replace("/login");
      }
    };

    verifyAuth();
  }, [token, router, setUser, logout]);

  if (isVerifying || !token) {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center font-mono">
          <p className="text-xs text-slate-300 font-semibold">
            Verificando credenciais seguras...
          </p>
          <p className="text-[10px] text-slate-500">
            Acesso protegido por JWT criptografado
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
