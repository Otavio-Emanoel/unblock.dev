package handler

import (
	"encoding/json"
	"net/http"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
)

type ReviewHandler struct {
	reviewSvc *service.ReviewService
}

func NewReviewHandler(reviewSvc *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviewSvc: reviewSvc}
}

type CreateReviewDTO struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

func (h *ReviewHandler) CreateReview(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")

	user := middleware.GetUserFromContext(r.Context())
	if user == nil {
		response.Error(w, http.StatusUnauthorized, "Não autenticado")
		return
	}

	var dto CreateReviewDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		response.Error(w, http.StatusBadRequest, "Payload de avaliação inválido")
		return
	}

	review, err := h.reviewSvc.CreateReview(r.Context(), user.ID, sessionID, dto.Rating, dto.Comment)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, review)
}

func (h *ReviewHandler) GetSessionReview(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")

	review, err := h.reviewSvc.GetSessionReview(r.Context(), sessionID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, review)
}

func (h *ReviewHandler) ListMentorReviews(w http.ResponseWriter, r *http.Request) {
	mentorID := chi.URLParam(r, "id")

	reviews, err := h.reviewSvc.ListMentorReviews(r.Context(), mentorID)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if reviews == nil {
		reviews = []*domain.Review{}
	}

	response.JSON(w, http.StatusOK, reviews)
}
