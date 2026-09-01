"use client";

import Link from "next/link";
import { Zap, Heart, Terminal, ShieldCheck, Activity, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070a12] text-slate-400 py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Brand & Status (2 cols) */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-xl text-white">
                Unblock<span className="text-indigo-400">.dev</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A plataforma de pair programming em tempo real no modelo SOS para desenvolvedores. Resolva bugs complexos com mentores seniores via WebRTC 4K, Monaco CRDT e faturamento por minuto.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] font-mono text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-300">Hub Status:</span>
              <strong className="text-emerald-400 font-semibold">100% Operacional</strong>
            </div>
          </div>

          {/* Col 2: Plataforma */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Plataforma</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="#como-funciona" className="hover:text-white transition">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#casos-reais" className="hover:text-white transition">
                  Casos Reais &amp; Diffs
                </Link>
              </li>
              <li>
                <Link href="#funcionalidades" className="hover:text-white transition">
                  Bento Grid de Recursos
                </Link>
              </li>
              <li>
                <Link href="#calculadora" className="hover:text-white transition">
                  Calculadora de Economia
                </Link>
              </li>
              <li>
                <Link href="#planos" className="hover:text-white transition">
                  Pacotes de Crédito
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Para Desenvolvedores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Para Desenvolvedores</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/request" className="hover:text-white transition flex items-center gap-1.5 text-red-400 font-medium">
                  <Zap className="w-3.5 h-3.5" /> Pedir SOS Agora
                </Link>
              </li>
              <li>
                <Link href="/mentor/dashboard" className="hover:text-white transition flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Seja um Mentor Senior
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-white transition">
                  Recarga de Carteira Pix
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Painel de Atendimentos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Desenvolvido por & Comunidade */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Desenvolvido por</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="https://github.com/Otavio-Emanoel" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-indigo-400 font-mono">&gt;</span> Otavio Emanoel
                </Link>
              </li>
              <li>
                <Link href="https://github.com/RaulGaldino" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-indigo-400 font-mono">&gt;</span> Raul Galdino
                </Link>
              </li>
              <li>
                <Link href="https://github.com/PedroAugusto0" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="text-indigo-400 font-mono">&gt;</span> Pedro Augusto
                </Link>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://github.com/Otavio-Emanoel/unblock.dev"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Repository"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition text-slate-400"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} Unblock.dev. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Go 1.24</span>
            <span>•</span>
            <span>Next.js 15</span>
            <span>•</span>
            <span>LiveKit SFU</span>
            <span>•</span>
            <span>Redis 7.2</span>
            <span>•</span>
            <span>MongoDB 7.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
