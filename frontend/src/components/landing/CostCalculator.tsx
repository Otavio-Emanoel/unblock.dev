"use client";

import { useState } from "react";
import { Calculator, DollarSign, TrendingDown } from "lucide-react";

const STACKS = [
  { name: "Go & Microserviços", rate: 2.80, avgMin: 15 },
  { name: "React & Next.js", rate: 2.20, avgMin: 12 },
  { name: "Docker & Kubernetes", rate: 3.00, avgMin: 18 },
  { name: "Python & Data / AI", rate: 2.50, avgMin: 14 },
  { name: "PostgreSQL & SQL Performance", rate: 2.60, avgMin: 15 },
];

export function CostCalculator() {
  const [selectedStackIndex, setSelectedStackIndex] = useState(0);
  const [minutes, setMinutes] = useState(15);

  const currentStack = STACKS[selectedStackIndex];
  const totalCost = (currentStack.rate * minutes).toFixed(2);
  const hoursSaved = (minutes * 0.25).toFixed(1);

  return (
    <section id="calculadora" className="py-20 relative bg-radial-gradient">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-3.5 h-3.5" /> Faturamento Transparente por Minuto
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Quanto custa desbloquear seu código?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Sem mensalidades ou assinaturas presas. Pague estritamente pelos minutos em que você estiver em chamada colaborativa com um mentor.
          </p>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
          {/* Stack Selection Pills */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              1. Selecione a Stack / Especialidade Técnica
            </label>
            <div className="flex flex-wrap gap-2">
              {STACKS.map((stack, idx) => (
                <button
                  key={stack.name}
                  onClick={() => {
                    setSelectedStackIndex(idx);
                    setMinutes(stack.avgMin);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition border ${
                    selectedStackIndex === idx
                      ? "bg-indigo-600 text-white border-indigo-500 glow-primary font-semibold"
                      : "bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  {stack.name}
                  <span className="ml-2 opacity-70 font-mono">R$ {stack.rate.toFixed(2)}/min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minutes Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <span>2. Estimativa de Duração da Sessão</span>
              <span className="text-indigo-400 font-mono text-base font-bold">
                {minutes} minutos
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5 min (SOS rápido)</span>
              <span>30 min (Code review / Refatoração)</span>
              <span>60 min (Deep Dive)</span>
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-2 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  <DollarSign className="w-4 h-4" /> Custo Total Estimado
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Débito por segundo
                </span>
              </div>
              <div className="text-4xl font-extrabold text-white font-mono">
                R$ {totalCost}
              </div>
              <p className="text-xs text-slate-400">
                Debitado progressivamente segundo a segundo (R$ {currentStack.rate.toFixed(2)}/min).
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 space-y-2 bg-indigo-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  <TrendingDown className="w-4 h-4" /> Economia de Tempo
                </div>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Produtividade
                </span>
              </div>
              <div className="text-4xl font-extrabold text-indigo-300 font-mono">
                ~{hoursSaved} horas
              </div>
              <p className="text-xs text-slate-400">
                Evite passar o final de semana travado em um rastro de pilha ou bug sutil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
