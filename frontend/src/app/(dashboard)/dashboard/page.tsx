import Link from "next/link";
import { Zap, Wallet, History } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Painel do Desenvolvedor</h1>
          <p className="text-slate-400 text-sm">Gerencie seu saldo e abra sessões de pair programming sob demanda.</p>
        </div>
        <Link
          href="/request"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-semibold rounded-xl glow-sos transition"
        >
          <Zap className="w-5 h-5" />
          Pedir SOS Agora
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Saldo Disponível</span>
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">R$ 50,00</p>
          <p className="text-xs text-emerald-400">~20 minutos de mentoria ao vivo</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Atendimentos Concluídos</span>
            <History className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">12 sessões</p>
          <p className="text-xs text-slate-400">Média de 14 min por chamado</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-sm font-medium">Mentores Ativos</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-3xl font-extrabold text-white">34 Online</p>
          <p className="text-xs text-slate-400">Tempo de match &lt; 90s</p>
        </div>
      </div>
    </div>
  );
}
