import Link from "next/link";
import { Zap, Play, Clock, Terminal, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-grid-pattern bg-radial-gradient overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-8 text-center relative z-10">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 glow-primary backdrop-blur-md animate-pulse-slow">
          <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
          <span>Atendimento Imediato On-Demand (Match em &lt; 2 min)</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          SOS para Desenvolvedores: <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500">
            Desbloqueie Bugs em Tempo Real
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Conecte-se instantaneamente a mentores especialistas com sala imersiva: Vídeo HD, Editor Monaco simultâneo via CRDTs e cobrança justa por minuto.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/request"
            className="w-full sm:w-auto px-8 py-4 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-2xl glow-sos text-base transition flex items-center justify-center gap-3 shadow-xl"
          >
            <Zap className="w-5 h-5 fill-white/20" />
            Pedir SOS Bug-Fix Agora
          </Link>

          <Link
            href="#como-funciona"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-base font-semibold transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            Ver Como Funciona
          </Link>
        </div>

        {/* Hacker CLI Telemetry Status Bar */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="glass-panel p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-300 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Terminal className="w-4 h-4" />
              <span>&gt; SYSTEM STATUS: READY</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <strong className="text-white">34+</strong> Mentores Online
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-white">&lt; 1.8 min</strong> Match
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">98%</strong> Resolução
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
