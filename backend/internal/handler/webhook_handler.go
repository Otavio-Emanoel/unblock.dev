package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"
)

type WebhookHandler struct {
	tickerEngine *service.TickerEngine
	walletSvc    *service.WalletService
	sessionRepo  domain.SessionRepository
	logger       *slog.Logger
}

func NewWebhookHandler(te *service.TickerEngine, ws *service.WalletService, sr domain.SessionRepository, logger *slog.Logger) *WebhookHandler {
	return &WebhookHandler{
		tickerEngine: te,
		walletSvc:    ws,
		sessionRepo:  sr,
		logger:       logger,
	}
}

type LiveKitEvent struct {
	Event string `json:"event"`
	Room  struct {
		Name string `json:"name"`
		Sid  string `json:"sid"`
	} `json:"room"`
	Participant struct {
		Identity string `json:"identity"`
		Name     string `json:"name"`
	} `json:"participant"`
}

func (h *WebhookHandler) HandleLiveKitWebhook(w http.ResponseWriter, r *http.Request) {
	var evt LiveKitEvent
	if err := json.NewDecoder(r.Body).Decode(&evt); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid webhook payload")
		return
	}

	h.logger.Info("Received LiveKit Webhook", "event", evt.Event, "room", evt.Room.Name, "participant", evt.Participant.Identity)

	switch evt.Event {
	case "participant_joined":
		// Fetch session to obtain clientID and minute rate
		session, err := h.sessionRepo.GetByRoomName(r.Context(), evt.Room.Name)
		if err == nil && session != nil && session.Status == domain.SessionStatusActive {
			h.tickerEngine.StartBillingTicker(r.Context(), session.LiveKitRoomName, session.ClientID.Hex(), session.MinuteRateCents)
		}

	case "room_finished":
		h.tickerEngine.StopBillingTicker(evt.Room.Name)
		_ = h.walletSvc.FinalizeRoomSession(r.Context(), evt.Room.Name, false)
	}

	response.Message(w, http.StatusOK, "Webhook processed successfully")
}
