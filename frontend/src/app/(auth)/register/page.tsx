"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, ShieldCheck, Code2 } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [role, setRole] = useState<"client" | "mentor">("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !email || !password) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        role: role === "mentor" ? "mentor" : "client",
        bio: role === "mentor" ? "Mentor Especialista em Pair Programming" : undefined,
        minute_rate_cents: role === "mentor" ? 350 : undefined,
        skills: role === "mentor" ? ["Go", "React", "Docker", "SQL"] : undefined,
      });

      setAuth(res.user, res.token);

      if (res.user.role === "mentor") {
        router.push("/mentor/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao criar conta.");
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
          &larr; Voltar para a Landing Page
        </Link>
      </header>

      {/* Main Content Layout */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Benefits & Role Explanation (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-success backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cadastro Gratuito de Conta</span>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Junte-se à maior comunidade de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-indigo-500">
                Pair Programming ao Vivo.
              </span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Crie sua conta para desfrutar de atendimento imediato em bugs complexos ou faturar atendendo desenvolvedores como mentor especialista.
            </p>
          </div>

          {/* Role Benefit Cards */}
          <div className="space-y-4">
            <div className={`glass-card p-5 rounded-2xl border transition ${role === 'client' ? 'border-indigo-500/60 bg-indigo-950/20' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Perfil Desenvolvedor</h4>
                  <p className="text-xs text-slate-400">Abra chamados SOS, pague por minuto e resolva bugs com ajuda ao vivo.</p>
                </div>
              </div>
            </div>

            <div className={`glass-card p-5 rounded-2xl border transition ${role === 'mentor' ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Perfil Mentor Senior</h4>
                  <p className="text-xs text-slate-400">Receba notificações de chamados na sua stack e seja pago por minuto de mentoria.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form Card (7 cols on lg) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-3xl border border-white/10 space-y-6 shadow-2xl shadow-indigo-500/10 relative">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Novo Registro
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Criar sua Conta
              </h2>
              <p className="text-xs text-slate-400">
                Escolha seu objetivo na plataforma e preencha os dados abaixo.
              </p>
            </div>

            {/* Animated Role Switcher */}
            <div className="relative p-1 bg-slate-900/90 rounded-2xl border border-white/10 flex items-center shadow-inner overflow-hidden">
              {/* Sliding Pill Indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-lg ${
                  role === "client"
                    ? "left-1 bg-indigo-600 border border-indigo-400/40 glow-primary"
                    : "left-[calc(50%+2px)] bg-emerald-600 border border-emerald-400/40 glow-success"
                }`}
              />

              <button
                type="button"
                onClick={() => setRole("client")}
                className={`relative z-10 flex-1 py-2.5 px-3 rounded-xl text-xs transition-colors duration-300 flex items-center justify-center gap-2 ${
                  role === "client" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-4 h-4" />
                Sou Desenvolvedor
              </button>

              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`relative z-10 flex-1 py-2.5 px-3 rounded-xl text-xs transition-colors duration-300 flex items-center justify-center gap-2 ${
                  role === "mentor" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Quero ser Mentor
              </button>
            </div>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={() => router.push(role === "mentor" ? "/mentor/dashboard" : "/dashboard")}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-3 transition group shadow-md"
            >
              <GithubIcon className="w-4 h-4 text-slate-300 group-hover:text-white" />
              Cadastrar com GitHub
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#090d16] px-3 text-[11px] text-slate-500 font-mono uppercase tracking-wider relative z-10">
                ou com e-mail
              </span>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-white/10 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-600 outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">
                  E-mail Profissional
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
                <label className="block text-xs font-semibold text-slate-300 font-mono">
                  Senha Secreta
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
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
                className={`w-full py-3.5 px-4 font-bold rounded-xl text-xs transition text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
                  role === "mentor"
                    ? "bg-emerald-600 hover:bg-emerald-500 glow-success"
                    : "bg-indigo-600 hover:bg-indigo-500 glow-primary"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  <>
                    Criar Conta {role === "mentor" ? "de Mentor" : "de Desenvolvedor"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Login Link */}
            <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
              Já possui uma conta no Unblock.dev?{" "}
              <Link href="/login" className="text-indigo-400 font-bold hover:underline">
                Faça Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 p-6 text-center text-[11px] text-slate-600 font-mono">
        Unblock.dev &copy; 2026 — Pair Programming & SOS Bug-Fixing Sob Demanda.
      </footer>
    </div>
  );
}
