"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Terminal as TerminalIcon,
  Code,
  Save,
  Play,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Room, RoomEvent, Track, createLocalVideoTrack, createLocalAudioTrack } from "livekit-client";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useWebSocket } from "@/hooks/use-websocket";

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Media Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteParticipantConnected, setRemoteParticipantConnected] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState("Aguardando participante...");

  // Collaborative Code State
  const [savedCode, setSavedCode] = useState<string>(
    `package main\n\nimport "fmt"\nimport "sync"\n\nfunc main() {\n\t// SOS Pair Programming Session\n\tfmt.Println("Conectado ao vivo com seu mentor no Unblock.dev!")\n}`
  );
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "$ go version",
    "go version go1.24.0 linux/amd64",
    "[LiveKit] Sala WebRTC iniciada com sucesso.",
    "[Yjs/WS] Canal de sincronização de código ativo.",
  ]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "Sistema", text: "Bem-vindos à sessão de mentoria ao vivo do Unblock.dev!", time: "00:00" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const isLocalEditRef = useRef(false);

  // WebSocket Hook for Room
  const { sendMessage, subscribe } = useWebSocket(id);

  // 1. Fetch Session Data & Verify Access
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const s = await api.sessions.get(id);
        setSession(s);
        if (s.code_snippet) {
          setSavedCode(s.code_snippet);
        }
      } catch (err: any) {
        console.error("Error fetching session", err);
        setErrorMessage(err.message || "Erro ao carregar sessão ou acesso não autorizado.");
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

  // 2. Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Connect LiveKit Video & Audio Room
  useEffect(() => {
    if (!session?.livekit_token) return;

    let room: Room | null = null;

    const connectLiveKit = async () => {
      try {
        room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        livekitRoomRef.current = room;

        // Track Subscribed (Remote participant turned on Camera/Mic)
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          setRemoteParticipantConnected(true);
          setRemoteParticipantName(participant.name || participant.identity);

          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
          }
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach();
            document.body.appendChild(el);
          }
        });

        // Participant Joined
        room.on(RoomEvent.ParticipantConnected, (participant) => {
          setRemoteParticipantConnected(true);
          setRemoteParticipantName(participant.name || participant.identity);
          setTerminalOutput((prev) => [...prev, `[LiveKit] ${participant.name || "Participante"} conectou-se à chamada.`]);
        });

        // Participant Disconnected
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          setRemoteParticipantConnected(false);
          setTerminalOutput((prev) => [...prev, `[LiveKit] ${participant.name || "Participante"} desconectou-se.`]);
        });

        // Connect to LiveKit server
        const livekitUrl = session.livekit_url || "ws://localhost:7880";
        await room.connect(livekitUrl, session.livekit_token);

        // Publish local camera and mic
        try {
          await room.localParticipant.enableCameraAndMicrophone();

          // Attach local video track
          const localTrackPub = Array.from(room.localParticipant.videoTrackPublications.values())[0];
          if (localTrackPub?.track && localVideoRef.current) {
            localTrackPub.track.attach(localVideoRef.current);
          }
        } catch (mediaErr) {
          console.warn("Camera/Mic permission not granted or headless mode", mediaErr);
        }
      } catch (e) {
        console.error("LiveKit connection error", e);
      }
    };

    connectLiveKit();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [session]);

  // 4. Real-time WebSocket Code & Chat Synchronization
  useEffect(() => {
    // Subscribe to remote code changes
    const unsubCode = subscribe("CODE_CHANGE", (msg) => {
      if (msg.code !== undefined && !isLocalEditRef.current) {
        setSavedCode(msg.code);
      }
    });

    // Subscribe to remote chat messages
    const unsubChat = subscribe("CHAT_MESSAGE", (msg) => {
      if (msg.payload?.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: msg.payload.sender || "Participante",
            text: msg.payload.text,
            time: msg.payload.time || "Agora",
          },
        ]);
      }
    });

    // Subscribe to remote session ended
    const unsubEnd = subscribe("SESSION_ENDED", (msg) => {
      if (msg.session_id === id) {
        alert("A sessão de mentoria foi finalizada.");
        router.push("/dashboard");
      }
    });

    return () => {
      unsubCode();
      unsubChat();
      unsubEnd();
    };
  }, [subscribe, id, router]);

  // Handle local code typing
  const handleCodeChange = (newCode: string) => {
    setSavedCode(newCode);
    isLocalEditRef.current = true;
    sendMessage({
      type: "CODE_CHANGE",
      session_id: id,
      room_id: id,
      code: newCode,
    });
    setTimeout(() => {
      isLocalEditRef.current = false;
    }, 100);
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (livekitRoomRef.current) {
      const nextState = !isMuted;
      await livekitRoomRef.current.localParticipant.setMicrophoneEnabled(!nextState);
      setIsMuted(nextState);
    }
  };

  // Toggle Camera
  const handleToggleCamera = async () => {
    if (livekitRoomRef.current) {
      const nextState = !isCameraOff;
      await livekitRoomRef.current.localParticipant.setCameraEnabled(!nextState);
      setIsCameraOff(nextState);
    }
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (livekitRoomRef.current) {
      const nextState = !isScreenSharing;
      try {
        await livekitRoomRef.current.localParticipant.setScreenShareEnabled(nextState);
        setIsScreenSharing(nextState);
      } catch (err) {
        console.warn("Screen share cancelled", err);
      }
    }
  };

  // Save Code to Backend
  const handleSaveCode = async () => {
    setIsSaving(true);
    try {
      await api.sessions.saveCode(id, savedCode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar código.");
    } finally {
      setIsSaving(false);
    }
  };

  // Run Code in Live Terminal Simulator
  const handleRunCode = () => {
    setTerminalOutput((prev) => [
      ...prev,
      `$ go run main.go [${new Date().toLocaleTimeString()}]`,
      "Executando código compilado com sucesso...",
      "Process finished with exit code 0",
    ]);
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: user?.name || "Eu",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    sendMessage({
      type: "CHAT_MESSAGE",
      session_id: id,
      room_id: id,
      payload: newMsg,
    });
    setChatInput("");
  };

  // End Session & Financial Settlement
  const handleEndSession = async () => {
    if (!confirm("Deseja realmente encerrar a sessão e liquidar o pagamento?")) return;

    setIsEnding(true);
    try {
      await api.sessions.saveCode(id, savedCode).catch(() => {});
      await api.sessions.end(id);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Erro ao encerrar sessão.");
      router.push("/dashboard");
    } finally {
      setIsEnding(false);
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const balanceBrl = (balanceCents / 100).toFixed(2);
  const minuteRateBrl = session?.minute_rate_cents ? (session.minute_rate_cents / 100).toFixed(2) : "3.50";
  const sessionCostBrl = ((Math.ceil(elapsedSeconds / 60) * (session?.minute_rate_cents || 350)) / 100).toFixed(2);

  if (errorMessage) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Acesso Não Autorizado à Sala</h2>
          <p className="text-xs text-slate-400 max-w-md text-center">{errorMessage}</p>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
          >
            Voltar ao Painel
          </Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen bg-[#090d16] text-white flex flex-col overflow-hidden font-mono">
        {/* Room Header */}
        <header className="h-14 px-4 bg-[#0f172a]/90 border-b border-white/10 flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-bold text-lg text-indigo-400">
              Unblock<span className="text-white">.dev</span>
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-300 font-mono">Sessão #{id.substring(0, 8)}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              LiveKit SFU Conectado
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Session Timer & Cost */}
            <div className="glass-pill px-3.5 py-1 rounded-xl border border-indigo-500/30 flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <span className="text-slate-400">Tempo:</span>
                <span className="font-bold text-white text-sm">{formatTimer(elapsedSeconds)}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="text-slate-400">Custo:</span>
                <span className="font-bold">R$ {sessionCostBrl}</span>
                <span className="text-[10px] text-slate-500">(R$ {minuteRateBrl}/min)</span>
              </div>
            </div>

            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#ff4757] hover:bg-[#ff4757]/90 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              {isEnding ? "Finalizando..." : "Encerrar Sessão"}
            </button>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Column: Two-Way Video Grid, Controls & Real-Time Chat (4 cols) */}
          <div className="col-span-12 md:col-span-4 border-r border-white/10 bg-[#0f172a]/40 p-3 flex flex-col gap-3 font-sans overflow-hidden">
            {/* Live Video Grid (Remote + Local) */}
            <div className="grid grid-rows-2 gap-2 h-72">
              {/* Remote Participant Video (Mentor / Client) */}
              <div className="relative bg-slate-900/90 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner group">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!remoteParticipantConnected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 space-y-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 animate-pulse">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-300 font-semibold font-sans">
                      Aguardando conexão do outro participante...
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Ambos entrarão automaticamente nesta sala
                    </span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-md text-slate-300 font-mono flex items-center gap-1.5 border border-white/10">
                  <span className={`w-1.5 h-1.5 rounded-full ${remoteParticipantConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {remoteParticipantConnected ? remoteParticipantName : "Participante Remoto"}
                </span>
              </div>

              {/* Local Participant Video (You) */}
              <div className="relative bg-slate-900/90 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner group">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {isCameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-1">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                      <VideoOff className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Câmera Desativada</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-md text-slate-300 font-mono flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {user?.name || "Você"} (Sua Câmera)
                </span>
              </div>
            </div>

            {/* Quick Media Bar Controls */}
            <div className="flex items-center justify-center gap-3 p-2 glass-card rounded-2xl border border-white/10">
              <button
                onClick={handleToggleMic}
                title={isMuted ? "Ativar Microfone" : "Mutar Microfone"}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 hover:bg-white/10 text-white"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleCamera}
                title={isCameraOff ? "Ativar Câmera" : "Desativar Câmera"}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isCameraOff ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 hover:bg-white/10 text-white"
                }`}
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                title={isScreenSharing ? "Parar Compartilhamento" : "Compartilhar Tela"}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isScreenSharing ? "bg-emerald-600 text-white shadow-lg glow-success" : "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time Room Chat */}
            <div className="flex-1 glass-card rounded-2xl p-3 flex flex-col justify-between overflow-hidden border border-white/10">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Chat ao Vivo
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">P2P Criptografado</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 text-xs font-sans pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-xs ${
                      msg.sender === (user?.name || "Eu")
                        ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 ml-4"
                        : "bg-slate-800/80 border border-white/10 text-slate-300 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="font-bold text-slate-300">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enviar mensagem..."
                  className="flex-1 p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Center / Right Column: Collaborative Code Editor & Terminal (8 cols) */}
          <div className="col-span-12 md:col-span-8 flex flex-col bg-[#090d16]">
            {/* Editor Header Bar with Actions */}
            <div className="h-12 px-4 bg-[#0f172a]/80 border-b border-white/10 flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 text-indigo-300">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-bold text-white">main.go</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sincronização em Tempo Real (WebSocket)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Salvo!
                  </span>
                )}

                <button
                  onClick={handleSaveCode}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  {isSaving ? "Salvando..." : "Salvar Código"}
                </button>

                <button
                  onClick={handleRunCode}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md glow-success cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Executar
                </button>
              </div>
            </div>

            {/* Collaborative Code Editor Input Area */}
            <div className="flex-1 p-4 bg-[#0b0f19] text-slate-300 font-mono text-sm leading-relaxed overflow-hidden relative">
              <textarea
                value={savedCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="// Escreva ou cole o código aqui..."
                className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Session Terminal / Logs Output */}
            <div className="h-44 border-t border-white/10 bg-[#090d16] p-3 flex flex-col text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 mb-2 font-sans">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">Terminal da Sessão</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Linux Sandbox</span>
              </div>
              <div className="flex-1 bg-black/60 rounded-xl p-3 text-emerald-400 overflow-y-auto space-y-1 border border-white/5 shadow-inner">
                {terminalOutput.map((out, idx) => (
                  <p key={idx} className={out.startsWith("$") ? "text-indigo-300 font-bold" : out.startsWith("[LiveKit]") ? "text-amber-400" : "text-emerald-400"}>
                    {out}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
