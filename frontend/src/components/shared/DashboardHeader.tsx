"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Wallet, Bell, LogOut, Code2, ShieldCheck, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";

interface DashboardHeaderProps {
  role: "dev" | "mentor";
  setRole: (role: "dev" | "mentor") => void;
  balance?: number;
}

export function DashboardHeader({ role, setRole, balance = 0.0 }: DashboardHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo + Dashboard Badge */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition shadow-md">
              <Zap className="w-4 h-4 fill-indigo-400/20 group-hover:fill-white/20" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Unblock<span className="text-indigo-400">.dev</span>
            </span>
          </Link>

          <span className="text-slate-700">|</span>

          {/* Account Role Switcher Badge */}
          <div className="relative p-1 bg-slate-900/90 rounded-xl border border-white/10 flex items-center">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out shadow-md ${
                role === "dev"
                  ? "left-1 bg-indigo-600 border border-indigo-400/30"
                  : "left-[calc(50%+2px)] bg-emerald-600 border border-emerald-400/30"
              }`}
            />
            <button
              onClick={() => setRole("dev")}
              className={`relative z-10 px-3 py-1 text-[11px] font-semibold transition-colors duration-300 flex items-center gap-1.5 ${
                role === "dev" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Dev View
            </button>
            <button
              onClick={() => setRole("mentor")}
              className={`relative z-10 px-3 py-1 text-[11px] font-semibold transition-colors duration-300 flex items-center gap-1.5 ${
                role === "mentor" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Mentor View
            </button>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/dashboard" className="text-white font-semibold flex items-center gap-1.5">
            Painel Geral
          </Link>
          {role === "dev" && (
            <Link href="/request" className="hover:text-white transition flex items-center gap-1.5">
              Pedir SOS
            </Link>
          )}
          <Link href="/wallet" className="hover:text-white transition flex items-center gap-1.5">
            Carteira &amp; Extrato
          </Link>
        </nav>

        {/* Right Side Widgets: Balance, Notifications & User Avatar */}
        <div className="flex items-center gap-4">
          {/* Balance Pill */}
          <Link
            href="/wallet"
            className="glass-pill px-3.5 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-2.5 hover:border-emerald-500/60 transition group"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-baseline gap-1 font-mono text-xs">
              <span className="text-slate-400 text-[10px] uppercase">Saldo:</span>
              <span className="font-bold text-emerald-400">R$ {balance.toFixed(2)}</span>
            </div>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              <Plus className="w-3 h-3" />
            </div>
          </Link>

          {/* Notifications Bell */}
          <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          {/* User Profile & Real Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 border border-indigo-400/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-tight">
                {user?.name || "Usuário"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {user?.role?.toLowerCase() === "mentor" ? "Mentor Especialista" : "Desenvolvedor"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Encerrar sessão segura"
              className="p-1.5 text-slate-400 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
