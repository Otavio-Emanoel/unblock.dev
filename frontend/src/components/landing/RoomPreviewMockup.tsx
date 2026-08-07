"use client";

import { useState, useEffect } from "react";
import { Play, Mic, Video, Monitor, Terminal, Code, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";

export function RoomPreviewMockup() {
  const [activeTab, setActiveTab] = useState<"editor" | "terminal" | "chat">("editor");
  const [balance, setBalance] = useState(48.5);
  const [seconds, setSeconds] = useState(0);

  // Live balance simulation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
      setBalance((prev) => Math.max(0, prev - 2.5 / 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-indigo-500/30 bg-[#090d16] shadow-2xl shadow-indigo-500/10 glow-primary">
      {/* Top Bar Mockup Header */}
      <div className="h-12 px-4 bg-[#0f172a] border-b border-white/10 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sala ao Vivo #sos-8921 (Pairing Active)
          </span>
        </div>

        {/* Balance Live Ticker Pill */}
        <div className="glass-pill px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Saldo Restante:</span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            R$ {balance.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({Math.floor(seconds / 60)}m {seconds % 60}s)</span>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
        {/* Left Video Grid & Speaker Cards (4 cols) */}
        <div className="md:col-span-4 bg-[#0d1322] border-r border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>WebRTC Video Grid</span>
              <span className="text-[10px] text-indigo-400 font-mono">LiveKit SFU</span>
            </div>

            {/* Mentor Stream Mock */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-indigo-500/40 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MENTOR SENIOR
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Alex Santos</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Especialista em Go & K8s</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-black/40 px-2 py-1 rounded">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Falando agora...
                </span>
                <span>4k / 60fps</span>
              </div>
            </div>

            {/* Client Stream Mock */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-white/10 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                  DEV
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Você (Desenvolvedor)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Compartilhando Tela</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
            <button className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 text-slate-300 border border-white/10">
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Tabbed Area: Editor / Terminal / Chat (8 cols) */}
        <div className="md:col-span-8 bg-[#090d16] flex flex-col">
          {/* Tab Navigation */}
          <div className="h-10 px-4 bg-[#0f172a]/60 border-b border-white/10 flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium transition ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Monaco Editor (CRDT Yjs)
            </button>

            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium transition ${
                activeTab === "terminal"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Output Terminal
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-5 font-mono text-xs leading-relaxed text-slate-300 relative overflow-hidden bg-[#0a0f1d]">
            {activeTab === "editor" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 font-sans border-b border-white/5 pb-2">
                  <span>main.go</span>
                  <span className="text-indigo-400 font-mono">Sincronização em Tempo Real (0 Conflitos)</span>
                </div>
                <p><span className="text-purple-400">package</span> main</p>
                <p></p>
                <p><span className="text-purple-400">func</span> <span className="text-blue-400">SolveRedisLock</span>(ctx context.Context, key string) <span className="text-purple-400">error</span> &#123;</p>
                <p className="pl-4 relative">
                  <span className="text-slate-500">// Fix aplicado pelo Mentor ao vivo:</span>
                </p>
                <p className="pl-4 bg-indigo-500/10 border-l-2 border-indigo-500 py-1 my-1 rounded-r">
                  ok, err := redisClient.<span className="text-blue-400">SetNX</span>(ctx, key, <span className="text-emerald-400">&quot;locked&quot;</span>, ttl).<span className="text-blue-400">Result</span>()
                  {/* Remote Cursor Badge */}
                  <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[9px] text-white font-sans animate-pulse">
                    Cursor: Alex (Mentor)
                  </span>
                </p>
                <p className="pl-4"><span className="text-purple-400">if</span> err != nil || !ok &#123;</p>
                <p className="pl-8"><span className="text-purple-400">return</span> fmt.<span className="text-blue-400">Errorf</span>(<span className="text-emerald-400">&quot;locked by another session&quot;</span>)</p>
                <p className="pl-4">&#125;</p>
                <p className="pl-4"><span className="text-purple-400">return</span> nil</p>
                <p>&#125;</p>
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="space-y-2 text-emerald-400">
                <p className="text-slate-400">$ go test -v ./internal/service/...</p>
                <p>=== RUN   TestSolveRedisLock</p>
                <p>--- PASS: TestSolveRedisLock (0.04s)</p>
                <p>PASS</p>
                <p className="text-slate-500">ok  unblock.dev/backend/internal/service  0.042s</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
