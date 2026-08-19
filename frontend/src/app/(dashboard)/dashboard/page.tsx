"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Wallet,
  History,
  Star,
  Terminal,
  ShieldCheck,
  Plus,
  Radio,
  ExternalLink,
} from "lucide-react";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [role, setRole] = useState<"dev" | "mentor">(user?.role === "mentor" ? "mentor" : "dev");
  const [isOnline, setIsOnline] = useState(true);
  const [balanceCents, setBalanceCents] = useState<number>(user?.wallet?.balance_cents || 0);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [openQueue, setOpenQueue] = useState<any[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const bal = await api.wallet.getBalance();
      setBalanceCents(bal.balance_cents);

      if (role === "dev") {
        const reqs = await api.requests.listMy();
        setMyTickets(reqs || []);
      } else {
        const queue = await api.requests.listOpen();
        setOpenQueue(queue || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  const handleAcceptRequest = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      const res = await api.requests.accept(requestId);
      router.push(`/room/${res.session.id}`);
    } catch (err: any) {
      alert(err.message || "Erro ao aceitar chamado.");
      await loadData();
    } finally {
      setAcceptingId(null);
    }
  };

  const balanceBrl = (balanceCents / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      {/* Dedicated App Dashboard Header */}
      <DashboardHeader role={role} setRole={setRole} balance={parseFloat(balanceBrl)} />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* ========================================================= */}
        {/* DEVELOPER DASHBOARD VIEW                                   */}
        {/* ========================================================= */}
        {role === "dev" && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Greeting & Primary SOS Action Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 glow-primary flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-[#0f172a] to-[#090d16]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Painel do Desenvolvedor
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white">
                  Boas-vindas, {user?.name || "Dev"}! 👋
                </h1>
                <p className="text-slate-300 text-sm max-w-xl">
                  Está travado em algum erro técnico? Dispare um chamado SOS e resolva em minutos em uma sala ao vivo com um mentor sênior.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/request"
                  className="px-6 py-3.5 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-2xl glow-sos text-sm transition flex items-center justify-center gap-2 shadow-xl"
                >
                  <Zap className="w-5 h-5 fill-white/20" />
                  Pedir SOS Bug-Fix Agora
                </Link>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Saldo */}
              <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-3 bg-emerald-500/5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Saldo de Créditos
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-white font-mono">R$ {balanceBrl}</div>
                  <p className="text-xs text-emerald-400 font-mono">
                    ~{Math.floor(balanceCents / 300)} minutos de mentoria ao vivo
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/wallet"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Adicionar mais créditos &rarr;
                  </Link>
                </div>
              </div>

              {/* Card 2: Histórico */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Atendimentos Criados
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {myTickets.length} Sessões
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Histórico completo mantido</p>
                </div>
              </div>

              {/* Card 3: Status Mentores */}
              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Mentores em Atendimento
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Ao Vivo
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-white font-mono">34 Online</div>
                  <p className="text-xs text-slate-400 font-mono">Tempo médio de match: &lt; 90s</p>
                </div>
              </div>
            </div>

            {/* Recent Tickets Table Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    Seus Chamados SOS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Consulte os pedidos criados e acesse as salas de atendimento.
                  </p>
                </div>
                <Link
                  href="/request"
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Novo SOS
                </Link>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {myTickets.length === 0 ? (
                  <p className="text-slate-500 py-4">Nenhum chamado aberto ainda.</p>
                ) : (
                  myTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            #{ticket.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {ticket.status}
                          </span>
                          {ticket.stack?.map((s: string) => (
                            <span
                              key={s}
                              className="text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition font-sans">
                          {ticket.title}
                        </h4>
                        <p className="text-slate-400 text-xs font-sans line-clamp-1">{ticket.description}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-white">
                            Até R$ {(ticket.max_minute_rate_cents / 100).toFixed(2)}/min
                          </div>
                        </div>

                        <Link
                          href={`/room/${ticket.id}`}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                          Ver Sala
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MENTOR DASHBOARD VIEW                                     */}
        {/* ========================================================= */}
        {role === "mentor" && (
          <div className="space-y-8 animate-fade-in">
            {/* Mentor Status Banner & Queue Controls */}
            <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 glow-success flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-emerald-950/30 via-[#0f172a] to-[#090d16]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Painel de Mentoria ao Vivo
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white">
                  Fila de Chamados SOS
                </h1>
                <p className="text-slate-300 text-sm max-w-xl">
                  Você está qualificado como Mentor Senior. Aceite chamados da fila e receba por minuto durante as sessões de pair programming.
                </p>
              </div>

              {/* Online Toggle Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-xs transition flex items-center gap-3 border shadow-xl ${
                    isOnline
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 glow-success"
                      : "bg-slate-800 text-slate-400 border-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isOnline ? "bg-white animate-ping" : "bg-slate-600"
                    }`}
                  />
                  {isOnline ? "ONLINE NA FILA (RECEBENDO)" : "OFFLINE (PAUSADO)"}
                </button>
              </div>
            </div>

            {/* Live Queue Feed Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Chamados Abertos na Fila em Tempo Real ({openQueue.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clique em Aceitar para iniciar a sala colaborativa com trava Redis.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {openQueue.length === 0 ? (
                  <p className="text-slate-500 py-4 font-mono text-xs">
                    Nenhum chamado aberto na fila no momento.
                  </p>
                ) : (
                  openQueue.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition space-y-4 group shadow-xl"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                            #{item.id}
                          </span>
                          <span className="text-slate-400">• Cliente: <strong className="text-white">{item.client_name || "Cliente"}</strong></span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <span className="text-xs text-slate-400">Oferta: </span>
                            <span className="text-sm font-extrabold text-emerald-400">
                              R$ {(item.max_minute_rate_cents / 100).toFixed(2)}/min
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {item.stack?.map((st: string) => (
                            <span
                              key={st}
                              className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold"
                            >
                              {st}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => handleAcceptRequest(item.id)}
                          disabled={acceptingId === item.id}
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg glow-success flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Zap className="w-4 h-4 fill-white/20" />
                          {acceptingId === item.id ? "Aceitando chamado..." : "Aceitar Chamado & Entrar na Sala"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
