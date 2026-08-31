package service_test

import (
	"context"
	"testing"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockRequestRepo struct {
	requests map[string]*domain.Request
}

func newMockRequestRepo() *mockRequestRepo {
	return &mockRequestRepo{
		requests: make(map[string]*domain.Request),
	}
}

func (m *mockRequestRepo) Create(ctx context.Context, req *domain.Request) error {
	if req.ID.IsZero() {
		req.ID = bson.NewObjectID()
	}
	m.requests[req.ID.Hex()] = req
	return nil
}

func (m *mockRequestRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.Request, error) {
	if req, ok := m.requests[id.Hex()]; ok {
		return req, nil
	}
	return nil, nil
}

func (m *mockRequestRepo) ListOpen(ctx context.Context, stack string, clientID *bson.ObjectID) ([]*domain.Request, error) {
	var res []*domain.Request
	for _, req := range m.requests {
		if req.Status == domain.RequestStatusOpen {
			if clientID != nil && req.ClientID != *clientID {
				continue
			}
			res = append(res, req)
		}
	}
	return res, nil
}

func (m *mockRequestRepo) ListByClient(ctx context.Context, clientID bson.ObjectID) ([]*domain.Request, error) {
	var res []*domain.Request
	for _, req := range m.requests {
		if req.ClientID == clientID {
			res = append(res, req)
		}
	}
	return res, nil
}

func (m *mockRequestRepo) UpdateStatus(ctx context.Context, id bson.ObjectID, status domain.RequestStatus, mentorID *bson.ObjectID) error {
	if req, ok := m.requests[id.Hex()]; ok {
		req.Status = status
		req.AcceptedMentorID = mentorID
		return nil
	}
	return nil
}

func TestMatchmakerService_CreateSOS_InsufficientBalance(t *testing.T) {
	reqRepo := newMockRequestRepo()
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	userRepo := newMockUserRepo()
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")

	// Balance = 500 cents (R$ 5,00), but max rate is 300 cents/min -> 3 mins = 900 cents needed
	client := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Poor Dev",
		Email: "dev@poor.com",
		Role:  domain.RoleClient,
		Wallet: domain.Wallet{
			BalanceCents: 500,
			Currency:     "BRL",
		},
	}
	_ = userRepo.Create(context.Background(), client)

	matchmaker := service.NewMatchmakerService(reqRepo, sessRepo, userRepo, nil, nil, nil, livekitSvc)

	_, err := matchmaker.CreateSOS(context.Background(), client, service.CreateSOSDTO{
		Title:              "Deadlock bug",
		Description:        "Channel is blocking forever",
		Stack:              []string{"Go"},
		MaxMinuteRateCents: 300,
	})

	if err == nil {
		t.Fatal("Expected error due to insufficient balance, but got nil")
	}
}

func TestMatchmakerService_CreateSOS_Success(t *testing.T) {
	reqRepo := newMockRequestRepo()
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	userRepo := newMockUserRepo()
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")

	// Balance = 5000 cents (R$ 50,00), rate = 400 cents/min -> 3 mins = 1200 cents needed (ok)
	client := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Funded Dev",
		Email: "funded@dev.com",
		Role:  domain.RoleClient,
		Wallet: domain.Wallet{
			BalanceCents: 5000,
			Currency:     "BRL",
		},
	}
	_ = userRepo.Create(context.Background(), client)

	matchmaker := service.NewMatchmakerService(reqRepo, sessRepo, userRepo, nil, nil, nil, livekitSvc)

	req, err := matchmaker.CreateSOS(context.Background(), client, service.CreateSOSDTO{
		Title:              "Memory Leak in HTTP Handler",
		Description:        "Connections not closed properly",
		Stack:              []string{"Go", "Networking"},
		MaxMinuteRateCents: 400,
	})

	if err != nil {
		t.Fatalf("CreateSOS failed unexpectedly: %v", err)
	}

	if req.Status != domain.RequestStatusOpen {
		t.Errorf("Expected status OPEN, got %s", req.Status)
	}

	if req.ClientID != client.ID {
		t.Errorf("Expected ClientID %s, got %s", client.ID.Hex(), req.ClientID.Hex())
	}
}

func TestMatchmakerService_AcceptSOS_RoleValidation(t *testing.T) {
	reqRepo := newMockRequestRepo()
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	userRepo := newMockUserRepo()
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")

	// Client trying to accept a request should fail
	nonMentor := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Another Client",
		Email: "other@client.com",
		Role:  domain.RoleClient,
	}

	matchmaker := service.NewMatchmakerService(reqRepo, sessRepo, userRepo, nil, nil, nil, livekitSvc)

	_, err := matchmaker.AcceptSOS(context.Background(), nonMentor, bson.NewObjectID().Hex())
	if err == nil {
		t.Fatal("Expected error when non-mentor tries to accept SOS, got nil")
	}
}
