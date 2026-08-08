import { Zap, Code, Video, DollarSign } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Atendimento Instantâneo On-Demand",
    description: "Abra um chamado de SOS especificando sua stack e receba atendimento de mentores qualificados em menos de 2 minutos com match via Redis.",
    badge: "Match via WebSocket",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  {
    icon: Code,
    title: "Editor Monaco Colaborativo (CRDT)",
    description: "A mesma engine do VS Code com sincronização atômica em tempo real via Yjs. Digitem no mesmo arquivo simultaneamente com zero conflitos.",
    badge: "Yjs + Monaco",
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    icon: Video,
    title: "Videoconferência HD e Screen Share",
    description: "Infraestrutura WebRTC SFU via LiveKit com baixíssima latência para áudio cristalino, vídeo HD e compartilhamento de tela.",
    badge: "LiveKit SFU",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    icon: DollarSign,
    title: "Faturamento Otimista por Minuto",
    description: "Sem mensalidades presas. O saldo é debitado segundo a segundo a uma taxa fixa transparente. Ao encerrar a chamada, o saldo é pausado.",
    badge: "TickerEngine Go",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

export function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Arquitetura de Alta Performance
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            Engenharia Projetada para Resolução Rápida
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Tudo o que você precisa para depurar erros de concorrência, problemas de infraestrutura ou bugs de código em uma única sala colaborativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card p-6 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition duration-300 space-y-4 flex flex-col justify-between group shadow-xl hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
