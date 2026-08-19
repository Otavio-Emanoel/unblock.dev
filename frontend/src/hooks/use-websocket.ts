"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

export interface WSMessage {
  type: string;
  session_id?: string;
  room_id?: string;
  request_id?: string;
  client_id?: string;
  mentor_id?: string;
  mentor_name?: string;
  code?: string;
  sender_id?: string;
  request?: any;
  session?: any;
  payload?: any;
}

export function useWebSocket(roomId?: string) {
  const token = useAuthStore((s) => s.token);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(msg: WSMessage) => void>>>(new Map());

  useEffect(() => {
    if (!token) return;

    const wsUrl = new URL("ws://localhost:8081/api/ws");
    wsUrl.searchParams.set("token", token);
    if (roomId) {
      wsUrl.searchParams.set("room_id", roomId);
    }

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl.toString());

        socket.onopen = () => {
          setIsConnected(true);
          console.log("[WS] Conectado ao servidor de eventos em tempo real");
        };

        socket.onmessage = (event) => {
          try {
            const raw = event.data;
            const lines = raw.split("\n");
            for (const line of lines) {
              if (!line.trim()) continue;
              const msg: WSMessage = JSON.parse(line);
              setLastMessage(msg);

              // Notify type-specific listeners
              if (msg.type && listenersRef.current.has(msg.type)) {
                listenersRef.current.get(msg.type)?.forEach((cb) => cb(msg));
              }

              // Notify wildcard listeners
              if (listenersRef.current.has("*")) {
                listenersRef.current.get("*")?.forEach((cb) => cb(msg));
              }
            }
          } catch (e) {
            console.error("[WS] Erro ao parsear mensagem", e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          // Try reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = (err) => {
          console.warn("[WS] Conexão instável ou erro de websocket", err);
        };

        wsRef.current = socket;
      } catch (err) {
        console.error("[WS] Falha ao criar conexão", err);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.close();
      }
    };
  }, [token, roomId]);

  const sendMessage = useCallback((msg: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const subscribe = useCallback((eventType: string, callback: (msg: WSMessage) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)?.add(callback);

    return () => {
      listenersRef.current.get(eventType)?.delete(callback);
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
  };
}
