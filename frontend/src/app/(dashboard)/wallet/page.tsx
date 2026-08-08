"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Wallet, Clock } from "lucide-react";

export default function WalletPage() {
  const [role, setRole] = useState<"dev" | "mentor">("dev");

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      <DashboardHeader role={role} setRole={setRole} balance={50.0} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-3.5 h-3.5" /> Carteira &amp; Saldo de Minutos
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            Gestão de Créditos
          </h1>
          <p className="text-slate-400 text-sm">
            Adicione créditos via Pix ou Cartão para utilizar em sessões de pair programming ao vivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 text-center">
            <h3 className="text-slate-300 font-bold text-lg">Pacote Inicial</h3>
            <p className="text-4xl font-extrabold text-white font-mono">R$ 30,00</p>
            <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~12 minutos de sessão
            </p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition">
              Recarregar Pix R$ 30
            </button>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-indigo-500/50 glow-primary space-y-4 text-center relative bg-gradient-to-b from-indigo-950/20 to-[#0f172a]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white font-mono uppercase tracking-wider">
              Mais Popular
            </span>
            <h3 className="text-slate-300 font-bold text-lg">Pacote Pro</h3>
            <p className="text-4xl font-extrabold text-white font-mono">R$ 60,00</p>
            <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~24 minutos de sessão
            </p>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg glow-primary">
              Recarregar Pix R$ 60
            </button>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 text-center">
            <h3 className="text-slate-300 font-bold text-lg">Pacote Senior</h3>
            <p className="text-4xl font-extrabold text-white font-mono">R$ 150,00</p>
            <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~60 minutos de sessão
            </p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition">
              Recarregar Pix R$ 150
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
