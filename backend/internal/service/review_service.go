package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"unblock-backend/internal/domain"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ReviewService struct {
	reviewRepo  domain.ReviewRepository
	sessionRepo domain.SessionRepository
	userRepo    domain.UserRepository
}

func NewReviewService(
	reviewRepo domain.ReviewRepository,
	sessionRepo domain.SessionRepository,
	userRepo domain.UserRepository,
) *ReviewService {
	return &ReviewService{
		reviewRepo:  reviewRepo,
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
	}
}

func (s *ReviewService) CreateReview(ctx context.Context, clientID bson.ObjectID, sessionIDHex string, rating int, comment string) (*domain.Review, error) {
	if rating < 1 || rating > 5 {
		return nil, errors.New("a nota deve ser entre 1 e 5 estrelas")
	}

	sessionOID, err := bson.ObjectIDFromHex(sessionIDHex)
	if err != nil {
		return nil, errors.New("ID de sessão inválido")
	}

	session, err := s.sessionRepo.GetByID(ctx, sessionOID)
	if err != nil || session == nil {
		// Fallback to request id
		session, err = s.sessionRepo.GetByRequestID(ctx, sessionOID)
		if err != nil || session == nil {
			return nil, errors.New("sessão não encontrada")
		}
	}

	if session.ClientID != clientID {
		return nil, errors.New("apenas o desenvolvedor solicitante pode avaliar esta mentoria")
	}

	// Check if already reviewed
	existing, err := s.reviewRepo.GetBySessionID(ctx, session.ID)
	if err == nil && existing != nil {
		return nil, errors.New("esta mentoria já foi avaliada anteriormente")
	}

	review := &domain.Review{
		SessionID: session.ID,
		ClientID:  clientID,
		MentorID:  session.MentorID,
		Rating:    rating,
		Comment:   comment,
		CreatedAt: time.Now(),
	}

	if err := s.reviewRepo.Create(ctx, review); err != nil {
		return nil, fmt.Errorf("falha ao salvar avaliação: %w", err)
	}

	// Recalculate mentor rating
	reviews, err := s.reviewRepo.ListByMentorID(ctx, session.MentorID)
	if err == nil && len(reviews) > 0 {
		var sum int
		for _, r := range reviews {
			sum += r.Rating
		}
		avg := float64(sum) / float64(len(reviews))
		// round to 1 decimal place
		avg = math.Round(avg*10) / 10

		mentorUser, err := s.userRepo.GetByID(ctx, session.MentorID)
		if err == nil && mentorUser != nil && mentorUser.MentorProfile != nil {
			mentorUser.MentorProfile.RatingAvg = avg
			mentorUser.MentorProfile.TotalRatings = len(reviews)
			_ = s.userRepo.Update(ctx, mentorUser)
		}
	}

	return review, nil
}

func (s *ReviewService) GetSessionReview(ctx context.Context, sessionIDHex string) (*domain.Review, error) {
	sessionOID, err := bson.ObjectIDFromHex(sessionIDHex)
	if err != nil {
		return nil, errors.New("ID de sessão inválido")
	}

	session, _ := s.sessionRepo.GetByID(ctx, sessionOID)
	if session == nil {
		session, _ = s.sessionRepo.GetByRequestID(ctx, sessionOID)
	}

	var targetID bson.ObjectID
	if session != nil {
		targetID = session.ID
	} else {
		targetID = sessionOID
	}

	return s.reviewRepo.GetBySessionID(ctx, targetID)
}

func (s *ReviewService) ListMentorReviews(ctx context.Context, mentorIDHex string) ([]*domain.Review, error) {
	mentorOID, err := bson.ObjectIDFromHex(mentorIDHex)
	if err != nil {
		return nil, errors.New("ID de mentor inválido")
	}

	return s.reviewRepo.ListByMentorID(ctx, mentorOID)
}
