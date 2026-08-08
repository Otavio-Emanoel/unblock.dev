package handler

import (
	"encoding/json"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SessionHandler struct {
	sessionRepo  domain.SessionRepository
	walletSvc    *service.WalletService
	tickerEngine *service.TickerEngine
}

func NewSessionHandler(sr domain.SessionRepository, ws *service.WalletService, te *service.TickerEngine) *SessionHandler {
	return &SessionHandler{
		sessionRepo:  sr,
		walletSvc:    ws,
		tickerEngine: te,
	}
}

func (h *SessionHandler) GetSession(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid session ID")
		return
	}

	session, err := h.sessionRepo.GetByID(r.Context(), oid)
	if err != nil || session == nil {
		response.Error(w, http.StatusNotFound, "Session not found")
		return
	}

	response.JSON(w, http.StatusOK, session)
}

func (h *SessionHandler) EndSession(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid session ID")
		return
	}

	session, err := h.sessionRepo.GetByID(r.Context(), oid)
	if err != nil || session == nil {
		response.Error(w, http.StatusNotFound, "Session not found")
		return
	}

	// Stop billing ticker if running
	h.tickerEngine.StopBillingTicker(session.LiveKitRoomName)

	// Finalize session settlement
	if err := h.walletSvc.FinalizeRoomSession(r.Context(), session.LiveKitRoomName, false); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to finalize session: "+err.Error())
		return
	}

	updated, _ := h.sessionRepo.GetByID(r.Context(), oid)
	response.JSON(w, http.StatusOK, updated)
}

type SaveCodeDTO struct {
	Code string `json:"code"`
}

func (h *SessionHandler) SaveCode(w http.ResponseWriter, r *http.Request) {
	idHex := chi.URLParam(r, "id")
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid session ID")
		return
	}

	var dto SaveCodeDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.sessionRepo.SaveCodeSnippet(r.Context(), oid, dto.Code); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to save code snippet")
		return
	}

	response.Message(w, http.StatusOK, "Code snippet saved successfully")
}
