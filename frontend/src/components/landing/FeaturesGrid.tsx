"use client";

import { Zap, Code, Video, DollarSign, ShieldCheck, Lock, Activity, Cpu, Radio, Sparkles, Layers, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="py-24 relative bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-3.5 h-3.5" /> Arquitetura de Engenharia de Alta Performance
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Engenharia Projetada para Resolução Rápida
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Uma suíte completa de ferramentas em tempo real para conectar mentes brilhantes, sincronizar código atomicamente e solucionar incidentes críticos.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 (Span 2 cols): Redis Distributed Matchmaking */}
          <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between space-y-6 group shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-indigo-950/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Redis SETNX Lock
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition">
                Matchmaking Instantâneo sem Race Conditions
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Dispare um SOS e seja atendido em menos de 90 segundos. A nossa camada distribuída com Redis garante que exatamente um mentor especialista capture o chamado com trava atômica, mesmo sob tráfego concorrente intenso.
              </p>
            </div>

            {/* Micro visualizer widget */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-[11px] text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-white/5">
                <span>[Redis Match Pipeline]</span>
                <span className="text-emerald-400 font-bold">Latency: 1.4ms</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  ✓ SETNX lock:ticket:8492 OK
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  Broadcast WebSocket → Mentor Alex S.
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: LiveKit WebRTC 4K Media */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-purple-500/40 transition duration-300 flex flex-col justify-between space-y-6 group shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-purple-950/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  LiveKit SFU
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                WebRTC HD &amp; Screen Share
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Áudio cristalino, vídeo em altíssima definição e compartilhamento de tela com adaptação dinâmica de banda (dynacast). Câmera e microfone iniciam desativados por padrão para total privacidade.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between font-mono text-xs">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Radio className="w-3.5 h-3.5 animate-pulse text-purple-400" /> Ping: 24ms
              </span>
              <span className="text-slate-400">Opus 48kHz HD</span>
            </div>
          </div>

          {/* Bento Card 3: Go TickerEngine */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition duration-300 flex flex-col justify-between space-y-6 group shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-emerald-950/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Go TickerEngine
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                Faturamento Otimista por Minuto
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sem assinaturas mensais caras. O saldo é debitado segundo a segundo a uma taxa fixa transparente. Ao encerrar a chamada, o débito cessa imediatamente no milissegundo.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-400 font-bold">R$ 2,50/min</span>
              <span className="text-slate-400 text-[10px]">100% Granular por Minuto</span>
            </div>
          </div>

          {/* Bento Card 4 (Span 2 cols): Monaco + Yjs CRDTs */}
          <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between space-y-6 group shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-indigo-950/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <Code className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Monaco Engine + Yjs CRDTs
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition">
                Editor Monaco Colaborativo Multi-Arquivo
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                A mesma experiência do VS Code com suporte nativo a múltiplos arquivos, atalhos de teclado (Ctrl+S, Ctrl+Z, Ctrl+Y), auto-salvamento na nuvem e cursores simultâneos sem conflito de merge.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Auto-Save na Nuvem (Debounce 1s)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Ctrl+S Salvar</span>
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">Ctrl+Z Desfazer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
