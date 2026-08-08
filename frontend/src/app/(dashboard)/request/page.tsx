"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Zap, Send } from "lucide-react";

export default function RequestSOSPage() {
  const router = useRouter();
  const [role, setRole] = useState<"dev" | "mentor">("dev");
  const [title, setTitle] = useState("");
  const [stack, setStack] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/room/sos-8941");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      <DashboardHeader role={role} setRole={setRole} balance={50.0} />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/30">
            <Zap className="w-3.5 h-3.5 fill-current" /> SOS Bug-Fixing ao Vivo
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">
            Criar Chamado SOS
          </h1>
          <p className="text-slate-400 text-sm">
            Especifique o desafio técnico para ser pareado instantaneamente com um mentor especialista.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Título do Problema / Erro
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Erro de deadlock em Goroutines e Redis lock"
              className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Tecnologias / Stack Envolvidas
            </label>
            <input
              type="text"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="Ex: Go, Docker, Redis, Next.js"
              className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 font-mono">
              Descrição do Bug &amp; Stack Trace
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o comportamento esperado vs atual e cole logs/códigos relevantes..."
              className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-2xl glow-sos text-xs transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Disparando SOS para a Fila de Mentores...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Disparar SOS para a Fila de Mentores
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
