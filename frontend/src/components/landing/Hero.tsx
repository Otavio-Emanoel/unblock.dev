"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Play, Clock, Terminal, CheckCircle2, Sparkles, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TECH_STACKS = [
  { name: "Go & Goroutines", icon: "🐹", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  { name: "Next.js 15 / React 19", icon: "⚛️", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
  { name: "Kubernetes & K8s", icon: "☸️", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { name: "Redis & Locks", icon: "⚡", bg: "bg-red-500/10 text-red-400 border-red-500/30" },
  { name: "Docker & Networking", icon: "🐳", bg: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
  { name: "TypeScript & AST", icon: "🔷", bg: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  { name: "PostgreSQL & Tuning", icon: "🐘", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { name: "Rust & Memory", icon: "🦀", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
];

const RECENT_RESOLUTIONS = [
  { dev: "#4192", issue: "Goroutine Deadlock em worker pool", time: "11 min", stack: "Go" },
  { dev: "#8023", issue: "Hydration Mismatch em Server Component", time: "7 min", stack: "Next.js" },
  { dev: "#1931", issue: "Redis Lock Concurrency Race Condition", time: "14 min", stack: "Redis" },
  { dev: "#5519", issue: "Kubernetes OOMKilled no cluster EKS", time: "18 min", stack: "K8s" },
  { dev: "#3284", issue: "Slow query de agregação com lock no Mongo", time: "9 min", stack: "MongoDB" },
];

export function Hero() {
  const [resolutionIndex, setResolutionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setResolutionIndex((prev) => (prev + 1) % RECENT_RESOLUTIONS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const currentResolution = RECENT_RESOLUTIONS[resolutionIndex];

  return (
    <section className="relative pt-24 pb-14 md:pt-32 md:pb-20 bg-grid-pattern bg-radial-gradient overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-[300px] h-[250px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 space-y-8 text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 text-indigo-300 border border-indigo-500/30 glow-primary backdrop-blur-xl shadow-lg transition duration-300 hover:scale-105">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-white/90">SOS On-Demand:</span>
          <span>Match com Mentores Especialistas em &lt; 90s</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Main Title with high impact typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          SOS para Desenvolvedores: <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-indigo-400 drop-shadow-sm">
            Desbloqueie Bugs em Tempo Real.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
          Chega de perder horas em bugs obscuros de concorrência ou infraestrutura.
          Conecte-se instantaneamente a mentores especialistas com sala imersiva:
          <strong className="text-white font-semibold"> Vídeo HD WebRTC</strong>,
          <strong className="text-white font-semibold"> Monaco Editor com CRDT</strong> e
          <strong className="text-emerald-400 font-semibold font-mono"> cobrança justa por minuto</strong>.
        </p>

        {/* Floating Stack Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2">
          {TECH_STACKS.map((tech) => (
            <div
              key={tech.name}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium border ${tech.bg} backdrop-blur-md transition duration-200 hover:scale-105 shadow-sm flex items-center gap-1.5 cursor-default`}
            >
              <span>{tech.icon}</span>
              <span>{tech.name}</span>
            </div>
          ))}
        </div>

        {/* Primary CTAs with Shimmer Effect */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/request"
            className="w-full sm:w-auto relative group overflow-hidden px-8 py-4 bg-gradient-to-r from-[#ff4757] via-[#ff3838] to-[#ff4757] text-white font-bold rounded-2xl glow-sos text-base transition duration-300 flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
          >
            <Zap className="w-5 h-5 fill-white/30" />
            <span>Pedir SOS Bug-Fix Agora</span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          </Link>

          <Link
            href="#demo-workspace"
            className="w-full sm:w-auto px-8 py-4 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 hover:border-white/20 rounded-2xl text-base font-semibold transition duration-200 flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
            <span>Testar Workspace Interativo</span>
          </Link>
        </div>

        {/* Live Resolved Activity Banner */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentResolution.dev}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-slate-300"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Dev {currentResolution.dev} resolveu:</span>
                <span className="text-white font-semibold">{currentResolution.issue}</span>
                <span className="text-emerald-400 font-bold">em {currentResolution.time}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Hacker CLI Telemetry Status Bar */}
        <div className="pt-4 max-w-3xl mx-auto">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-300 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Terminal className="w-4 h-4" />
              <span>&gt; RADAR STATUS: OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <strong className="text-white">38+</strong> Mentores Online
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-white">&lt; 45s</strong> Tempo de Match
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white">99.4%</strong> Taxa de Sucesso
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
