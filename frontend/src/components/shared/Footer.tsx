import Link from "next/link";
import { Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070a12] text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                Unblock<span className="text-indigo-400">.dev</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma de pair programming sob demanda (&quot;SOS para Desenvolvedores&quot;) para resolver bugs complexos em tempo real com cobrança por minuto.
            </p>
          </div>

          {/* Col 2: Produto */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#como-funciona" className="hover:text-white transition">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#calculadora" className="hover:text-white transition">
                  Calculadora de Custos
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-white transition">
                  Abrir Chamado SOS
                </Link>
              </li>
              <li>
                <Link href="/mentor/dashboard" className="hover:text-white transition">
                  Fila de Mentores
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Desenvolvido por */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Desenvolvido por</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="https://github.com/Otavio-Emanoel" className="hover:text-white transition">
                  Otavio Emanoel
                </Link>
              </li>
              <li>
                <Link href="https://github.com/RaulGaldino" className="hover:text-white transition">
                  Raul Galdino
                </Link>
              </li>
              <li>
                <Link href="https://github.com/PedroAugusto0" className="hover:text-white transition">
                  Pedro Augusto
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Suporte e Contato */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Comunidade</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Otavio-Emanoel"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition text-slate-400"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition text-slate-400"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Atendimento 24/7 para mentores e desenvolvedores.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Unblock.dev. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Construído para devs com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
