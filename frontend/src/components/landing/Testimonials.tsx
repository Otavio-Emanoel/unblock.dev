"use client";

import { Star, Quote, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Matheus Silva",
    role: "Senior Go Developer",
    company: "Fintech Scale-up",
    avatar: "MS",
    stars: 5,
    stack: "Go / Concurrency",
    text: "Estava há 5 horas tentando debugar uma goroutine presa em um canal select. Em 14 minutos o mentor apontou o deadlock e me ensinou a usar context cancelation. Incomparável!",
    duration: "14 min de sessão",
    cost: "R$ 35,00",
  },
  {
    name: "Beatriz Lima",
    role: "Frontend Lead",
    company: "E-commerce SaaS",
    avatar: "BL",
    stars: 5,
    stack: "Next.js 15 / React 19",
    text: "O Unblock me salvou de atrasar a entrega da sprint. O erro de hydration e cookies assíncronos no App Router foi resolvido em 9 minutos com explicação cristalina.",
    duration: "9 min de sessão",
    cost: "R$ 22,50",
  },
  {
    name: "Rodrigo Mendes",
    role: "Staff Infrastructure Engineer",
    company: "Cloud Logistics",
    avatar: "RM",
    stars: 5,
    stack: "Kubernetes / Docker",
    text: "Muito melhor do que pagar mensalidades abusivas de consultorias. O mentor especialista em K8s ajustou a liveness probe e o GOMEMLIMIT do container em 18 minutos.",
    duration: "18 min de sessão",
    cost: "R$ 45,00",
  },
  {
    name: "Carolina Souza",
    role: "Fullstack Engineer",
    company: "HealthTech AI",
    avatar: "CS",
    stars: 5,
    stack: "Python / FastAPI / Mongo",
    text: "A experiência da sala ao vivo é sensacional. O editor sincroniza instantaneamente e a chamada WebRTC não teve nem 20ms de delay. Sensação de pair programming presencial.",
    duration: "11 min de sessão",
    cost: "R$ 27,50",
  },
  {
    name: "Lucas Alencar",
    role: "Backend Architect",
    company: "Streaming App",
    avatar: "LA",
    stars: 5,
    stack: "Redis 7.2 / Distributed",
    text: "O algoritmo de matchmaking do Unblock é rápido demais. Em 40 segundos já estava com o mentor na sala resolvendo o race condition de lock no Redis.",
    duration: "16 min de sessão",
    cost: "R$ 40,00",
  },
  {
    name: "Eduardo Faria",
    role: "Indie Hacker",
    company: "Bootstrap Founder",
    avatar: "EF",
    stars: 5,
    stack: "TypeScript / Node.js",
    text: "Para quem programa sozinho, ter um mentor sênior a um clique de distância por R$ 2,50 o minuto é a ferramenta mais valiosa que existe para não perder o foco.",
    duration: "8 min de sessão",
    cost: "R$ 20,00",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative bg-radial-gradient overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400" /> Wall of Love • 4.98/5.0 Avaliação Média
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Amado por Desenvolvedores que Valorizam seu Tempo
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Veja o que engenheiros de software, tech leads e fundadores dizem após destravar seus códigos no Unblock.dev.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="glass-card p-7 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group"
            >
              <div className="space-y-4">
                {/* Stars and Stack */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(review.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {review.stack}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Author & Telemetry footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      {review.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">{review.role} • {review.company}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] text-emerald-400 shrink-0">
                  <span className="block font-bold">{review.cost}</span>
                  <span className="text-slate-500">{review.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
