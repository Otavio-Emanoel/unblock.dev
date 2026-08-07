export default function MentorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel do Mentor</h1>
          <p className="text-slate-400 text-sm">Fila de chamados de pair programming em tempo real.</p>
        </div>
        <div className="flex items-center gap-3 glass-pill px-4 py-2 rounded-full border border-white/10">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-sm font-semibold text-emerald-400">Você está ONLINE</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          ⚡ Chamados Abertos na Fila (2)
        </h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300">
                Go / Redis
              </span>
              <h3 className="font-semibold text-white">Deadlock em worker pool assíncrono</h3>
              <p className="text-xs text-slate-400">Cliente: Lucas M. • Oferecendo R$ 2,50/min</p>
            </div>
            <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition">
              Aceitar Chamado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
