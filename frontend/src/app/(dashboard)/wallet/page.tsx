"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Wallet, Clock, History, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const [role, setRole] = useState<"dev" | "mentor">(user?.role === "mentor" ? "mentor" : "dev");
  const [balanceCents, setBalanceCents] = useState<number>(user?.wallet?.balance_cents || 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadWalletData = async () => {
    try {
      const balRes = await api.wallet.getBalance();
      setBalanceCents(balRes.balance_cents);
      const txsRes = await api.wallet.listTransactions();
      setTransactions(txsRes || []);
    } catch (err) {
      console.error("Failed to load wallet data", err);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDeposit = async (amountCents: number) => {
    setIsLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const tx = await api.wallet.deposit(amountCents, "PIX");
      setSuccessMsg(`Depósito de R$ ${(amountCents / 100).toFixed(2)} realizado com sucesso!`);
      setBalanceCents(tx.balance_after_cents);
      await loadWalletData();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao realizar depósito.");
    } finally {
      setIsLoading(false);
    }
  };

  const balanceBrl = (balanceCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      <DashboardHeader role={role} setRole={setRole} balance={parseFloat(balanceBrl)} />

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

        {/* Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Current Balance Showcase Card */}
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 glow-success bg-gradient-to-r from-emerald-950/20 via-[#0f172a] to-[#090d16] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Saldo Atual em Conta
            </span>
            <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 font-mono">
              R$ {balanceBrl}
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Est.: ~{Math.floor(balanceCents / 300)} minutos de mentoria ao vivo
            </p>
          </div>
        </div>

        {/* Deposit Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 text-center">
            <h3 className="text-slate-300 font-bold text-lg">Pacote Inicial</h3>
            <p className="text-4xl font-extrabold text-white font-mono">R$ 30,00</p>
            <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~12 minutos de sessão
            </p>
            <button
              onClick={() => handleDeposit(3000)}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
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
            <button
              onClick={() => handleDeposit(6000)}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg glow-primary disabled:opacity-50"
            >
              Recarregar Pix R$ 60
            </button>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 text-center">
            <h3 className="text-slate-300 font-bold text-lg">Pacote Senior</h3>
            <p className="text-4xl font-extrabold text-white font-mono">R$ 150,00</p>
            <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> ~60 minutos de sessão
            </p>
            <button
              onClick={() => handleDeposit(15000)}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
            >
              Recarregar Pix R$ 150
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Extrato de Transações
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {transactions.length === 0 ? (
              <p className="text-slate-500">Nenhuma transação registrada ainda.</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass-card p-4 rounded-xl border border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white">{tx.description}</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(tx.created_at).toLocaleString("pt-BR")} • {tx.gateway}
                    </span>
                  </div>
                  <div
                    className={`font-extrabold text-sm ${
                      tx.amount_cents > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {tx.amount_cents > 0 ? "+" : ""}R$ {(tx.amount_cents / 100).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
