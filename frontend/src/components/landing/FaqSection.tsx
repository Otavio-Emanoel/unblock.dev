"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Zap, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Como funciona a cobrança por minuto?",
    a: "Diferente de consultorias com mensalidades fixas ou valores mínimos abusivos, o Unblock.dev cobra estritamente pelos minutos que você passa na sala colaborativa com o mentor. O débito é calculado segundo a segundo pela nossa TickerEngine em Go. Ao clicar em 'Encerrar Sessão', a cobrança cessa imediatamente no mesmo milissegundo.",
  },
  {
    q: "Minha câmera e microfone precisam ficar ligados obrigatoriamente?",
    a: "Não! Por padrão de segurança e privacidade, toda chamada no Unblock.dev inicia com áudio e vídeo desativados. Você pode optar por ligar apenas o microfone, usar apenas o chat P2P criptografado com o editor Monaco sincronizado, ou ligar a câmera em HD quando preferir.",
  },
  {
    q: "E se o mentor não conseguir resolver o meu bug?",
    a: "Nossa meta é 100% de satisfação. Se um chamado não puder ser resolvido pelo mentor por incompatibilidade técnica de ambiente ou escopo inviável, o suporte realiza a revisão da sessão e o saldo é integralmente reembolsado na sua carteira digital.",
  },
  {
    q: "Como os mentores especialistas são selecionados e avaliados?",
    a: "Nossos mentores passam por validação técnica rigorosa de senioridade e domínio nas stacks que lecionam (Go, Kubernetes, Next.js, Redis, etc). Além disso, cada sessão conta com avaliação por estrelas (1 a 5) realizada pelo desenvolvedor, mantendo no radar apenas profissionais com nota média superior a 4.8.",
  },
  {
    q: "Posso salvar ou exportar o código alterado durante a mentoria?",
    a: "Sim! O editor Monaco possui salvamento automático na nuvem com debounce de 1s e histórico completo de Ctrl+Z/Ctrl+Y. Ao final da chamada, você pode continuar acessando os arquivos e notas de mentoria diretamente pelo seu painel.",
  },
  {
    q: "Como funcionam as recargas de saldo via Pix e Cartão?",
    a: "Você escolhe um pacote de créditos (Starter, Pro ou Senior) e efetua o pagamento via Pix instantâneo ou Cartão de Crédito. Os créditos caem na sua conta em menos de 5 segundos e nunca expiram.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative bg-[#090d16]">
      <div className="max-w-4xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Tudo o que você precisa saber sobre o funcionamento da sala, segurança, faturamento e mentores.
          </p>
        </div>

        {/* Accordion List with Framer Motion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.q}
                className={`glass-card rounded-2xl border transition duration-200 overflow-hidden ${
                  isOpen
                    ? "border-indigo-500/40 bg-slate-900/90 shadow-lg shadow-indigo-500/10"
                    : "border-white/10 hover:border-white/20 bg-slate-900/40"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base font-bold text-white flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-indigo-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
