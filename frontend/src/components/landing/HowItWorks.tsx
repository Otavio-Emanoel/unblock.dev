import { HelpCircle, UserCheck, Video, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Abra o Chamado SOS",
    description: "Descreva brevemente seu bug, cole o stack trace e especifique as tecnologias envolvidas.",
    icon: HelpCircle,
  },
  {
    step: "02",
    title: "Match com Mentor Senior",
    description: "A fila reativa aceita seu chamado em segundos através de algoritmos de concorrência com Redis.",
    icon: UserCheck,
  },
  {
    step: "03",
    title: "Entre na Sala Colaborativa",
    description: "Compartilhe tela, ative a câmera e edite o código simultaneamente no Monaco Editor.",
    icon: Video,
  },
  {
    step: "04",
    title: "Bug Resolvido & Saldo Justo",
    description: "Encerre a sessão a qualquer momento. Você paga estritamente pelos minutos utilizados.",
    icon: CheckCircle,
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 relative bg-radial-gradient-sos">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Fluxo Descomplicado
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Como o Unblock.dev Funciona
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Quatro passos simples para passar de travado em um bug crítico para código funcionando em produção.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden"
              >
                <span className="text-4xl font-extrabold text-indigo-500/20 font-mono absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
