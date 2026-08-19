"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Wallet, Bell, LogOut, Code2, ShieldCheck, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";

interface DashboardHeaderProps {
  balance?: number;
}

export function DashboardHeader({ balance }: DashboardHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const isMentor = user?.role?.toLowerCase() === "mentor";
  const userBalance = balance !== undefined ? balance : (user?.wallet?.balance_cents ? user.wallet.balance_cents / 100 : 0);

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
        {/* Brand Logo + Real Role Badge */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition shadow-md ${
              isMentor 
                ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
                : "bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
            }`}>
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Unblock<span className={isMentor ? "text-emerald-400" : "text-indigo-400"}>.dev</span>
            </span>
          </Link>

          <span className="text-slate-700">|</span>

          {/* Real Role Indicator */}
          <div className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border shadow-sm ${
            isMentor
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
          }`}>
            {isMentor ? <ShieldCheck className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span>{isMentor ? "Painel do Mentor" : "Painel do Desenvolvedor"}</span>
          </div>
        </div>

        {/* Navigation Links strictly based on Role */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <Link href="/dashboard" className="text-white font-semibold flex items-center gap-1.5 hover:text-white transition">
            {isMentor ? "Fila de Atendimentos" : "Meus Chamados"}
          </Link>
          {!isMentor && (
            <Link href="/request" className="hover:text-white transition flex items-center gap-1.5 text-indigo-400 font-semibold">
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
              <span className="font-bold text-emerald-400">R$ {userBalance.toFixed(2)}</span>
            </div>
            {!isMentor && (
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                <Plus className="w-3 h-3" />
              </div>
            )}
          </Link>

          {/* User Profile & Real Logout */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-white font-bold text-xs shadow-md ${
              isMentor
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400/40"
                : "bg-gradient-to-tr from-indigo-600 to-purple-500 border-indigo-400/40"
            }`}>
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-tight">
                {user?.name || "Usuário"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isMentor ? "Mentor Especialista" : "Desenvolvedor"}
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
