import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Novo Cadastro
          </div>
          <h1 className="text-2xl font-bold text-white">Criar sua Conta</h1>
          <p className="text-slate-400 text-sm">Escolha como deseja utilizar o Unblock.dev</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 rounded-xl bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 font-medium text-center hover:bg-indigo-600/30 transition">
            Sou Desenvolvedor
          </button>
          <button className="p-4 rounded-xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-200 font-medium text-center hover:bg-emerald-600/30 transition">
            Quero ser Mentor
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}
