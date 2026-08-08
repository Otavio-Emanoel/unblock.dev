package handler

import (
	"context"
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
	Hub    *WSHub
	Conn   *websocket.Conn
	Send   chan []byte
	UserID string
	Role   domain.Role
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
				h.broadcastToMentors([]byte(msg.Payload))
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
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
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

	client := &WSClient{
		Hub:    h,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: claims.UserID,
		Role:   claims.Role,
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

	c.Conn.SetReadLimit(4096)
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
		// Echo / Broadcast message if received
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
