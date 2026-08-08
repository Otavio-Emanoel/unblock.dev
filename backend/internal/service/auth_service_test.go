package service_test

import (
	"context"
	"testing"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockUserRepo struct {
	users map[string]*domain.User
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]*domain.User)}
}

func (m *mockUserRepo) Create(ctx context.Context, user *domain.User) error {
	if user.ID.IsZero() {
		user.ID = bson.NewObjectID()
	}
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
	for _, u := range m.users {
		if u.ID == userID {
			u.Wallet.BalanceCents += amountCents
			return nil
		}
	}
	return nil
}

func (m *mockUserRepo) SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error {
	for _, u := range m.users {
		if u.ID == mentorID && u.MentorProfile != nil {
			u.MentorProfile.IsOnline = isOnline
			return nil
		}
	}
	return nil
}

func (m *mockUserRepo) ListOnlineMentors(ctx context.Context, skill string) ([]*domain.User, error) {
	var res []*domain.User
	for _, u := range m.users {
		if u.Role == domain.RoleMentor && u.MentorProfile != nil && u.MentorProfile.IsOnline {
			res = append(res, u)
		}
	}
	return res, nil
}

func TestAuthService_RegisterAndLogin(t *testing.T) {
	repo := newMockUserRepo()
	jwtSecret := "supersecretjwtkey_test_123"
	authSvc := service.NewAuthService(repo, jwtSecret)

	ctx := context.Background()

	// 1. Register Client
	regDTO := service.RegisterDTO{
		Name:     "Test User",
		Email:    "test@unblock.dev",
		Password: "password123",
		Role:     domain.RoleClient,
	}

	res, err := authSvc.Register(ctx, regDTO)
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}

	if res.Token == "" {
		t.Errorf("Expected non-empty JWT token")
	}
	if res.User.Email != "test@unblock.dev" {
		t.Errorf("Unexpected user email: %s", res.User.Email)
	}

	// 2. Validate Token
	claims, err := authSvc.ValidateToken(res.Token)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}
	if claims.Email != "test@unblock.dev" {
		t.Errorf("Unexpected claim email: %s", claims.Email)
	}

	// 3. Login
	loginRes, err := authSvc.Login(ctx, "test@unblock.dev", "password123")
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}
	if loginRes.Token == "" {
		t.Errorf("Expected token on login")
	}

	// 4. Invalid Password Login
	_, err = authSvc.Login(ctx, "test@unblock.dev", "wrongpassword")
	if err == nil {
		t.Errorf("Expected error for wrong password, got nil")
	}
}
