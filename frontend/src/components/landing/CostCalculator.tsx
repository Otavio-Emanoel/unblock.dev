"use client";

import { useState } from "react";
import { Calculator, DollarSign, TrendingDown, Sparkles, CheckCircle2, Zap, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

const STACKS = [
  { name: "Go & Goroutines / Concorrência", rate: 2.80, avgMin: 15, icon: "🐹" },
  { name: "React 19 & Next.js 15 App Router", rate: 2.20, avgMin: 12, icon: "⚛️" },
  { name: "Docker & Kubernetes Clusters", rate: 3.00, avgMin: 18, icon: "☸️" },
  { name: "Python, AI & Data Pipelines", rate: 2.50, avgMin: 14, icon: "🐍" },
  { name: "PostgreSQL & Query Tuning", rate: 2.60, avgMin: 15, icon: "🐘" },
  { name: "Rust & Systems Architecture", rate: 3.20, avgMin: 20, icon: "🦀" },
];

export function CostCalculator() {
  const [selectedStackIndex, setSelectedStackIndex] = useState(0);
  const [minutes, setMinutes] = useState(15);

  const currentStack = STACKS[selectedStackIndex];
  const totalCost = (currentStack.rate * minutes).toFixed(2);
  const hoursSaved = (minutes * 0.28).toFixed(1);

  // Traditional cost comparison (Senior Contractor ~R$ 160/hr or Lost Sprint Hours)
  const traditionalCost = (Number(hoursSaved) * 140).toFixed(2);
  const savings = Math.max(0, Number(traditionalCost) - Number(totalCost)).toFixed(2);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#10b981", "#ff4757", "#f59e0b"],
    });
  };

  return (
    <section id="calculadora" className="py-24 relative bg-radial-gradient">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-3.5 h-3.5" /> Faturamento Transparente por Minuto
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Quanto custa desbloquear seu código?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Sem mensalidades ou assinaturas presas. Pague estritamente pelos minutos em que você estiver em chamada colaborativa com um mentor especialista.
          </p>
        </div>

        {/* Interactive Calculator Box */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-8 shadow-2xl relative overflow-hidden">
          {/* Stack Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              1. Selecione a Stack / Domínio Técnico
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STACKS.map((stack, idx) => {
                const isSelected = selectedStackIndex === idx;
                return (
                  <button
                    key={stack.name}
                    onClick={() => {
                      setSelectedStackIndex(idx);
                      setMinutes(stack.avgMin);
                    }}
                    className={`p-3 rounded-2xl text-xs font-medium transition duration-200 border text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 glow-primary font-bold shadow-lg"
                        : "bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{stack.icon}</span>
                      <span className="truncate">{stack.name}</span>
                    </div>
                    <span className="font-mono text-[10px] opacity-80 shrink-0 ml-2">
                      R$ {stack.rate.toFixed(2)}/min
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutes Slider */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <span>2. Estimativa de Duração da Sessão</span>
              <span className="text-indigo-400 font-mono text-base font-bold bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                {minutes} minutos de mentoria
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5 min (SOS rápido)</span>
              <span>15 min (Média de resolução)</span>
              <span>30 min (Refatoração complexa)</span>
              <span>60 min (Deep Dive)</span>
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-white/10">
            {/* Output 1: Total Cost */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-2 bg-emerald-500/5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    <DollarSign className="w-4 h-4" /> Custo no Unblock
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Débito por segundo
                  </span>
                </div>
                <div className="text-4xl font-extrabold text-white font-mono">
                  R$ {totalCost}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Debitado segundo a segundo. Pausado imediatamente no encerramento da sala.
              </p>
            </div>

            {/* Output 2: Time Saved */}
            <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-2 bg-indigo-500/5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    <TrendingDown className="w-4 h-4" /> Tempo Poupado
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Produtividade
                  </span>
                </div>
                <div className="text-4xl font-extrabold text-indigo-300 font-mono">
                  ~{hoursSaved}h
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Evite passar o final de semana inteiro travado em um stack trace obscuro.
              </p>
            </div>

            {/* Output 3: Money Saved Comparison */}
            <div className="glass-card p-6 rounded-2xl border border-amber-500/30 space-y-2 bg-amber-500/5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    <Sparkles className="w-4 h-4" /> Economia Real
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    vs Consultoria
                  </span>
                </div>
                <div className="text-4xl font-extrabold text-amber-300 font-mono">
                  R$ {savings}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Economia comparada a horas perdidas de sprint ou contratação de consultorias.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleCelebrate}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2 cursor-pointer font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Clique para celebrar a economia 🚀
            </button>

            <Link
              href="/request"
              className="w-full sm:w-auto px-6 py-3 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 glow-sos"
            >
              <Zap className="w-3.5 h-3.5 fill-white/20" />
              <span>Abrir Chamado com Esta Estimativa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
