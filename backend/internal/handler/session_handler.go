package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/middleware"
	repoRedis "unblock-backend/internal/repository/redis"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SessionHandler struct {
	sessionRepo  domain.SessionRepository
	walletSvc    *service.WalletService
	tickerEngine *service.TickerEngine
	livekitSvc   *service.LiveKitService
	pubSubRepo   *repoRedis.PubSubRepository
}

func NewSessionHandler(
	sr domain.SessionRepository,
	ws *service.WalletService,
	te *service.TickerEngine,
	ls *service.LiveKitService,
	ps *repoRedis.PubSubRepository,
) *SessionHandler {
	return &SessionHandler{
		sessionRepo:  sr,
		walletSvc:    ws,
		tickerEngine: te,
		livekitSvc:   ls,
		pubSubRepo:   ps,
	}
}

func (h *SessionHandler) GetSession(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "ID de sessão inválido")
		return
	}

	session, err := h.sessionRepo.GetByID(r.Context(), oid)
	if err != nil || session == nil {
		// Fallback: check if the param is the request ID
		session, err = h.sessionRepo.GetByRequestID(r.Context(), oid)
		if err != nil || session == nil {
			response.Error(w, http.StatusNotFound, "Sessão não encontrada")
			return
		}
	}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	// Restrict access strictly to session participants
	if session.ClientID != user.ID && session.MentorID != user.ID && user.Role != domain.RoleAdmin {
		response.Error(w, http.StatusForbidden, "Acesso restrito: você não é participante desta mentoria")
		return
	}

	// Generate LiveKit token dynamically for user
	var liveKitToken string
	if h.livekitSvc != nil && session.LiveKitRoomName != "" {
		var lkErr error
		liveKitToken, lkErr = h.livekitSvc.GetRoomJoinToken(
			session.LiveKitRoomName,
			user.ID.Hex(),
			user.Name,
			user.Role == domain.RoleMentor,
		)
		if lkErr != nil {
			log.Printf("[LIVEKIT TOKEN ERROR] user=%s room=%s err=%v", user.Name, session.LiveKitRoomName, lkErr)
		}
	}

	respData := map[string]interface{}{
		"id":                session.ID.Hex(),
		"request_id":        session.RequestID.Hex(),
		"client_id":         session.ClientID.Hex(),
		"mentor_id":         session.MentorID.Hex(),
		"status":            session.Status,
		"minute_rate_cents": session.MinuteRateCents,
		"livekit_room_name": session.LiveKitRoomName,
		"livekit_token":     liveKitToken,
		"livekit_url":       "ws://localhost:7880",
		"yjs_doc_id":        session.YjsDocID,
		"code_snippet":      session.SavedCodeSnippet,
		"started_at":        session.StartedAt,
		"ended_at":          session.EndedAt,
		"duration_seconds":  session.DurationSeconds,
		"total_cost_cents":  session.FinancialSummary.TotalChargedCents,
		"is_mentor":         session.MentorID == user.ID,
		"is_client":         session.ClientID == user.ID,
	}

	log.Printf("[GET SESSION RESPDATA] id=%s token_len=%d room=%s is_client=%v is_mentor=%v", session.ID.Hex(), len(liveKitToken), session.LiveKitRoomName, session.ClientID == user.ID, session.MentorID == user.ID)

	response.JSON(w, http.StatusOK, respData)
}

func (h *SessionHandler) EndSession(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "ID de sessão inválido")
		return
	}

	session, err := h.sessionRepo.GetByID(r.Context(), oid)
	if err != nil || session == nil {
		response.Error(w, http.StatusNotFound, "Sessão não encontrada")
		return
	}

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	// Only participants can end the session
	if session.ClientID != user.ID && session.MentorID != user.ID && user.Role != domain.RoleAdmin {
		response.Error(w, http.StatusForbidden, "Permissão negada para encerrar sessão")
		return
	}

	// Stop billing ticker if running
	h.tickerEngine.StopBillingTicker(session.LiveKitRoomName)

	// Finalize session financial settlement
	if err := h.walletSvc.FinalizeRoomSession(r.Context(), session.LiveKitRoomName, false); err != nil {
		response.Error(w, http.StatusInternalServerError, "Erro ao liquidar sessão: "+err.Error())
		return
	}

	updated, _ := h.sessionRepo.GetByID(r.Context(), oid)

	// Notify room participants via PubSub
	if h.pubSubRepo != nil {
		endEvt := map[string]interface{}{
			"type":       "SESSION_ENDED",
			"session_id": session.ID.Hex(),
			"room_id":    session.LiveKitRoomName,
			"session":    updated,
		}
		endBytes, _ := json.Marshal(endEvt)
		_ = h.pubSubRepo.PublishSOS(r.Context(), string(endBytes))
	}

	response.JSON(w, http.StatusOK, updated)
}

type SaveCodeDTO struct {
	Code string `json:"code"`
}

func (h *SessionHandler) SaveCode(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "ID de sessão inválido")
		return
	}

	var dto SaveCodeDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Payload inválido")
		return
	}

	if err := h.sessionRepo.SaveCodeSnippet(r.Context(), oid, dto.Code); err != nil {
		response.Error(w, http.StatusInternalServerError, "Falha ao salvar snippet de código")
		return
	}

	response.Message(w, http.StatusOK, "Código salvo com sucesso")
}
