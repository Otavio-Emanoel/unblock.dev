"use client";

import { useState } from "react";
import { HelpCircle, UserCheck, Video, CheckCircle2, ArrowRight, Sparkles, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    badge: "Disparo do SOS",
    title: "Abra o Chamado SOS",
    description: "Descreva brevemente seu bug, cole o stack trace ou trecho de código e especifique as tecnologias envolvidas (Go, Next.js, K8s, etc).",
    icon: HelpCircle,
    color: "from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30",
    highlight: "Defina sua taxa máxima por minuto",
  },
  {
    step: "02",
    badge: "Match Instantâneo",
    title: "Match com Mentor Senior",
    description: "O algoritmo distribuído com Redis notifica mentores online qualificados. O primeiro a aceitar adquire o ticket exclusivamente.",
    icon: UserCheck,
    color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
    highlight: "Tempo médio de resposta < 45 segundos",
  },
  {
    step: "03",
    badge: "Colaboração Imersiva",
    title: "Entre na Sala Colaborativa",
    description: "Conecte-se com vídeo WebRTC HD, compartilhe a tela e depure o código lado a lado no Monaco Editor sincronizado via CRDTs.",
    icon: Video,
    color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    highlight: "Multi-arquivos, auto-save & P2P chat",
  },
  {
    step: "04",
    badge: "Liquidação Justa",
    title: "Bug Resolvido & Saldo Justo",
    description: "Ao finalizar a resolução, encerre a sessão. A cobrança cessa no segundo exato e o repasse ao mentor é liquidado com transações ACID.",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    highlight: "Pague estritamente os minutos usados",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="como-funciona" className="py-24 relative bg-radial-gradient-sos">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Fluxo Descomplicado em 4 Etapas
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Como o Unblock.dev Funciona
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminamos burocracias de agendamento ou assinaturas fechadas. Vá de travado a código rodando em produção em quatro passos objetivos.
          </p>
        </div>

        {/* Interactive Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isHovered = activeStep === idx;

            return (
              <div
                key={s.step}
                onMouseEnter={() => setActiveStep(idx)}
                className={`glass-card p-7 rounded-3xl border transition duration-300 space-y-6 relative overflow-hidden flex flex-col justify-between group shadow-xl cursor-default ${
                  isHovered
                    ? "border-indigo-500/50 glow-primary bg-gradient-to-b from-slate-900/90 to-indigo-950/20 scale-[1.02]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} border flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-extrabold font-mono text-white/40 group-hover:text-white transition">
                      {s.step}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
                      {s.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    ✓ {s.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
