"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Menu, X, Terminal, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Como Funciona", href: "#como-funciona" },
  { name: "Casos Reais", href: "#casos-reais" },
  { name: "Funcionalidades", href: "#funcionalidades" },
  { name: "Planos", href: "#planos" },
  { name: "Calculadora", href: "#calculadora" },
  { name: "FAQ", href: "#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section tracker
      const sections = NAV_LINKS.map((link) => link.href.replace("#", "")).filter(Boolean);
      for (const s of sections.reverse()) {
        const el = document.getElementById(s);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(`#${s}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#090d16]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2"
            : "bg-transparent border-b border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand Logo with animated glow */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition duration-300">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                Unblock<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">.dev</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider hidden sm:block">
                PAIR PROGRAMMING ON-DEMAND
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition duration-200 relative ${
                    isActive
                      ? "text-white bg-white/10 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/mentor/dashboard"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition flex items-center gap-1.5 border border-emerald-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Seja Mentor
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              Entrar
            </Link>

            <Link
              href="/request"
              className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff4757] via-[#ff3838] to-[#ff4757] glow-sos shadow-lg transition duration-300 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-white/30" />
              <span>Pedir SOS Agora</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-b border-white/10 p-6 lg:hidden shadow-2xl space-y-5"
          >
            <nav className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
              <Link
                href="/mentor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Seja um Mentor Especialista
                </span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </nav>

            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-center text-xs font-semibold text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                Entrar
              </Link>
              <Link
                href="/request"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-[#ff4757] glow-sos shadow-lg flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white/20" />
                Pedir SOS
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
