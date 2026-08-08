package handler

import (
	"encoding/json"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
)

type RequestHandler struct {
	matchmakerSvc *service.MatchmakerService
	reqRepo       domain.RequestRepository
}

func NewRequestHandler(ms *service.MatchmakerService, reqRepo domain.RequestRepository) *RequestHandler {
	return &RequestHandler{
		matchmakerSvc: ms,
		reqRepo:       reqRepo,
	}
}

func (h *RequestHandler) CreateSOS(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(*domain.User)
	if !ok || user == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var dto service.CreateSOSDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	req, err := h.matchmakerSvc.CreateSOS(r.Context(), user, dto)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, req)
}

func (h *RequestHandler) ListOpen(w http.ResponseWriter, r *http.Request) {
	stack := r.URL.Query().Get("stack")
	reqs, err := h.reqRepo.ListOpen(r.Context(), stack)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to list open requests")
		return
	}

	response.JSON(w, http.StatusOK, reqs)
}

func (h *RequestHandler) AcceptSOS(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(*domain.User)
	if !ok || user == nil {
		response.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	requestID := chi.URLParam(r, "id")
	if requestID == "" {
		response.Error(w, http.StatusBadRequest, "Request ID is required")
		return
	}

	res, err := h.matchmakerSvc.AcceptSOS(r.Context(), user, requestID)
	if err != nil {
		response.Error(w, http.StatusConflict, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, res)
}
