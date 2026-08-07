"use client";

import Link from "next/link";
import { Zap, Code2, ShieldCheck, User } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-lg shadow-indigo-500/10">
            <Zap className="w-5 h-5 fill-indigo-400/20 group-hover:fill-white/20" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Unblock<span className="text-indigo-400">.dev</span>
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/30 font-semibold">
            SOS Live
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#como-funciona" className="hover:text-white transition">
            Como Funciona
          </Link>
          <Link href="#funcionalidades" className="hover:text-white transition">
            Funcionalidades
          </Link>
          <Link href="#calculadora" className="hover:text-white transition">
            Estimativa de Custos
          </Link>
          <Link href="/mentor/dashboard" className="hover:text-white transition flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Seja um Mentor
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Entrar
          </Link>

          <Link
            href="/request"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#ff4757] hover:bg-[#ff4757]/90 rounded-xl glow-sos transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Pedir SOS Agora
          </Link>
        </div>
      </div>
    </header>
  );
}
