"use client";

import { useState } from "react";
import Link from "next/link";
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

// Mock Data for Recent SOS Tickets
const RECENT_TICKETS = [
  {
    id: "sos-8492",
    date: "Hoje, 15:42",
    title: "Deadlock em Goroutines com Redis Lock",
    stack: ["Go", "Redis"],
    mentor: "Alex Santos",
    mentorRole: "Go & K8s Expert",
    duration: "18 min",
    cost: "R$ 45,00",
    status: "Resolvido",
  },
  {
    id: "sos-8310",
    date: "Ontem, 20:15",
    title: "Hydration error em Server Components no Next.js 15",
    stack: ["Next.js", "React"],
    mentor: "Marina K.",
    mentorRole: "Frontend Architect",
    duration: "12 min",
    cost: "R$ 26,40",
    status: "Resolvido",
  },
  {
    id: "sos-8102",
    date: "04 de Ago",
    title: "Memory leak em WebSocket Hub no Go Chi Router",
    stack: ["Go", "WebSockets"],
    mentor: "Carlos R.",
    mentorRole: "Backend Principal",
    duration: "22 min",
    cost: "R$ 55,00",
    status: "Resolvido",
  },
];

// Mock Data for Mentor Open Queue Calls
const MENTOR_LIVE_QUEUE = [
  {
    id: "sos-8940",
    timeAgo: "Há 45 seg",
    title: "Concorrência em Goroutines no Worker Pool com Context Cancelation",
    description: "Estou enfrentando leak de goroutines quando a conexão do cliente cai antes do flush do Redis.",
    client: "Lucas Mendes",
    stack: ["Go 1.22", "Redis", "Worker Pools"],
    rateOffer: "R$ 2,80/min",
    avgEst: "~15 min",
  },
  {
    id: "sos-8938",
    timeAgo: "Há 2 min",
    title: "Falha de Ingress NGINX SSL no Kubernetes K3s",
    description: "Certificado cert-manager não renova em staging devido a regra de Let's Encrypt HTTP-01.",
    client: "Beatriz Torres",
    stack: ["Docker", "Kubernetes", "NGINX"],
    rateOffer: "R$ 3,00/min",
    avgEst: "~20 min",
  },
  {
    id: "sos-8925",
    timeAgo: "Há 4 min",
    title: "Query lenta em PostgreSQL com JOIN triplo e campos JSONB",
    description: "Explain analyze mostra Seq Scan em tabela com 4M de registros. Preciso otimizar índice GIN.",
    client: "Fernando Garcia",
    stack: ["PostgreSQL", "SQL", "Database Tuning"],
    rateOffer: "R$ 2,60/min",
    avgEst: "~15 min",
  },
];

export default function UnifiedDashboardPage() {
  const [role, setRole] = useState<"dev" | "mentor">("dev");
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      {/* Dedicated App Dashboard Header */}
      <DashboardHeader role={role} setRole={setRole} balance={50.0} />

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
                  Boas-vindas, Otávio! 👋
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
                  <div className="text-3xl font-extrabold text-white font-mono">R$ 50,00</div>
                  <p className="text-xs text-emerald-400 font-mono">~20 minutos de mentoria ao vivo</p>
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
                    Atendimentos Concluídos
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-extrabold text-white font-mono">12 Sessões</div>
                  <p className="text-xs text-slate-400 font-mono">Média de 14 min por chamado</p>
                </div>
                <p className="text-[11px] text-slate-500">100% dos bugs resolvidos com sucesso</p>
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
                <p className="text-[11px] text-slate-500">Fila reativa via Redis distribuído</p>
              </div>
            </div>

            {/* Recent Tickets Table Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    Histórico Recente de Atendimentos SOS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Consulte as sessões de pair programming realizadas e abra a sala de histórico.
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

              <div className="space-y-4">
                {RECENT_TICKETS.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          #{ticket.id}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{ticket.date}</span>
                        {ticket.stack.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                        {ticket.title}
                      </h4>

                      <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                        <span>Mentor: <strong className="text-slate-200">{ticket.mentor}</strong> ({ticket.mentorRole})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-white/10">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-white">{ticket.cost}</div>
                        <div className="text-[10px] text-slate-400">{ticket.duration} de sala</div>
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
                ))}
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

            {/* Mentor Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-2 bg-emerald-500/5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Ganhos Acumulados no Mês
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">R$ 1.840,00</div>
                <p className="text-xs text-slate-400">38 sessões atendidas com sucesso</p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Avaliação Média dos Devs
                </span>
                <div className="text-3xl font-extrabold text-white font-mono flex items-center gap-2">
                  4.98 <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-xs text-slate-400">100% de satisfação confirmada</p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Sua Taxa Padrão por Minuto
                </span>
                <div className="text-3xl font-extrabold text-indigo-400 font-mono">R$ 2,50/min</div>
                <p className="text-xs text-slate-400">Configurada na sua carteira de mentor</p>
              </div>
            </div>

            {/* Live Queue Feed Section */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Chamados Abertos na Fila em Tempo Real ({MENTOR_LIVE_QUEUE.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Notificações de chamados reativos via WebSocket. Clique em Aceitar para iniciar a sala colaborativa.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {MENTOR_LIVE_QUEUE.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition space-y-4 group shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                          #{item.id}
                        </span>
                        <span className="text-slate-400">• {item.timeAgo}</span>
                        <span className="text-slate-400">• Cliente: <strong className="text-white">{item.client}</strong></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="text-xs text-slate-400">Oferta: </span>
                          <span className="text-sm font-extrabold text-emerald-400">{item.rateOffer}</span>
                          <span className="text-[10px] text-slate-500 block">Duração est.: {item.avgEst}</span>
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
                        {item.stack.map((st) => (
                          <span
                            key={st}
                            className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold"
                          >
                            {st}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/room/${item.id}`}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg glow-success flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-white/20" />
                        Aceitar Chamado &amp; Entrar na Sala
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
