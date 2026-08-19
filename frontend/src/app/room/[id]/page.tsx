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
  Code,
  FileCode2,
  FolderPlus,
  FilePlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Users,
  ShieldCheck,
  Zap,
  Volume2,
  Folder,
  File,
  RotateCcw,
  RotateCw,
  CloudCheck,
  Cloud,
} from "lucide-react";
import { Room, RoomEvent, Track } from "livekit-client";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/use-auth-store";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useWebSocket } from "@/hooks/use-websocket";

interface WorkspaceFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

const DEFAULT_FILES: WorkspaceFile[] = [
  {
    id: "f1",
    name: "main.go",
    language: "go",
    content: `package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("🚀 Sessão de Pair Programming iniciada no Unblock.dev!")
	fmt.Println("Horário:", time.Now().Format(time.RFC3339))
	
	// Escreva a solução colaborativa aqui com seu par...
}`,
  },
  {
    id: "f2",
    name: "service.go",
    language: "go",
    content: `package main

type BugFixService struct {
	SessionID string
}

func NewBugFixService(id string) *BugFixService {
	return &BugFixService{SessionID: id}
}

func (s *BugFixService) Resolve() bool {
	return true
}`,
  },
  {
    id: "f3",
    name: "README.md",
    language: "markdown",
    content: `# Anotações da Sessão de Mentoria

- **Problema**: Descreva o contexto do bug resolvido
- **Causa Raiz**: O que causava o erro
- **Solução Aplicada**: Mudanças e boas práticas recomendadas
`,
  },
];

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
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Auto-Save Status
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("agora");

  // Media Controls State (DEFAULT: OFF / MUTED)
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteParticipantConnected, setRemoteParticipantConnected] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState("Aguardando participante...");
  const [remoteHasVideo, setRemoteHasVideo] = useState(false);
  const [remoteHasAudio, setRemoteHasAudio] = useState(false);

  // Multi-File Workspace State & Ref
  const [files, setFiles] = useState<WorkspaceFile[]>(DEFAULT_FILES);
  const filesRef = useRef<WorkspaceFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState<string>("f1");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  // Undo / Redo History per File
  const historyRef = useRef<{ [fileId: string]: string[] }>({});
  const historyIndexRef = useRef<{ [fileId: string]: number }>({});

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([
    { id: "sys-1", sender: "Sistema", text: "Bem-vindos à sala de mentoria ao vivo do Unblock.dev!", time: "00:00" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Video & LiveKit Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const livekitRoomRef = useRef<Room | null>(null);
  const isLocalEditRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket Hook for Room
  const { sendMessage, subscribe } = useWebSocket(id);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || DEFAULT_FILES[0];

  // 1. Fetch Session Data & Verify Access
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const s = await api.sessions.get(id);
        setSession(s);
        const snippet = s.saved_code_snippet || s.code_snippet;
        if (snippet && typeof snippet === "string" && snippet.trim().length > 0) {
          try {
            const parsed = JSON.parse(snippet);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].content !== undefined) {
              setFiles(parsed);
              filesRef.current = parsed;
              setActiveFileId(parsed[0].id);
            } else {
              const fallback = [{ ...DEFAULT_FILES[0], content: snippet }, ...DEFAULT_FILES.slice(1)];
              setFiles(fallback);
              filesRef.current = fallback;
            }
          } catch {
            const fallback = [{ ...DEFAULT_FILES[0], content: snippet }, ...DEFAULT_FILES.slice(1)];
            setFiles(fallback);
            filesRef.current = fallback;
          }
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

  // 3. Connect LiveKit WebRTC (Default: Receive Only, Muted & Camera Off)
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

        // When remote participant publishes a track
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          setRemoteParticipantConnected(true);
          setRemoteParticipantName(participant.name || participant.identity);

          if (track.kind === Track.Kind.Video) {
            setRemoteHasVideo(true);
            if (remoteVideoRef.current) {
              track.attach(remoteVideoRef.current);
            }
          }
          if (track.kind === Track.Kind.Audio) {
            setRemoteHasAudio(true);
            const audioElement = track.attach();
            audioElement.id = `remote-audio-${participant.identity}`;
            document.body.appendChild(audioElement);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Video) {
            setRemoteHasVideo(false);
          }
          if (track.kind === Track.Kind.Audio) {
            setRemoteHasAudio(false);
          }
          track.detach();
        });

        // Participant Joined
        room.on(RoomEvent.ParticipantConnected, (participant) => {
          setRemoteParticipantConnected(true);
          setRemoteParticipantName(participant.name || participant.identity);
        });

        // Participant Disconnected
        room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          setRemoteParticipantConnected(false);
          setRemoteHasVideo(false);
          setRemoteHasAudio(false);
        });

        const livekitUrl = session.livekit_url || "ws://localhost:7880";
        await room.connect(livekitUrl, session.livekit_token);
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

  // 4. Save Code to Backend (Auto-save & Manual)
  const triggerSave = useCallback(
    async (filesToSave?: WorkspaceFile[]) => {
      const toSave = filesToSave || filesRef.current;
      setSaveStatus("saving");
      try {
        const payload = JSON.stringify(toSave);
        const targetId = session?.id || id;
        await api.sessions.saveCode(targetId, payload);
        setSaveStatus("saved");
        setLastSavedTime(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (e) {
        console.warn("Auto-save error", e);
        setSaveStatus("unsaved");
      }
    },
    [id, session]
  );

  // 5. Real-time WebSocket Multi-File & Chat Synchronization
  useEffect(() => {
    // 5.1 Remote code changes in active file
    const unsubCode = subscribe("CODE_CHANGE", (msg) => {
      if (msg.code !== undefined && !isLocalEditRef.current) {
        const targetFileId = msg.file_id || activeFileId;
        const newCode = msg.code;
        setFiles((prev) => {
          const next = prev.map((f) => (f.id === targetFileId ? { ...f, content: newCode } : f));
          filesRef.current = next;
          return next;
        });
      }
    });

    // 5.2 Remote file created
    const unsubFileCreate = subscribe("FILE_CREATE", (msg) => {
      if (msg.file && !isLocalEditRef.current) {
        setFiles((prev) => {
          if (prev.some((f) => f.id === msg.file.id)) return prev;
          const next = [...prev, msg.file];
          filesRef.current = next;
          return next;
        });
      }
    });

    // 5.3 Remote file deleted
    const unsubFileDelete = subscribe("FILE_DELETE", (msg) => {
      if (msg.file_id && !isLocalEditRef.current) {
        setFiles((prev) => {
          const next = prev.filter((f) => f.id !== msg.file_id);
          filesRef.current = next;
          return next;
        });
      }
    });

    // 5.4 Remote chat message without duplication
    const unsubChat = subscribe("CHAT_MESSAGE", (msg) => {
      if (msg.payload?.text) {
        setChatMessages((prev) => {
          if (msg.payload.id && prev.some((m) => m.id === msg.payload.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: msg.payload.id || `msg-${Date.now()}-${Math.random()}`,
              sender: msg.payload.sender || "Participante",
              text: msg.payload.text,
              time: msg.payload.time || "Agora",
            },
          ];
        });
      }
    });

    // 5.5 Remote session ended
    const unsubEnd = subscribe("SESSION_ENDED", (msg) => {
      if (msg.session_id === id || msg.session?.id === id) {
        alert("A sessão de mentoria foi finalizada.");
        router.push("/dashboard");
      }
    });

    return () => {
      unsubCode();
      unsubFileCreate();
      unsubFileDelete();
      unsubChat();
      unsubEnd();
    };
  }, [subscribe, id, activeFileId, router]);

  // Handle local code editing with Auto-Save and History Stack
  const handleCodeChange = (newCode: string) => {
    setSaveStatus("unsaved");
    isLocalEditRef.current = true;

    // Push to undo history stack
    if (!historyRef.current[activeFileId]) {
      historyRef.current[activeFileId] = [activeFile.content];
      historyIndexRef.current[activeFileId] = 0;
    }
    const stack = historyRef.current[activeFileId];
    const currentIndex = historyIndexRef.current[activeFileId] ?? stack.length - 1;
    const newStack = [...stack.slice(0, currentIndex + 1), newCode];
    historyRef.current[activeFileId] = newStack;
    historyIndexRef.current[activeFileId] = newStack.length - 1;

    const updatedFiles = filesRef.current.map((f) =>
      f.id === activeFileId ? { ...f, content: newCode } : f
    );
    setFiles(updatedFiles);
    filesRef.current = updatedFiles;

    // Broadcast to peer
    sendMessage({
      type: "CODE_CHANGE",
      session_id: id,
      room_id: id,
      file_id: activeFileId,
      code: newCode,
    });

    setTimeout(() => {
      isLocalEditRef.current = false;
    }, 50);

    // Debounced Auto-Save (1 second after last keystroke)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      triggerSave(updatedFiles);
    }, 1000);
  };

  // Undo (Ctrl+Z)
  const handleUndo = useCallback(() => {
    const stack = historyRef.current[activeFileId];
    const currentIndex = historyIndexRef.current[activeFileId];
    if (stack && currentIndex !== undefined && currentIndex > 0) {
      const prevCode = stack[currentIndex - 1];
      historyIndexRef.current[activeFileId] = currentIndex - 1;
      const updatedFiles = filesRef.current.map((f) =>
        f.id === activeFileId ? { ...f, content: prevCode } : f
      );
      setFiles(updatedFiles);
      filesRef.current = updatedFiles;
      sendMessage({
        type: "CODE_CHANGE",
        session_id: id,
        room_id: id,
        file_id: activeFileId,
        code: prevCode,
      });
      triggerSave(updatedFiles);
    }
  }, [activeFileId, id, sendMessage, triggerSave]);

  // Redo (Ctrl+Y / Ctrl+Shift+Z)
  const handleRedo = useCallback(() => {
    const stack = historyRef.current[activeFileId];
    const currentIndex = historyIndexRef.current[activeFileId];
    if (stack && currentIndex !== undefined && currentIndex < stack.length - 1) {
      const nextCode = stack[currentIndex + 1];
      historyIndexRef.current[activeFileId] = currentIndex + 1;
      const updatedFiles = filesRef.current.map((f) =>
        f.id === activeFileId ? { ...f, content: nextCode } : f
      );
      setFiles(updatedFiles);
      filesRef.current = updatedFiles;
      sendMessage({
        type: "CODE_CHANGE",
        session_id: id,
        room_id: id,
        file_id: activeFileId,
        code: nextCode,
      });
      triggerSave(updatedFiles);
    }
  }, [activeFileId, id, sendMessage, triggerSave]);

  // Global Keyboard Shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerSave(filesRef.current);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        // Undo
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        // Redo
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerSave, handleUndo, handleRedo]);

  // Add new file to workspace
  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const name = newFileName.trim();
    const ext = name.split(".").pop() || "txt";
    const newFile: WorkspaceFile = {
      id: `f-${Date.now()}`,
      name,
      language: ext === "go" ? "go" : ext === "ts" || ext === "js" ? "typescript" : "text",
      content: `// Arquivo: ${name}\n\n`,
    };

    const updated = [...filesRef.current, newFile];
    setFiles(updated);
    filesRef.current = updated;
    setActiveFileId(newFile.id);
    setNewFileName("");
    setShowNewFileInput(false);

    sendMessage({
      type: "FILE_CREATE",
      session_id: id,
      room_id: id,
      file: newFile,
    });

    triggerSave(updated);
  };

  // Delete file from workspace
  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert("O workspace precisa ter pelo menos um arquivo.");
      return;
    }
    if (!confirm("Deseja realmente excluir este arquivo?")) return;

    const updated = filesRef.current.filter((f) => f.id !== fileId);
    setFiles(updated);
    filesRef.current = updated;
    if (activeFileId === fileId) {
      setActiveFileId(updated[0].id);
    }

    sendMessage({
      type: "FILE_DELETE",
      session_id: id,
      room_id: id,
      file_id: fileId,
    });

    triggerSave(updated);
  };

  // Media Controls (Toggle Mic & Camera)
  const handleToggleMic = async () => {
    if (!livekitRoomRef.current) return;
    try {
      const nextState = !isMuted;
      await livekitRoomRef.current.localParticipant.setMicrophoneEnabled(nextState);
      setIsMuted(!nextState);
    } catch (err: any) {
      alert("Permissão de microfone não concedida pelo navegador.");
    }
  };

  const handleToggleCamera = async () => {
    if (!livekitRoomRef.current) return;
    try {
      const willTurnOn = isCameraOff;
      await livekitRoomRef.current.localParticipant.setCameraEnabled(willTurnOn);
      setIsCameraOff(!willTurnOn);

      if (willTurnOn) {
        const localTrackPub = Array.from(
          livekitRoomRef.current.localParticipant.videoTrackPublications.values()
        )[0];
        if (localTrackPub?.track && localVideoRef.current) {
          localTrackPub.track.attach(localVideoRef.current);
        }
      } else {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }
    } catch (err: any) {
      alert("Permissão de câmera não concedida pelo navegador.");
    }
  };

  const handleToggleScreenShare = async () => {
    if (!livekitRoomRef.current) return;
    const nextState = !isScreenSharing;
    try {
      await livekitRoomRef.current.localParticipant.setScreenShareEnabled(nextState);
      setIsScreenSharing(nextState);
    } catch (err) {
      setIsScreenSharing(false);
    }
  };

  // Send Chat Message (With Unique ID & No Local Duplication)
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMsg = {
      id: messageId,
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
      await triggerSave(filesRef.current);
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
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
          {/* Left Column: Video Grid, Media Controls & Real-Time Chat (4 cols) */}
          <div className="col-span-12 md:col-span-4 border-r border-white/10 bg-[#0f172a]/40 p-3 flex flex-col gap-3 font-sans overflow-hidden">
            {/* Privacy & Media Activation Prompt Banner (Default Off) */}
            {(isMuted || isCameraOff) && (
              <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Câmera &amp; Áudio Desativados</div>
                    <div className="text-[10px] text-slate-400">Ative para conversar ao vivo com seu par:</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {isMuted && (
                    <button
                      onClick={handleToggleMic}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Mic className="w-3 h-3" /> Ligar Mic
                    </button>
                  )}
                  {isCameraOff && (
                    <button
                      onClick={handleToggleCamera}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Video className="w-3 h-3" /> Ligar Câmera
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Live Video Grid (Remote + Local) */}
            <div className="grid grid-rows-2 gap-2 h-72">
              {/* Remote Participant Video (Mentor / Client) */}
              <div className="relative bg-slate-900/90 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-inner group">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${remoteHasVideo ? "block" : "hidden"}`}
                />
                {!remoteHasVideo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 space-y-2 p-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 animate-pulse">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-300 font-semibold font-sans">
                      {remoteParticipantConnected
                        ? `${remoteParticipantName} (Câmera Desligada)`
                        : "Aguardando conexão do outro participante..."}
                    </span>
                    {remoteHasAudio && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Áudio Remoto Ativo
                      </span>
                    )}
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-md text-slate-300 font-mono flex items-center gap-1.5 border border-white/10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      remoteParticipantConnected ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
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
                  className={`w-full h-full object-cover scale-x-[-1] ${!isCameraOff ? "block" : "hidden"}`}
                />
                {isCameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 space-y-1">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                      <VideoOff className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Sua Câmera está Desligada</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded-md text-slate-300 font-mono flex items-center gap-1.5 border border-white/10">
                  <span className={`w-1.5 h-1.5 rounded-full ${!isCameraOff ? "bg-emerald-500" : "bg-slate-500"}`} />
                  {user?.name || "Você"} (Sua Câmera)
                </span>
              </div>
            </div>

            {/* Quick Media Bar Controls */}
            <div className="flex items-center justify-center gap-3 p-2 glass-card rounded-2xl border border-white/10">
              <button
                onClick={handleToggleMic}
                title={isMuted ? "Ativar Microfone" : "Mutar Microfone"}
                className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  isMuted
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-600 text-white shadow-md glow-success"
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-[10px]">{isMuted ? "Mutado" : "Mic Ativo"}</span>
              </button>

              <button
                onClick={handleToggleCamera}
                title={isCameraOff ? "Ativar Câmera" : "Desativar Câmera"}
                className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  isCameraOff
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-emerald-600 text-white shadow-md glow-success"
                }`}
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="text-[10px]">{isCameraOff ? "Câmera Off" : "Câmera On"}</span>
              </button>

              <button
                onClick={handleToggleScreenShare}
                title={isScreenSharing ? "Parar Compartilhamento" : "Compartilhar Tela"}
                className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  isScreenSharing
                    ? "bg-indigo-600 text-white shadow-lg glow-primary"
                    : "bg-white/5 hover:bg-white/10 text-slate-300"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-[10px]">{isScreenSharing ? "Tela Ativa" : "Compartilhar"}</span>
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
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
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

          {/* Center / Right Column: Multi-File Workspace & Collaborative Code Editor (8 cols) */}
          <div className="col-span-12 md:col-span-8 flex flex-col bg-[#090d16] overflow-hidden">
            {/* Top Workspace Bar: Auto-Save Status, Hotkeys Info, Undo/Redo */}
            <div className="h-11 px-4 bg-[#0f172a]/90 border-b border-white/10 flex items-center justify-between text-xs font-sans">
              {/* File Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pr-4 py-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`group px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 cursor-pointer transition border ${
                      activeFileId === file.id
                        ? "bg-indigo-600/30 text-white border-indigo-500/40 shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-slate-400 border-white/5"
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{file.name}</span>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition p-0.5 rounded"
                        title="Excluir arquivo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {showNewFileInput ? (
                  <form onSubmit={handleCreateFile} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="nome.go"
                      autoFocus
                      className="px-2 py-1 bg-slate-900 border border-indigo-500 rounded-lg text-xs text-white font-mono w-28 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-indigo-600 text-white text-[10px] rounded-lg font-bold"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewFileInput(false)}
                      className="px-1.5 py-1 text-slate-500 hover:text-white text-[10px]"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowNewFileInput(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Adicionar novo arquivo"
                  >
                    <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Novo</span>
                  </button>
                )}
              </div>

              {/* Status & Shortcut Hints */}
              <div className="flex items-center gap-3 font-mono text-[11px] flex-shrink-0">
                {/* Auto-Save Indicator */}
                <div className="flex items-center gap-1.5">
                  {saveStatus === "saving" ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
                      Salvando...
                    </span>
                  ) : saveStatus === "saved" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CloudCheck className="w-3.5 h-3.5" />
                      Salvo na nuvem ({lastSavedTime})
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5" />
                      Alterações pendentes...
                    </span>
                  )}
                </div>

                <span className="text-slate-700">|</span>

                {/* Hotkeys shortcuts helper */}
                <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[10px]">
                  <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Ctrl+S Salvar</span>
                  <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Ctrl+Z Desfazer</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUndo}
                    title="Desfazer (Ctrl+Z)"
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    title="Refazer (Ctrl+Y)"
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Collaborative Code Editor Input Area */}
            <div className="flex-1 p-4 bg-[#0b0f19] text-slate-300 font-mono text-sm leading-relaxed overflow-hidden relative flex flex-col">
              <textarea
                value={activeFile?.content || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="// Escreva ou cole o código aqui..."
                className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Bottom Workspace Files & Info Footer */}
            <div className="h-10 border-t border-white/10 bg-[#090d16] px-4 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  Workspace: {files.length} {files.length === 1 ? "arquivo" : "arquivos"}
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400 font-sans text-[11px]">
                  Arquivo ativo: <strong className="text-white font-mono">{activeFile?.name || "main.go"}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Sincronização em tempo real ativa
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
