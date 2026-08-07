export default function RequestSOSPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Criar Chamado SOS Bug-Fix</h1>
        <p className="text-slate-400 text-sm">Especifique o desafio técnico para ser pareado instantaneamente com um mentor.</p>
      </div>

      <form className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Título do Problema</label>
          <input
            type="text"
            placeholder="Ex: Erro de deadlock em Goroutines e Redis lock"
            className="w-full p-3 bg-slate-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tecnologias / Stack</label>
          <input
            type="text"
            placeholder="Ex: Go, Docker, Redis, Next.js"
            className="w-full p-3 bg-slate-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Descrição do Bug</label>
          <textarea
            rows={4}
            placeholder="Descreva o comportamento esperado vs atual e cole eventuais mensagens de erro..."
            className="w-full p-3 bg-slate-900/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-semibold rounded-xl glow-sos transition"
        >
          Disparar SOS para a Fila de Mentores
        </button>
      </form>
    </div>
  );
}
