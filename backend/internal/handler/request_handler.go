package handler

import (
	"encoding/json"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
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
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	var dto service.CreateSOSDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Payload inválido")
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
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	stack := r.URL.Query().Get("stack")

	var clientID *bson.ObjectID
	if user.Role != domain.RoleMentor && user.Role != domain.RoleAdmin {
		// Non-mentors (clients) can ONLY see their own open requests
		clientID = &user.ID
	}

	reqs, err := h.reqRepo.ListOpen(r.Context(), stack, clientID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Falha ao listar chamados abertos")
		return
	}

	response.JSON(w, http.StatusOK, reqs)
}

func (h *RequestHandler) ListMy(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	reqs, err := h.reqRepo.ListByClient(r.Context(), user.ID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Falha ao listar chamados do usuário")
		return
	}

	response.JSON(w, http.StatusOK, reqs)
}

func (h *RequestHandler) AcceptSOS(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	if user.Role != domain.RoleMentor && user.Role != domain.RoleAdmin {
		response.Error(w, http.StatusForbidden, "Apenas mentores podem aceitar chamados de mentoria")
		return
	}

	requestID := chi.URLParam(r, "id")
	if requestID == "" {
		response.Error(w, http.StatusBadRequest, "ID do chamado é obrigatório")
		return
	}

	res, err := h.matchmakerSvc.AcceptSOS(r.Context(), user, requestID)
	if err != nil {
		response.Error(w, http.StatusConflict, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, res)
}
