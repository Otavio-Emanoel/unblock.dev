"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#090d16]/80 backdrop-blur-md border-b border-white/10 shadow-2xl py-0"
          : "bg-transparent border-b border-transparent py-1"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-lg shadow-indigo-500/10">
            <Zap className="w-5 h-5 fill-indigo-400/20 group-hover:fill-white/20" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Unblock<span className="text-indigo-400">.dev</span>
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
          <Link href="#planos" className="hover:text-white transition">
            Planos
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
