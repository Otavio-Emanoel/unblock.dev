import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Unblock.dev Auth
          </div>
          <h1 className="text-2xl font-bold text-white">Entrar na Plataforma</h1>
          <p className="text-slate-400 text-sm">Acesse sua conta para pedir SOS ou atender chamados</p>
        </div>
        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition">
            Entrar com GitHub
          </button>
          <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition">
            Continuar com E-mail
          </button>
        </div>
        <p className="text-center text-xs text-slate-500">
          Não possui uma conta?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
