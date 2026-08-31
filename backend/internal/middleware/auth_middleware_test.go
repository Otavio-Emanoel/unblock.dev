package middleware_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockUserRepo struct {
	users map[string]*domain.User
}

func (m *mockUserRepo) Create(ctx context.Context, user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	if u, ok := m.users[email]; ok {
		return u, nil
	}
	return nil, nil
}

func (m *mockUserRepo) Update(ctx context.Context, user *domain.User) error {
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) UpdateBalance(ctx context.Context, userID bson.ObjectID, amountCents int64) error {
	return nil
}

func (m *mockUserRepo) SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error {
	return nil
}

func (m *mockUserRepo) ListOnlineMentors(ctx context.Context, skill string) ([]*domain.User, error) {
	return nil, nil
}

func TestAuthMiddleware_Protect_MissingHeader(t *testing.T) {
	authSvc := service.NewAuthService(&mockUserRepo{users: make(map[string]*domain.User)}, "testsecret")
	mw := middleware.NewAuthMiddleware(authSvc)

	nextCalled := false
	handler := mw.Protect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	}))

	req := httptest.NewRequest("GET", "/protected", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized, got %d", rr.Code)
	}
	if nextCalled {
		t.Error("Expected next handler NOT to be called")
	}
}

func TestAuthMiddleware_Protect_ValidToken(t *testing.T) {
	user := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Test Dev",
		Email: "dev@test.dev",
		Role:  domain.RoleClient,
	}

	repo := &mockUserRepo{users: map[string]*domain.User{user.Email: user}}
	authSvc := service.NewAuthService(repo, "testsecret12345678901234567890")
	mw := middleware.NewAuthMiddleware(authSvc)

	token, err := authSvc.GenerateToken(user)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	var capturedUser *domain.User
	handler := mw.Protect(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUser = middleware.GetUserFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}
	if capturedUser == nil || capturedUser.ID != user.ID {
		t.Errorf("Expected user from context to match %s, got %+v", user.ID.Hex(), capturedUser)
	}
}
