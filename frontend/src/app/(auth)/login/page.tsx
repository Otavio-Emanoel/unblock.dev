"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Code, Sparkles, AlertCircle } from "lucide-react";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha o e-mail e a senha.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Por favor, insira um e-mail válido (exemplo: usuario@dominio.com).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.login(email.trim(), password);
      setAuth(res.user, res.token);
      if (res.user.role === "mentor") {
        router.push("/mentor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col justify-between relative overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Background Interactive Particles */}
      <ParticleBackground />

      {/* Top Header */}
      <header className="relative z-10 p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-lg shadow-indigo-500/10">
            <Zap className="w-5 h-5 fill-indigo-400/20 group-hover:fill-white/20" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Unblock<span className="text-indigo-400">.dev</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 glass-pill"
        >
          &larr; Voltar para a tela inicial
        </Link>
      </header>

      {/* Main Content: Split Screen Desktop Layout */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Product Showcase & Brand Value (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 glow-primary backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ambiente Colaborativo de Pair Programming</span>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Desbloqueie seus bugs com <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500">
                Mentores ao Vivo em Tempo Real.
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Acesse sua conta para disparar chamados SOS instantâneos, paredar em salas imersivas com WebRTC 4K e editor Monaco CRDT sem conflitos.
            </p>
          </div>

          {/* Mini Workspace Showcase Preview Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-2 text-indigo-400">
                <Code className="w-4 h-4" /> main.go (Pairing Active)
              </span>
              <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Ao Vivo
              </span>
            </div>

            <div className="space-y-1 text-slate-300 text-[11px]">
              <p><span className="text-purple-400">func</span> <span className="text-blue-400">SolveDeadlock</span>() &#123;</p>
              <p className="pl-4 bg-indigo-500/10 border-l-2 border-indigo-500 py-0.5 rounded-r">
                mu.<span className="text-blue-400">Lock</span>() <span className="text-slate-500">&#47;&#47; Mentoria ativa</span>
                <span className="ml-2 px-1.5 py-0.2 rounded bg-indigo-600 text-[9px] text-white font-sans">
                  Cursor: Alex (Mentor)
                </span>
              </p>
              <p>&#125;</p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-sans border-t border-white/5">
              <span>Match em &lt; 90 segundos</span>
              <span className="text-emerald-400 font-mono font-bold">R$ 2,50/min</span>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sem assinaturas presas — pague estritamente pelos minutos utilizados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Conexões WebRTC HD criptografadas com editor Monaco sincronizado</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card (7 cols on lg, centered) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl border border-white/10 space-y-6 shadow-2xl shadow-indigo-500/10 relative">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Autenticação Segura
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Boas-vindas de volta
              </h2>
              <p className="text-xs text-slate-400">
                Digite suas credenciais para acessar sua área de desenvolvedor ou mentor.
              </p>
            </div>

            {/* Social OAuth Button */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-3 transition group shadow-md"
            >
              <GithubIcon className="w-4 h-4 text-slate-300 group-hover:text-white" />
              Continuar com GitHub
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#090d16] px-3 text-[11px] text-slate-500 font-mono uppercase tracking-wider relative z-10">
                ou e-mail
              </span>
            </div>

            {/* Error Feedback Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2.5 animate-fade-in shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">
                  E-mail do Desenvolvedor
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@unblock.dev"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 font-mono">
                    Senha
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Link de redefinição enviado para seu e-mail.");
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-900/80 border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition glow-primary flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </span>
                ) : (
                  <>
                    Entrar na Minha Conta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Sign Up Link */}
            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Não tem uma conta no Unblock.dev?{" "}
              <Link href="/register" className="text-indigo-400 font-bold hover:underline">
                Cadastre-se gratuitamente
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Legal Footer */}
      <footer className="relative z-10 p-6 text-center text-[11px] text-slate-600 font-mono">
        Unblock.dev &copy; 2026 — Pair Programming & SOS Bug-Fixing Sob Demanda.
      </footer>
    </div>
  );
}
