package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/handler"
	"unblock-backend/internal/middleware"
	"unblock-backend/internal/service"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockRequestRepo struct {
	requests map[string]*domain.Request
}

func (m *mockRequestRepo) Create(ctx context.Context, req *domain.Request) error {
	if req.ID.IsZero() {
		req.ID = bson.NewObjectID()
	}
	m.requests[req.ID.Hex()] = req
	return nil
}

func (m *mockRequestRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.Request, error) {
	if r, ok := m.requests[id.Hex()]; ok {
		return r, nil
	}
	return nil, nil
}

func (m *mockRequestRepo) ListOpen(ctx context.Context, stack string, clientID *bson.ObjectID) ([]*domain.Request, error) {
	var res []*domain.Request
	for _, r := range m.requests {
		if r.Status == domain.RequestStatusOpen {
			if clientID != nil && r.ClientID != *clientID {
				continue
			}
			res = append(res, r)
		}
	}
	return res, nil
}

func (m *mockRequestRepo) ListByClient(ctx context.Context, clientID bson.ObjectID) ([]*domain.Request, error) {
	var res []*domain.Request
	for _, r := range m.requests {
		if r.ClientID == clientID {
			res = append(res, r)
		}
	}
	return res, nil
}

func (m *mockRequestRepo) UpdateStatus(ctx context.Context, id bson.ObjectID, status domain.RequestStatus, mentorID *bson.ObjectID) error {
	if r, ok := m.requests[id.Hex()]; ok {
		r.Status = status
		r.AcceptedMentorID = mentorID
	}
	return nil
}

func TestRequestHandler_AcceptSOS_RoleRestricted(t *testing.T) {
	reqRepo := &mockRequestRepo{requests: make(map[string]*domain.Request)}
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")
	ms := service.NewMatchmakerService(reqRepo, sessRepo, nil, nil, nil, nil, livekitSvc)

	h := handler.NewRequestHandler(ms, reqRepo)

	r := chi.NewRouter()
	r.Post("/api/requests/{id}/accept", h.AcceptSOS)

	// Client user tries to accept SOS
	clientUser := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Regular Dev",
		Role:  domain.RoleClient,
		Email: "dev@client.com",
	}

	req := httptest.NewRequest("POST", "/api/requests/"+bson.NewObjectID().Hex()+"/accept", nil)
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, clientUser)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for non-mentor accepting SOS, got %d", rr.Code)
	}
}

func TestRequestHandler_CreateSOS_Success(t *testing.T) {
	reqRepo := &mockRequestRepo{requests: make(map[string]*domain.Request)}
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")
	ms := service.NewMatchmakerService(reqRepo, sessRepo, nil, nil, nil, nil, livekitSvc)

	h := handler.NewRequestHandler(ms, reqRepo)

	r := chi.NewRouter()
	r.Post("/api/requests", h.CreateSOS)

	clientUser := &domain.User{
		ID:    bson.NewObjectID(),
		Name:  "Funded Dev",
		Role:  domain.RoleClient,
		Email: "dev@test.dev",
		Wallet: domain.Wallet{
			BalanceCents: 10000,
			Currency:     "BRL",
		},
	}

	dto := map[string]interface{}{
		"title":                 "Bug de concorrência com canais",
		"description":           "Canais bloqueando sem envio",
		"stack":                 []string{"Go", "Goroutines"},
		"max_minute_rate_cents": 350,
	}
	body, _ := json.Marshal(dto)

	req := httptest.NewRequest("POST", "/api/requests", bytes.NewReader(body))
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, clientUser)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var resp map[string]interface{}
	_ = json.NewDecoder(rr.Body).Decode(&resp)
	data := resp["data"].(map[string]interface{})
	if data["title"] != "Bug de concorrência com canais" {
		t.Errorf("Expected title match, got %v", data["title"])
	}
}

func TestRequestHandler_ListOpen_FiltersClientRequests(t *testing.T) {
	reqRepo := &mockRequestRepo{requests: make(map[string]*domain.Request)}
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")
	ms := service.NewMatchmakerService(reqRepo, sessRepo, nil, nil, nil, nil, livekitSvc)

	client1ID := bson.NewObjectID()
	client2ID := bson.NewObjectID()

	req1 := &domain.Request{
		ID:                 bson.NewObjectID(),
		ClientID:           client1ID,
		Title:              "SOS Client 1",
		Status:             domain.RequestStatusOpen,
		MaxMinuteRateCents: 300,
		CreatedAt:          time.Now(),
	}
	req2 := &domain.Request{
		ID:                 bson.NewObjectID(),
		ClientID:           client2ID,
		Title:              "SOS Client 2",
		Status:             domain.RequestStatusOpen,
		MaxMinuteRateCents: 400,
		CreatedAt:          time.Now(),
	}
	reqRepo.requests[req1.ID.Hex()] = req1
	reqRepo.requests[req2.ID.Hex()] = req2

	h := handler.NewRequestHandler(ms, reqRepo)

	r := chi.NewRouter()
	r.Get("/api/requests/open", h.ListOpen)

	// 1. Client 1 requests open tickets: should ONLY see their own
	client1 := &domain.User{
		ID:    client1ID,
		Role:  domain.RoleClient,
		Email: "client1@test.dev",
	}
	req := httptest.NewRequest("GET", "/api/requests/open", nil)
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, client1)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	var resp1 map[string]interface{}
	_ = json.NewDecoder(rr.Body).Decode(&resp1)
	data1 := resp1["data"].([]interface{})
	if len(data1) != 1 {
		t.Errorf("Expected client to see only 1 open request, got %d", len(data1))
	}

	// 2. Mentor requests open tickets: should see ALL open requests
	mentor := &domain.User{
		ID:    bson.NewObjectID(),
		Role:  domain.RoleMentor,
		Email: "mentor@test.dev",
	}
	reqMentor := httptest.NewRequest("GET", "/api/requests/open", nil)
	ctxMentor := context.WithValue(reqMentor.Context(), middleware.UserContextKey, mentor)
	reqMentor = reqMentor.WithContext(ctxMentor)

	rrMentor := httptest.NewRecorder()
	r.ServeHTTP(rrMentor, reqMentor)

	var respMentor map[string]interface{}
	_ = json.NewDecoder(rrMentor.Body).Decode(&respMentor)
	dataMentor := respMentor["data"].([]interface{})
	if len(dataMentor) != 2 {
		t.Errorf("Expected mentor to see all 2 open requests, got %d", len(dataMentor))
	}
}
