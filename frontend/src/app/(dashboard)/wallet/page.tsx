export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Carteira & Saldo de Minutos</h1>
        <p className="text-slate-400 text-sm">Adicione créditos via Pix ou Cartão para utilizar em sessões de pair programming.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 text-center">
          <h3 className="text-slate-300 font-medium">Pacote Inicial</h3>
          <p className="text-3xl font-extrabold text-white">R$ 30,00</p>
          <p className="text-xs text-slate-400">~12 minutos de sessão</p>
          <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition">
            Recarregar Pix
          </button>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-indigo-500/40 glow-primary space-y-4 text-center relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
            Mais Popular
          </span>
          <h3 className="text-slate-300 font-medium">Pacote Pro</h3>
          <p className="text-3xl font-extrabold text-white">R$ 60,00</p>
          <p className="text-xs text-slate-400">~24 minutos de sessão</p>
          <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition">
            Recarregar Pix
          </button>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 text-center">
          <h3 className="text-slate-300 font-medium">Pacote Senior</h3>
          <p className="text-3xl font-extrabold text-white">R$ 150,00</p>
          <p className="text-xs text-slate-400">~60 minutos de sessão</p>
          <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition">
            Recarregar Pix
          </button>
        </div>
      </div>
    </div>
  );
}
