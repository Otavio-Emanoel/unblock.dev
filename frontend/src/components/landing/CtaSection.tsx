import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 relative px-6">
      <div className="max-w-5xl mx-auto glass-panel p-10 md:p-16 rounded-3xl border border-indigo-500/40 glow-primary text-center space-y-8 relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#090d16] shadow-2xl">
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/30">
            ⚡ Desbloqueio Imediato
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Pronto para destravar o seu código hoje?
          </h2>
          <p className="text-slate-300 text-sm md:text-base">
            Abra seu primeiro chamado em menos de 1 minuto e só pague pelos minutos exatos que utilizar com um mentor.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/request"
            className="w-full sm:w-auto px-8 py-4 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-2xl glow-sos text-base transition flex items-center justify-center gap-3 shadow-xl"
          >
            <Zap className="w-5 h-5 fill-white/20" />
            Abrir Chamado SOS Agora
          </Link>

          <Link
            href="/mentor/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 rounded-2xl text-base font-semibold transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Quero Atender como Mentor
          </Link>
        </div>
      </div>
    </section>
  );
}
