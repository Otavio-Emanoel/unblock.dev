"use client";

import Link from "next/link";
import { Check, Zap, Sparkles, Clock, CreditCard, ShieldCheck, ArrowRight, Star } from "lucide-react";
import confetti from "canvas-confetti";

const PLANS = [
  {
    name: "Pacote Starter",
    price: "R$ 30",
    minutes: "~12 minutos de mentoria ao vivo",
    description: "Ideal para resolver syntax errors, build failures rápidos ou tirar dúvidas pontuais de código.",
    popular: false,
    badge: "Iniciante",
    features: [
      "Match com mentores especialistas",
      "Sala de vídeo HD & Screen Share (LiveKit)",
      "Monaco Editor colaborativo via CRDT (Yjs)",
      "Faturamento transparente debitado por segundo",
      "Histórico de sessões e código salvo",
    ],
    ctaText: "Recarregar R$ 30",
    ctaHref: "/wallet",
  },
  {
    name: "Pacote Pro",
    price: "R$ 60",
    minutes: "~24 minutos de mentoria ao vivo",
    description: "O mais escolhido para bugs complexos de concorrência, Redis locks, refatoração e APIs.",
    popular: true,
    badge: "Mais Escolhido",
    features: [
      "Prioridade alta na fila de matchmaking",
      "Match com mentores Seniores em < 60 segundos",
      "Sala de vídeo 4K & Screen Share de baixa latência",
      "Monaco Editor multi-arquivo + Terminal integrado",
      "Recargas via Pix com aprovação instantânea",
      "Exportação de snippets e anotações da sessão",
    ],
    ctaText: "Recarregar R$ 60",
    ctaHref: "/wallet",
  },
  {
    name: "Pacote Senior",
    price: "R$ 150",
    minutes: "~60 minutos de mentoria ao vivo",
    description: "Para arquiteturas complexas, tuning de performance SQL, Kubernetes, Go microserviços e deep dives.",
    popular: false,
    badge: "Deep Dive",
    features: [
      "Atendimento por mentores especialistas Tier-1",
      "Prioridade máxima instantânea na fila SOS",
      "Sessões estendidas de pairing e arquitetura",
      "Suporte dedicado e histórico consolidado",
      "Saldo cumulativo perpétuo que nunca expira",
    ],
    ctaText: "Recarregar R$ 150",
    ctaHref: "/wallet",
  },
];

export function PricingPlans() {
  const triggerConfetti = (planName: string) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#6366f1", "#10b981", "#ff4757", "#ec4899"],
    });
  };

  return (
    <section id="planos" className="py-24 relative bg-[#090d16]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-3.5 h-3.5" /> Sem Mensalidade • Saldo Justo por Minuto
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Pacotes de Créditos Flexíveis
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Recarregue sua carteira via Pix instantâneo ou Cartão. Os créditos nunca expiram e são debitados estritamente enquanto você estiver na sala ao vivo.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 shadow-2xl ${
                plan.popular
                  ? "border-indigo-500/80 glow-primary bg-gradient-to-b from-indigo-950/30 via-slate-900/90 to-[#0f172a] scale-105 z-20"
                  : "border-white/10 hover:border-indigo-500/40 hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-xl flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {plan.name}
                    </h3>
                    {!plan.popular && (
                      <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-mono">/ recarga Pix</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono pt-1">
                    <Clock className="w-3.5 h-3.5 shrink-0" /> {plan.minutes}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono block">
                    O que está incluso:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.ctaHref}
                  onClick={() => triggerConfetti(plan.name)}
                  className={`w-full py-4 px-4 rounded-2xl font-bold text-xs transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white glow-primary hover:scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Trust Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-around gap-4 text-xs font-mono text-slate-400 text-center">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Transações ACID com Ledger Imutável
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            Créditos nunca expiram
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Garantia de Satisfação ou Reembolso
          </span>
        </div>
      </div>
    </section>
  );
}
