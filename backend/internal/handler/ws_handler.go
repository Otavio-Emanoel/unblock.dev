package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"unblock-backend/internal/domain"
	repoRedis "unblock-backend/internal/repository/redis"
	"unblock-backend/internal/service"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow CORS for local dev
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type WSClient struct {
	Hub     *WSHub
	Conn    *websocket.Conn
	Send    chan []byte
	UserID  string
	Role    domain.Role
	RoomID  string
}

type WSIncomingMessage struct {
	Type      string      `json:"type"`
	SessionID string      `json:"session_id,omitempty"`
	RoomID    string      `json:"room_id,omitempty"`
	Code      string      `json:"code,omitempty"`
	SenderID  string      `json:"sender_id,omitempty"`
	Payload   interface{} `json:"payload,omitempty"`
}

type WSHub struct {
	clients    map[*WSClient]bool
	broadcast  chan []byte
	register   chan *WSClient
	unregister chan *WSClient
	mu         sync.RWMutex
	pubSubRepo *repoRedis.PubSubRepository
	authSvc    *service.AuthService
	logger     *slog.Logger
}

func NewWSHub(pubSubRepo *repoRedis.PubSubRepository, authSvc *service.AuthService, logger *slog.Logger) *WSHub {
	return &WSHub{
		clients:    make(map[*WSClient]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
		pubSubRepo: pubSubRepo,
		authSvc:    authSvc,
		logger:     logger,
	}
}

func (h *WSHub) Run(ctx context.Context) {
	// Subscribe to Redis Pub/Sub channel for SOS broadcasts
	if h.pubSubRepo != nil {
		go func() {
			pubsub := h.pubSubRepo.SubscribeSOS(ctx)
			defer pubsub.Close()

			ch := pubsub.Channel()
			for msg := range ch {
				var evt map[string]interface{}
				if err := json.Unmarshal([]byte(msg.Payload), &evt); err == nil {
					eventType, _ := evt["type"].(string)
					switch eventType {
					case "REQUEST_CREATED":
						// Notify all online mentors
						h.broadcastToMentors([]byte(msg.Payload))
					case "REQUEST_ACCEPTED":
						// Broadcast to all connected clients (mentors update queue, target client redirects to room)
						h.logger.Info("Broadcasting REQUEST_ACCEPTED event", "payload", msg.Payload)
						h.broadcastMessage([]byte(msg.Payload))
					default:
						h.broadcastMessage([]byte(msg.Payload))
					}
				} else {
					h.broadcastToMentors([]byte(msg.Payload))
				}
			}
		}()
	}

	for {
		select {
		case <-ctx.Done():
			return
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			h.logger.Info("WS Client connected", "user_id", client.UserID, "role", client.Role)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
				h.logger.Info("WS Client disconnected", "user_id", client.UserID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

func (h *WSHub) broadcastMessage(message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(h.clients, client)
		}
	}
}

func (h *WSHub) broadcastToMentors(message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.Role == domain.RoleMentor {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client)
			}
		}
	}
}

func (h *WSHub) sendToUser(userID string, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client)
			}
		}
	}
}

func (h *WSHub) broadcastToSession(sessionID string, sender *WSClient, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client != sender && (client.RoomID == sessionID || client.RoomID == "" || sessionID == "") {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client)
			}
		}
	}
}

func (h *WSHub) HandleWS(w http.ResponseWriter, r *http.Request) {
	tokenStr := r.URL.Query().Get("token")
	if tokenStr == "" {
		http.Error(w, "Unauthorized: missing token", http.StatusUnauthorized)
		return
	}

	claims, err := h.authSvc.ValidateToken(tokenStr)
	if err != nil {
		http.Error(w, "Unauthorized: invalid token", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("WS Upgrade error", "err", err)
		return
	}

	roomID := r.URL.Query().Get("room_id")

	client := &WSClient{
		Hub:    h,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: claims.UserID,
		Role:   claims.Role,
		RoomID: roomID,
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}

func (c *WSClient) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(65536) // allow larger code snippets
	_ = c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		_ = c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var incoming WSIncomingMessage
		if err := json.Unmarshal(message, &incoming); err == nil {
			if incoming.RoomID != "" {
				c.RoomID = incoming.RoomID
			} else if incoming.SessionID != "" {
				c.RoomID = incoming.SessionID
			}

			// Broadcast code changes or room events to room participants
			if incoming.Type == "CODE_CHANGE" || incoming.Type == "JOIN_ROOM" || incoming.Type == "SESSION_ENDED" {
				incoming.SenderID = c.UserID
				outBytes, _ := json.Marshal(incoming)
				c.Hub.broadcastToSession(c.RoomID, c, outBytes)
				continue
			}
		}

		// Echo / Broadcast general message if received
		c.Hub.broadcast <- message
	}
}

func (c *WSClient) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				_ = c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			_, _ = w.Write(message)

			// Add queued messages
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, _ = w.Write([]byte{'\n'})
				_, _ = w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
