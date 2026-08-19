"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { Zap, Send, Radio, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";
import { useWebSocket } from "@/hooks/use-websocket";

export default function RequestSOSPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isMentor = user?.role?.toLowerCase() === "mentor";

  const [title, setTitle] = useState("");
  const [stack, setStack] = useState("");
  const [description, setDescription] = useState("");
  const [maxRate, setMaxRate] = useState("4.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdRequest, setCreatedRequest] = useState<any | null>(null);
  const [acceptedSession, setAcceptedSession] = useState<any | null>(null);

  const { subscribe } = useWebSocket();

  // If mentor attempts to access /request, redirect to dashboard
  useEffect(() => {
    if (isMentor) {
      router.replace("/dashboard");
    }
  }, [isMentor, router]);

  // Listen for real-time acceptance when waiting
  useEffect(() => {
    if (!createdRequest) return;

    const unsub = subscribe("REQUEST_ACCEPTED", (msg) => {
      if (msg.request_id === createdRequest.id || msg.client_id === user?.id) {
        setAcceptedSession(msg);
        setTimeout(() => {
          router.push(`/room/${msg.session_id}`);
        }, 1500);
      }
    });

    return () => {
      unsub();
    };
  }, [createdRequest, subscribe, user?.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const stackArray = stack.split(",").map((s) => s.trim()).filter(Boolean);
      const rateCents = Math.round(parseFloat(maxRate.replace(",", ".")) * 100);

      const req = await api.requests.create({
        title,
        description,
        stack: stackArray.length > 0 ? stackArray : ["Geral"],
        max_minute_rate_cents: rateCents > 0 ? rateCents : 400,
      });

      setCreatedRequest(req);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao criar chamado SOS.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col">
      <DashboardHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Waiting / Matchmaking Live State */}
        {createdRequest ? (
          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-indigo-500/30 text-center space-y-6 animate-fade-in shadow-2xl">
            {acceptedSession ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Mentor Conectado! 🎉
                </h2>
                <p className="text-emerald-400 text-sm font-mono">
                  O mentor <strong>{acceptedSession.mentor_name || "Especialista"}</strong> aceitou seu chamado!
                </p>
                <p className="text-xs text-slate-400">
                  Entrando na sala de pair programming ao vivo...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-[#ff4757] text-white flex items-center justify-center shadow-lg glow-sos">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    Chamado SOS na Fila de Mentores
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mx-auto">
                    Seu pedido <strong className="text-indigo-400">#{createdRequest.id.substring(0, 8)}</strong> foi transmitido para todos os mentores online em tempo real.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-400">
                    <span>Problema:</span>
                    <span className="text-white font-bold">{createdRequest.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Oferta Máxima:</span>
                    <span className="text-emerald-400 font-bold">R$ {(createdRequest.max_minute_rate_cents / 100).toFixed(2)}/min</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Status:</span>
                    <span className="text-amber-400 font-bold animate-pulse">AGUARDANDO MENTOR</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold transition"
                  >
                    Voltar ao Painel
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Request Form */
          <>
            <div className="space-y-2">
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
              </Link>
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
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 font-mono">
                    Tecnologias / Stack (separadas por vírgula)
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
                    Taxa Máxima por Minuto (R$/min)
                  </label>
                  <input
                    type="text"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    placeholder="4.00"
                    className="w-full p-3.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
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
                className="w-full py-4 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-2xl glow-sos text-xs transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Transmitindo SOS para a Fila de Mentores...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Disparar SOS para a Fila de Mentores
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
