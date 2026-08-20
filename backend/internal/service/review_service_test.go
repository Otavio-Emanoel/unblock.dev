package service_test

import (
	"context"
	"testing"
	"time"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockReviewRepo struct {
	reviews []*domain.Review
}

func (m *mockReviewRepo) Create(ctx context.Context, review *domain.Review) error {
	if review.ID.IsZero() {
		review.ID = bson.NewObjectID()
	}
	m.reviews = append(m.reviews, review)
	return nil
}

func (m *mockReviewRepo) GetBySessionID(ctx context.Context, sessionID bson.ObjectID) (*domain.Review, error) {
	for _, r := range m.reviews {
		if r.SessionID == sessionID {
			return r, nil
		}
	}
	return nil, nil
}

func (m *mockReviewRepo) ListByMentorID(ctx context.Context, mentorID bson.ObjectID) ([]*domain.Review, error) {
	var res []*domain.Review
	for _, r := range m.reviews {
		if r.MentorID == mentorID {
			res = append(res, r)
		}
	}
	return res, nil
}

func TestReviewService_CreateReview(t *testing.T) {
	ctx := context.Background()

	clientOID := bson.NewObjectID()
	mentorOID := bson.NewObjectID()
	sessionOID := bson.NewObjectID()

	userRepo := newMockUserRepo()
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	reviewRepo := &mockReviewRepo{}

	// Setup Mentor User
	mentor := &domain.User{
		ID:    mentorOID,
		Name:  "Alex Mentor",
		Email: "alex@unblock.dev",
		Role:  domain.RoleMentor,
		MentorProfile: &domain.MentorProfile{
			MinuteRateCents: 350,
			Skills:          []string{"Go", "Docker"},
			RatingAvg:       0,
			TotalRatings:    0,
		},
	}
	_ = userRepo.Create(ctx, mentor)

	// Setup Session
	session := &domain.Session{
		ID:              sessionOID,
		RequestID:       sessionOID,
		ClientID:        clientOID,
		MentorID:        mentorOID,
		MinuteRateCents: 350,
		Status:          domain.SessionStatusCompleted,
		StartedAt:       time.Now().Add(-10 * time.Minute),
	}
	sessRepo.sessions[sessionOID.Hex()] = session

	reviewSvc := service.NewReviewService(reviewRepo, sessRepo, userRepo)

	// 1. Invalid Rating
	_, err := reviewSvc.CreateReview(ctx, clientOID, sessionOID.Hex(), 0, "Ruim")
	if err == nil {
		t.Error("Expected error for rating 0")
	}

	_, err = reviewSvc.CreateReview(ctx, clientOID, sessionOID.Hex(), 6, "Muito bom")
	if err == nil {
		t.Error("Expected error for rating 6")
	}

	// 2. Non-client cannot review
	otherOID := bson.NewObjectID()
	_, err = reviewSvc.CreateReview(ctx, otherOID, sessionOID.Hex(), 5, "Excelente!")
	if err == nil {
		t.Error("Expected error for non-client user")
	}

	// 3. Valid Review
	rev, err := reviewSvc.CreateReview(ctx, clientOID, sessionOID.Hex(), 5, "Excelente mentoria!")
	if err != nil {
		t.Fatalf("CreateReview failed: %v", err)
	}

	if rev.Rating != 5 {
		t.Errorf("Expected rating 5, got %d", rev.Rating)
	}

	// Verify mentor rating updated
	updatedMentor, _ := userRepo.GetByID(ctx, mentorOID)
	if updatedMentor.MentorProfile.RatingAvg != 5.0 {
		t.Errorf("Expected mentor rating avg 5.0, got %f", updatedMentor.MentorProfile.RatingAvg)
	}
	if updatedMentor.MentorProfile.TotalRatings != 1 {
		t.Errorf("Expected mentor total ratings 1, got %d", updatedMentor.MentorProfile.TotalRatings)
	}

	// 4. Duplicate review fails
	_, err = reviewSvc.CreateReview(ctx, clientOID, sessionOID.Hex(), 4, "Tentando de novo")
	if err == nil {
		t.Error("Expected error for duplicate review on same session")
	}
}
