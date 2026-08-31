package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/handler"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockUserRepoForAuth struct {
	users map[string]*domain.User
}

func newMockUserRepoForAuth() *mockUserRepoForAuth {
	return &mockUserRepoForAuth{users: make(map[string]*domain.User)}
}

func (m *mockUserRepoForAuth) Create(ctx context.Context, user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepoForAuth) GetByID(ctx context.Context, id bson.ObjectID) (*domain.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, nil
}

func (m *mockUserRepoForAuth) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if u, ok := m.users[email]; ok {
		return u, nil
	}
	return nil, nil
}

func (m *mockUserRepoForAuth) Update(ctx context.Context, user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepoForAuth) UpdateBalance(ctx context.Context, userID bson.ObjectID, amountCents int64) error {
	return nil
}

func (m *mockUserRepoForAuth) SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error {
	for _, u := range m.users {
		if u.ID == mentorID {
			if u.MentorProfile != nil {
				u.MentorProfile.IsOnline = isOnline
			}
			return nil
		}
	}
	return nil
}

func (m *mockUserRepoForAuth) ListOnlineMentors(ctx context.Context, skill string) ([]*domain.User, error) {
	return nil, nil
}

func TestAuthHandler_UpdateMentorOnline_RoleValidation(t *testing.T) {
	userRepo := newMockUserRepoForAuth()
	authSvc := service.NewAuthService(userRepo, "testsecret12345678901234567890")
	h := handler.NewAuthHandler(authSvc)

	r := chi.NewRouter()
	r.Put("/api/auth/mentor/online", h.UpdateMentorOnline)

	// Non-mentor tries to set online status
	client := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Dev Client",
		Role:  domain.RoleClient,
		Email: "dev@client.com",
	}

	payload := map[string]bool{"is_online": true}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("PUT", "/api/auth/mentor/online", bytes.NewReader(body))
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, client)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for non-mentor updating online status, got %d", rr.Code)
	}
}

func TestAuthHandler_UpdateMentorOnline_Success(t *testing.T) {
	userRepo := newMockUserRepoForAuth()
	mentorID := bson.NewObjectID()
	mentor := &domain.User{
		ID:    mentorID,
		Name:  "Senior Mentor",
		Role:  domain.RoleMentor,
		Email: "mentor@senior.dev",
		MentorProfile: &domain.MentorProfile{
			IsOnline:        false,
			MinuteRateCents: 300,
		},
	}
	_ = userRepo.Create(context.Background(), mentor)

	authSvc := service.NewAuthService(userRepo, "testsecret12345678901234567890")
	h := handler.NewAuthHandler(authSvc)

	r := chi.NewRouter()
	r.Put("/api/auth/mentor/online", h.UpdateMentorOnline)

	payload := map[string]bool{"is_online": true}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("PUT", "/api/auth/mentor/online", bytes.NewReader(body))
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, mentor)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	if !mentor.MentorProfile.IsOnline {
		t.Error("Expected mentor is_online to be true after update")
	}
}
