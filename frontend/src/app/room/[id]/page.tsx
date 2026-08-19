"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mic, Video, Monitor, PhoneOff, Terminal as TerminalIcon, Code } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [session, setSession] = useState<any>(null);
  const [balanceCents, setBalanceCents] = useState<number>(user?.wallet?.balance_cents || 0);
  const [isEnding, setIsEnding] = useState(false);
  const [savedCode, setSavedCode] = useState<string>(
    `package main\n\nimport "fmt"\nimport "sync"\n\nfunc main() {\n\t// SOS Pair Programming Session\n\tfmt.Println("Corrigindo bug ao vivo com mentor!")\n}`
  );

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const s = await api.sessions.get(id);
        setSession(s);
      } catch (err) {
        console.error("Error fetching session", err);
      }
      try {
        const bal = await api.wallet.getBalance();
        setBalanceCents(bal.balance_cents);
      } catch (err) {
        console.error("Error fetching balance", err);
      }
    };

    fetchSession();
  }, [id]);

  const handleEndSession = async () => {
    setIsEnding(true);
    try {
      // Save code snapshot first
      await api.sessions.saveCode(id, savedCode).catch(() => {});
      // End session settlement
      await api.sessions.end(id);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Erro ao encerrar sessão.");
      router.push("/dashboard");
    } finally {
      setIsEnding(false);
    }
  };

  const balanceBrl = (balanceCents / 100).toFixed(2);

  return (
    <div className="h-screen bg-[#090d16] text-white flex flex-col overflow-hidden font-mono">
      {/* Room Header */}
      <header className="h-14 px-4 bg-[#0f172a]/90 border-b border-white/10 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg text-indigo-400">
            Unblock<span className="text-white">.dev</span>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono">Sessão #{id.substring(0, 8)}</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Conectado (WebRTC SFU)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-pill px-4 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Saldo</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">R$ {balanceBrl}</span>
            <span className="text-xs text-slate-400"> (~{Math.floor(balanceCents / 300)} min)</span>
          </div>

          <button
            onClick={handleEndSession}
            disabled={isEnding}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            {isEnding ? "Encerrando..." : "Encerrar Sessão"}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Media Video Grid & Controls & Chat (3 cols) */}
        <div className="col-span-3 border-r border-white/10 bg-[#0f172a]/40 p-3 flex flex-col gap-3 font-sans">
          {/* Video Participants */}
          <div className="grid grid-rows-2 gap-2 h-64">
            <div className="relative bg-slate-900/90 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 flex items-center justify-center font-bold text-lg">
                MEN
              </div>
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded text-slate-300 font-mono">
                Mentor Senior
              </span>
            </div>
            <div className="relative bg-slate-900/90 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 border border-slate-500 text-slate-200 flex items-center justify-center font-bold text-lg">
                DEV
              </div>
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded text-slate-300 font-mono">
                {user?.name || "Você (Cliente)"}
              </span>
            </div>
          </div>

          {/* Quick Media Controls */}
          <div className="flex items-center justify-center gap-2 p-2 glass-card rounded-xl">
            <button className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition">
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Room Chat */}
          <div className="flex-1 glass-card rounded-xl p-3 flex flex-col justify-between overflow-hidden">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Chat da Sala
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs font-sans">
              <div className="bg-slate-800/60 p-2 rounded-lg text-slate-300">
                <span className="font-bold text-indigo-400">Mentor:</span> Olá! Em que posso ajudar com a solução do bug?
              </div>
            </div>
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              className="mt-2 w-full p-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>
        </div>

        {/* Center / Right Column: Monaco Code Editor & Terminal (9 cols) */}
        <div className="col-span-9 flex flex-col bg-[#090d16]">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 bg-[#0f172a]/60 border-b border-white/10 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2 text-indigo-300">
              <Code className="w-4 h-4" />
              <span>main.go (Sincronizado via Yjs CRDT)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-slate-400">Cursores ativos: Mentor, {user?.name || "Você"}</span>
            </div>
          </div>

          {/* Monaco Code Editor Input */}
          <div className="flex-1 p-4 bg-[#0b0f19] text-slate-300 font-mono text-sm leading-relaxed overflow-y-auto space-y-1">
            <textarea
              value={savedCode}
              onChange={(e) => setSavedCode(e.target.value)}
              className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Session Terminal / Logs Output */}
          <div className="h-40 border-t border-white/10 bg-[#090d16] p-3 flex flex-col text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 mb-2 font-sans">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session Terminal Output</span>
            </div>
            <div className="flex-1 bg-black/50 rounded-lg p-2 text-emerald-400 overflow-y-auto space-y-1">
              <p>$ go run main.go</p>
              <p>[SOS] Corrigindo bug ao vivo com mentor!</p>
              <p className="text-slate-500">Process finished with exit code 0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
