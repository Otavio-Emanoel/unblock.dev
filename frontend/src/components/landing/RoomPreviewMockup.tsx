"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Terminal,
  Code,
  Sparkles,
  CheckCircle2,
  Activity,
  Send,
  Play,
  RotateCcw,
  Volume2,
  FolderTree,
  FileCode,
  MessageSquare,
  Radio,
  Clock,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: string;
  role: "mentor" | "client" | "system";
  text: string;
  time: string;
}

export function RoomPreviewMockup() {
  const [activeTab, setActiveTab] = useState<"editor" | "terminal" | "chat">("editor");
  const [activeFile, setActiveFile] = useState<"main.go" | "lock_service.go">("main.go");
  const [balance, setBalance] = useState(48.5);
  const [seconds, setSeconds] = useState(214); // 03:34 starting point

  // Interactive Media Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharing, setIsSharing] = useState(true);

  // Terminal Runner State
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testOutput, setTestOutput] = useState<string[]>([
    "=== RUN   TestSolveRedisLock_Concurrency",
    "=== RUN   TestSolveRedisLock_Concurrency/RaceCondition_Check",
    "--- PASS: TestSolveRedisLock_Concurrency (0.04s)",
    "=== RUN   TestSolveRedisLock_TimeoutFallback",
    "--- PASS: TestSolveRedisLock_TimeoutFallback (0.02s)",
    "PASS",
    "ok  	unblock.dev/backend/internal/service  0.062s  [100% PASS - 0 RACE DETECTED]",
  ]);

  // Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Sistema",
      role: "system",
      text: "Sessão de Pair Programming iniciada. Criptografia P2P ativa.",
      time: "00:00",
    },
    {
      id: "2",
      sender: "Alex Santos (Mentor)",
      role: "mentor",
      text: "Olá! Vi que você está tendo um deadlock no Redis lock com goroutines. Vamos corrigir isso com SetNX atômico.",
      time: "01:10",
    },
    {
      id: "3",
      sender: "Você (Dev)",
      role: "client",
      text: "Perfeito! O worker pool estava travando quando duas instâncias tentavam renovar o lock ao mesmo tempo.",
      time: "02:05",
    },
  ]);
  const [customMsg, setCustomMsg] = useState("");

  // Live balance simulation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
      setBalance((prev) => Math.max(0, prev + 2.5 / 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendChat = (textToSend?: string) => {
    const text = textToSend || customMsg;
    if (!text.trim()) return;

    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "Você (Dev)",
      role: "client",
      text: text.trim(),
      time: `${mins}:${secs}`,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setCustomMsg("");

    // Simulate mentor instant reply after 1.2s
    setTimeout(() => {
      const replies = [
        "Código compilou com sucesso e passou em todos os testes de corrida de dados (-race)!",
        "Acabei de adicionar o contexto com timeout para prevenir qualquer vazamento futuro.",
        "Boa! O TTL de 5s garante liberação mesmo se o container reiniciar.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "Alex Santos (Mentor)",
          role: "mentor",
          text: randomReply,
          time: `${mins}:${secs}`,
        },
      ]);
    }, 1200);
  };

  const handleRunTests = () => {
    setIsRunningTest(true);
    setTestOutput(["$ go test -v -race ./internal/service/...", "Compiling binaries & spinning test containers..."]);

    setTimeout(() => {
      setTestOutput([
        "$ go test -v -race ./internal/service/...",
        "=== RUN   TestSolveRedisLock_Concurrency",
        "=== RUN   TestSolveRedisLock_Concurrency/RaceCondition_Check",
        "--- PASS: TestSolveRedisLock_Concurrency (0.03s)",
        "=== RUN   TestSolveRedisLock_GracefulRelease",
        "--- PASS: TestSolveRedisLock_GracefulRelease (0.01s)",
        "PASS",
        "ok  	unblock.dev/backend/internal/service  0.048s  [ALL TESTS PASSED - ZERO LEAKS]",
      ]);
      setIsRunningTest(false);
    }, 900);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div
      id="demo-workspace"
      className="relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden border border-indigo-500/40 bg-[#090d16] shadow-2xl shadow-indigo-500/15 glow-primary transition duration-500 hover:border-indigo-500/60"
    >
      {/* Top Bar Mockup Header */}
      <div className="h-14 px-4 sm:px-6 bg-[#0f172a] border-b border-white/10 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-white font-bold">Sessão #8492</span>
            <span className="text-slate-400 hidden md:inline">(Pairing &amp; LiveKit SFU Ativo)</span>
          </span>
        </div>

        {/* Balance & Timer Live Ticker Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="glass-pill px-3 py-1 rounded-xl border border-indigo-500/30 flex items-center gap-2 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-white">{formatTimer(seconds)}</span>
          </div>

          <div className="glass-pill px-3 py-1 rounded-xl border border-emerald-500/40 flex items-center gap-2 text-xs font-mono shadow-sm">
            <span className="text-[10px] text-slate-400 font-medium uppercase hidden sm:inline">Custo:</span>
            <span className="font-bold text-emerald-400">R$ {balance.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500">(R$ 2,50/min)</span>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Column: WebRTC Video Streams & Controls (3 cols) */}
        <div className="lg:col-span-3 bg-[#0d1322] border-r border-white/10 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-white">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Vídeo WebRTC
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">LiveKit 4K</span>
            </div>

            {/* Mentor Stream Mock */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/40 p-3 flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3" /> MENTOR SENIOR
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  AS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Alex Santos</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Go &amp; Redis Specialist</div>
                </div>
              </div>

              {/* Audio visualizer bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-emerald-400 animate-[pulse_0.6s_infinite] h-2" />
                    <span className="w-0.5 bg-emerald-400 animate-[pulse_0.4s_infinite] h-3" />
                    <span className="w-0.5 bg-emerald-400 animate-[pulse_0.8s_infinite] h-1.5" />
                    <span className="w-0.5 bg-emerald-400 animate-[pulse_0.5s_infinite] h-2.5" />
                  </span>
                  <span>Explicando solução...</span>
                </div>
                <span className="text-slate-500">60 fps</span>
              </div>
            </div>

            {/* Client (You) Stream Mock */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-white/10 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
                  DEV
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Você (Desenvolvedor)</div>
                  <div className="text-[10px] text-indigo-300 font-mono">
                    {isSharing ? "Compartilhando Tela" : "Tela Pausada"}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between bg-black/40 px-2 py-1 rounded-lg">
                <span>{isMuted ? "🔇 Microfone Mutado" : "🎙️ Áudio Ativo"}</span>
                <span>{isCameraOff ? "Câmera Off" : "HD 1080p"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Toolbar for Media */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[10px] font-mono text-slate-400 block text-center">
              Interaja com os controles:
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Ligar Microfone" : "Mutar Microfone"}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isMuted
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-600 text-white shadow-md glow-success"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                title={isCameraOff ? "Ligar Câmera" : "Desligar Câmera"}
                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isCameraOff
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-600 text-white shadow-md glow-success"
                }`}
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsSharing(!isSharing)}
                title="Alternar Compartilhamento"
                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSharing
                    ? "bg-indigo-600 text-white shadow-lg glow-primary"
                    : "bg-white/5 text-slate-300 border border-white/10"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Monaco Code Editor & Live Sync (6 cols) */}
        <div className="lg:col-span-6 bg-[#090d16] flex flex-col border-r border-white/10">
          {/* Tab & File Navigation */}
          <div className="h-11 px-4 bg-[#0f172a]/70 border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium transition cursor-pointer ${
                  activeTab === "editor"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" /> Editor CRDT
              </button>

              <button
                onClick={() => setActiveTab("terminal")}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium transition cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Terminal
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 font-medium transition cursor-pointer lg:hidden ${
                  activeTab === "chat"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat ({chatMessages.length})
              </button>
            </div>

            {/* File Switcher for Editor */}
            {activeTab === "editor" && (
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <button
                  onClick={() => setActiveFile("main.go")}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeFile === "main.go"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCode className="w-3 h-3 text-indigo-400" />
                  main.go
                </button>
                <button
                  onClick={() => setActiveFile("lock_service.go")}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeFile === "lock_service.go"
                      ? "bg-white/10 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCode className="w-3 h-3 text-emerald-400" />
                  lock_service.go
                </button>
              </div>
            )}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-5 font-mono text-xs leading-relaxed text-slate-300 relative overflow-hidden bg-[#0a0f1d] flex flex-col justify-between">
            {activeTab === "editor" && activeFile === "main.go" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 font-sans border-b border-white/5 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>package main • Go 1.24</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    CRDT: Sincronizado em 12ms
                  </span>
                </div>
                <p><span className="text-purple-400">package</span> main</p>
                <p></p>
                <p><span className="text-purple-400">func</span> <span className="text-blue-400">SolveRedisLock</span>(ctx context.Context, key <span className="text-purple-400">string</span>) <span className="text-purple-400">error</span> &#123;</p>
                <p className="pl-4 text-slate-500">
                  &#47;&#47; 🚀 Fix aplicado pelo Mentor ao vivo via CRDT:
                </p>
                <div className="pl-4 bg-indigo-600/15 border-l-2 border-indigo-400 py-1.5 my-1 rounded-r flex flex-wrap items-center gap-2">
                  <span>
                    ok, err := redisClient.<span className="text-blue-400">SetNX</span>(ctx, key, <span className="text-emerald-400">&quot;locked&quot;</span>, 5*time.Second).<span className="text-blue-400">Result</span>()
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 text-[9px] text-white font-sans animate-pulse">
                    Cursor: Alex Santos (Mentor)
                  </span>
                </div>
                <p className="pl-4"><span className="text-purple-400">if</span> err != nil || !ok &#123;</p>
                <p className="pl-8"><span className="text-purple-400">return</span> fmt.<span className="text-blue-400">Errorf</span>(<span className="text-emerald-400">&quot;locked by concurrent session&quot;</span>)</p>
                <p className="pl-4">&#125;</p>
                <p className="pl-4 text-emerald-400">&#47;&#47; Executa operação segura sem race conditions</p>
                <p className="pl-4"><span className="text-purple-400">return</span> nil</p>
                <p>&#125;</p>
              </div>
            )}

            {activeTab === "editor" && activeFile === "lock_service.go" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 font-sans border-b border-white/5 pb-2">
                  <span>lock_service.go • Worker Pool Concurrency</span>
                  <span className="text-indigo-400 font-mono">2 cursores ativos</span>
                </div>
                <p><span className="text-purple-400">package</span> main</p>
                <p></p>
                <p><span className="text-purple-400">type</span> LockManager <span className="text-purple-400">struct</span> &#123;</p>
                <p className="pl-4">mu sync.RWMutex</p>
                <p className="pl-4">client *redis.Client</p>
                <p>&#125;</p>
                <p></p>
                <p><span className="text-purple-400">func</span> <span className="text-blue-400">NewLockManager</span>() *LockManager &#123;</p>
                <p className="pl-4"><span className="text-purple-400">return</span> &amp;LockManager&#123;&#125;</p>
                <p>&#125;</p>
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-slate-400">Bash / Go Test Runner</span>
                  <button
                    onClick={handleRunTests}
                    disabled={isRunningTest}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    {isRunningTest ? "Executando..." : "Executar Teste"}
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {testOutput.map((line, idx) => (
                    <p
                      key={idx}
                      className={
                        line.includes("PASS") || line.includes("100%")
                          ? "text-emerald-400 font-bold"
                          : line.includes("$")
                          ? "text-slate-400"
                          : "text-slate-300"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2 overflow-y-auto max-h-[220px]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-xl text-xs ${
                        msg.role === "client"
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 ml-4"
                          : msg.role === "mentor"
                          ? "bg-slate-800/80 border border-white/10 text-slate-200 mr-4"
                          : "bg-white/5 text-slate-400 text-center text-[10px]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Envie uma mensagem..."
                    className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Helper Banner */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-sans">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Atalhos: <code className="bg-white/5 px-1 py-0.5 rounded text-white font-mono">Ctrl+S</code> Salvar • <code className="bg-white/5 px-1 py-0.5 rounded text-white font-mono">Ctrl+Z</code> Desfazer
              </span>
              <span className="text-emerald-400 font-mono">Auto-save: Ativo</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat & Telemetry Stream (3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 bg-[#0d1322] p-4 flex-col justify-between font-mono text-[11px]">
          {/* Chat Stream Header */}
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-white">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Chat da Sessão
              </span>
              <span className="text-[10px] text-emerald-400 font-normal">P2P Criptografado</span>
            </div>

            {/* Chat message bubbles */}
            <div className="space-y-2 overflow-y-auto max-h-[220px] flex-1 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl text-xs ${
                    msg.role === "client"
                      ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 ml-2"
                      : msg.role === "mentor"
                      ? "bg-slate-800/80 border border-white/10 text-slate-200 mr-2"
                      : "bg-white/5 text-slate-400 text-center text-[10px]"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-300">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="font-sans text-[11px] leading-snug">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Quick interactive chips */}
            <div className="pt-2 flex flex-wrap gap-1">
              <button
                onClick={() => handleSendChat("Fix testado e funcionando! 🎉")}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 transition cursor-pointer font-sans"
              >
                + Fix testado! 🎉
              </button>
              <button
                onClick={() => handleSendChat("Pode me explicar essa linha do timeout?")}
                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 transition cursor-pointer font-sans"
              >
                + Dúvida no timeout
              </button>
            </div>

            {/* Interactive Chat Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder="Enviar mensagem..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                onClick={() => handleSendChat()}
                className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Engine Status Bottom Pill */}
          <div className="pt-3 border-t border-white/10 space-y-1 text-[10px] text-slate-500">
            <div className="flex justify-between">
              <span>Status do Hub:</span>
              <span className="text-emerald-400 font-bold">100% Sincronizado</span>
            </div>
            <div className="flex justify-between">
              <span>Billing Engine:</span>
              <span className="text-white">TickerEngine Go 1.24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
