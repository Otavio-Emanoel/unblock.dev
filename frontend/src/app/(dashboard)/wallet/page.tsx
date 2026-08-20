"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Wallet, Clock, History, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";
import { CustomModal, ModalConfig } from "@/components/shared/CustomModal";

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isMentor = user?.role?.toLowerCase() === "mentor";

  const [balanceCents, setBalanceCents] = useState<number>(user?.wallet?.balance_cents || 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: "",
    description: "",
  });

  const showModal = (cfg: Omit<ModalConfig, "isOpen">) => {
    setModalConfig({ ...cfg, isOpen: true });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const loadWalletData = async () => {
    try {
      const balRes = await api.wallet.getBalance();
      setBalanceCents(balRes.balance_cents);
      if (user) {
        setUser({
          ...user,
          wallet: {
            balance_cents: balRes.balance_cents,
            currency: user.wallet?.currency || "BRL",
          },
        });
      }
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
      setSuccessMsg(`Depósito de R$ ${(amountCents / 100).toFixed(2)} realizado com sucesso via Pix!`);
      setBalanceCents(tx.balance_after_cents);
      if (user) {
        setUser({
          ...user,
          wallet: {
            balance_cents: tx.balance_after_cents,
            currency: user.wallet?.currency || "BRL",
          },
        });
      }
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
      <CustomModal config={modalConfig} onClose={closeModal} />
      <DashboardHeader balance={parseFloat(balanceBrl)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-3.5 h-3.5" /> {isMentor ? "Carteira de Ganhos do Mentor" : "Carteira & Saldo de Minutos"}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            {isMentor ? "Extrato Financeiro & Ganhos" : "Sua Carteira Unblock"}
          </h1>
          <p className="text-slate-400 text-sm">
            {isMentor
              ? "Acompanhe seus rendimentos por minuto de mentoria e histórico de repasses."
              : "Gerencie seu saldo de créditos Pix para utilizar durante atendimentos ao vivo com mentores."}
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Balance Overview Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 glow-success flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-emerald-950/30 via-[#0f172a] to-[#090d16]">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              {isMentor ? "Saldo Disponível para Saque Pix" : "Saldo Total em Carteira"}
            </span>
            <div className="text-4xl md:text-5xl font-extrabold text-white font-mono">
              R$ {balanceBrl}
            </div>
            <p className="text-xs text-emerald-400 font-mono">
              {isMentor
                ? "Repasse automático de 80% do valor total das sessões concluídas"
                : `~${Math.floor(balanceCents / 300)} minutos estimados de atendimento ao vivo`}
            </p>
          </div>

          {!isMentor ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDeposit(3000)}
                disabled={isLoading}
                className="px-5 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-2xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                + R$ 30,00 Pix
              </button>
              <button
                onClick={() => handleDeposit(6000)}
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg glow-success cursor-pointer disabled:opacity-50"
              >
                + R$ 60,00 Pix (Recomendado)
              </button>
              <button
                onClick={() => handleDeposit(12000)}
                disabled={isLoading}
                className="px-5 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold rounded-2xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                + R$ 120,00 Pix
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                showModal({
                  type: "success",
                  title: "Saque Pix Solicitado",
                  description: (
                    <div className="space-y-2">
                      <p>Sua solicitação de saque instantâneo foi enviada com sucesso!</p>
                      <p className="text-slate-400 text-[11px]">
                        O valor disponível em saldo será creditado na sua chave Pix cadastrada em até alguns segundos.
                      </p>
                    </div>
                  ),
                  confirmText: "Entendido",
                })
              }
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg glow-success cursor-pointer flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Solicitar Saque Pix Instantâneo
            </button>
          )}
        </div>

        {/* Transactions Table Section */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Histórico de Transações &amp; Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Auditoria de depósitos, débitos de sessão e transferências instantâneas.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                Nenhuma transação registrada na sua carteira até o momento.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === "DEPOSIT" || tx.type === "MENTOR_PAYOUT"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "MENTOR_PAYOUT" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white font-sans text-sm">{tx.description || tx.type}</div>
                      <div className="text-[10px] text-slate-500">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString("pt-BR") : "Data recente"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        tx.type === "DEPOSIT" || tx.type === "MENTOR_PAYOUT"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "MENTOR_PAYOUT" ? "+" : "-"} R${" "}
                      {(tx.amount_cents / 100).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Saldo: R$ {(tx.balance_after_cents / 100).toFixed(2)}
                    </div>
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
