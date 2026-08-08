import Link from "next/link";
import { Check, Zap, Sparkles, Clock, CreditCard } from "lucide-react";

const PLANS = [
  {
    name: "Pacote Starter",
    price: "R$ 30",
    minutes: "~12 minutos de mentoria ao vivo",
    description: "Ideal para resolver syntax errors, build failures ou tirar dúvidas pontuais de código.",
    popular: false,
    badge: "Iniciante",
    features: [
      "Match com mentores especialistas",
      "Sala de vídeo HD & Screen Share (LiveKit)",
      "Monaco Editor colaborativo via CRDT (Yjs)",
      "Faturamento transparente debitado por segundo",
      "Histórico de atendimento",
    ],
    ctaText: "Recarregar R$ 30",
    ctaHref: "/wallet",
  },
  {
    name: "Pacote Pro",
    price: "R$ 60",
    minutes: "~24 minutos de mentoria ao vivo",
    description: "O mais escolhido para bugs complexos de concorrência, Redis locks e refatoração.",
    popular: true,
    badge: "Mais Popular",
    features: [
      "Prioridade na fila de matchmaking",
      "Match com mentores Seniores em < 90 segundos",
      "Sala de vídeo HD & Screen Share em 4K",
      "Monaco Editor + Terminal de logs integrado",
      "Recargas via Pix com aprovação instantânea",
      "Exportação de código e snippets da sessão",
    ],
    ctaText: "Recarregar R$ 60",
    ctaHref: "/wallet",
  },
  {
    name: "Pacote Senior",
    price: "R$ 150",
    minutes: "~60 minutos de mentoria ao vivo",
    description: "Para arquiteturas complexas, tuning de performance SQL, Kubernetes e microserviços.",
    popular: false,
    badge: "Deep Dive",
    features: [
      "Atendimento por mentores especialistas Tier-1",
      "Prioridade máxima na fila de chamados SOS",
      "Sessões estendidas de pairing e arquitetura",
      "Suporte dedicado e histórico consolidado",
      "Recarga acumulativa de minutos sem expiração",
    ],
    ctaText: "Recarregar R$ 150",
    ctaHref: "/wallet",
  },
];

export function PricingPlans() {
  return (
    <section id="planos" className="py-20 relative bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-3.5 h-3.5" /> Sem Mensalidade • Pague Apenas os Minutos Utilizados
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Pacotes de Créditos Flexíveis
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Recarregue sua carteira via Pix ou Cartão. Seu saldo é debitado exclusivamente enquanto a chamada estiver ativa na sala de pair programming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-3xl border flex flex-col justify-between relative transition duration-300 ${
                plan.popular
                  ? "border-indigo-500/60 glow-primary bg-gradient-to-b from-indigo-950/20 to-[#0f172a]"
                  : "border-white/10 hover:border-indigo-500/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white font-mono">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-mono">/ recarga</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {plan.minutes}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
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
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg glow-primary"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {plan.ctaText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
