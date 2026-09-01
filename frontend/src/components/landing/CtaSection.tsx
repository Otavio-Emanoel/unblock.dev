"use client";

import Link from "next/link";
import { Zap, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="py-24 relative px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto glass-panel p-10 sm:p-14 md:p-16 rounded-3xl border border-indigo-500/40 glow-primary text-center space-y-8 relative overflow-hidden bg-gradient-to-b from-[#0f172a] via-slate-900 to-[#090d16] shadow-2xl">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="space-y-4 max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/30 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-[#ff4757]" /> Desbloqueio Imediato On-Demand
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Pronto para destravar o seu código hoje?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Abra seu primeiro chamado em menos de 1 minuto. Sem mensalidades ou contratos presos — você só paga estritamente pelos minutos que utilizar com um mentor.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
          <Link
            href="/request"
            className="w-full sm:w-auto relative group overflow-hidden px-8 py-4 bg-gradient-to-r from-[#ff4757] via-[#ff3838] to-[#ff4757] hover:scale-105 text-white font-bold rounded-2xl glow-sos text-base transition duration-300 flex items-center justify-center gap-3 shadow-2xl active:scale-95"
          >
            <Zap className="w-5 h-5 fill-white/20" />
            <span>Abrir Chamado SOS Agora</span>
            <ArrowRight className="w-4 h-4" />
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          </Link>

          <Link
            href="/mentor/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl text-base font-semibold transition duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Quero Atender como Mentor</span>
          </Link>
        </div>

        {/* Feature Pills Footer */}
        <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400 relative z-10">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Match em &lt; 90s
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sem compromisso mensal
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reembolso garantido
          </span>
        </div>
      </div>
    </section>
  );
}
