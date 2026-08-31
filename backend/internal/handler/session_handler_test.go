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

type mockSessionRepo struct {
	sessions map[string]*domain.Session
}

func (m *mockSessionRepo) Create(ctx context.Context, session *domain.Session) error {
	m.sessions[session.ID.Hex()] = session
	return nil
}

func (m *mockSessionRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.Session, error) {
	for _, s := range m.sessions {
		if s.ID == id {
			return s, nil
		}
	}
	return nil, nil
}

func (m *mockSessionRepo) GetByRequestID(ctx context.Context, requestID bson.ObjectID) (*domain.Session, error) {
	for _, s := range m.sessions {
		if s.RequestID == requestID {
			return s, nil
		}
	}
	return nil, nil
}

func (m *mockSessionRepo) GetByRoomName(ctx context.Context, roomName string) (*domain.Session, error) {
	for _, s := range m.sessions {
		if s.LiveKitRoomName == roomName {
			return s, nil
		}
	}
	return nil, nil
}

func (m *mockSessionRepo) ListByUser(ctx context.Context, userID bson.ObjectID) ([]*domain.Session, error) {
	return nil, nil
}

func (m *mockSessionRepo) SaveCodeSnippet(ctx context.Context, id bson.ObjectID, code string) error {
	for _, s := range m.sessions {
		if s.ID == id {
			s.SavedCodeSnippet = code
			return nil
		}
	}
	return nil
}

func (m *mockSessionRepo) CompleteSession(ctx context.Context, id bson.ObjectID, status domain.SessionStatus, endedAt time.Time, durationSec int64, summary domain.FinancialSummary) error {
	for _, s := range m.sessions {
		if s.ID == id {
			s.Status = status
			s.EndedAt = &endedAt
			s.DurationSeconds = durationSec
			s.FinancialSummary = summary
			return nil
		}
	}
	return nil
}

func TestSessionHandler_SaveCode_IDORProtection(t *testing.T) {
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	clientID := bson.NewObjectID()
	mentorID := bson.NewObjectID()
	intruderID := bson.NewObjectID()

	session := &domain.Session{
		ID:              bson.NewObjectID(),
		ClientID:        clientID,
		MentorID:        mentorID,
		Status:          domain.SessionStatusActive,
		LiveKitRoomName: "room_idor_test",
	}
	sessRepo.sessions[session.ID.Hex()] = session

	h := handler.NewSessionHandler(sessRepo, nil, nil, nil, nil)

	r := chi.NewRouter()
	r.Put("/api/sessions/{id}/code", h.SaveCode)

	payload := map[string]string{"code": "malicious code injection"}
	bodyBytes, _ := json.Marshal(payload)

	// An intruder user who is neither client nor mentor tries to save code
	intruder := &domain.User{
		ID:    intruderID,
		Name:  "Intruder Dev",
		Role:  domain.RoleClient,
		Email: "intruder@hacker.dev",
	}

	req := httptest.NewRequest("PUT", "/api/sessions/"+session.ID.Hex()+"/code", bytes.NewReader(bodyBytes))
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, intruder)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for non-participant user, got %d", rr.Code)
	}
}

func TestSessionHandler_SaveCode_ParticipantSuccess(t *testing.T) {
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	clientID := bson.NewObjectID()
	mentorID := bson.NewObjectID()

	session := &domain.Session{
		ID:              bson.NewObjectID(),
		ClientID:        clientID,
		MentorID:        mentorID,
		Status:          domain.SessionStatusActive,
		LiveKitRoomName: "room_success_test",
	}
	sessRepo.sessions[session.ID.Hex()] = session

	h := handler.NewSessionHandler(sessRepo, nil, nil, nil, nil)

	r := chi.NewRouter()
	r.Put("/api/sessions/{id}/code", h.SaveCode)

	codeContent := `[{"id":"main-go","name":"main.go","content":"package main"}]`
	payload := map[string]string{"code": codeContent}
	bodyBytes, _ := json.Marshal(payload)

	client := &domain.User{
		ID:    clientID,
		Name:  "Legit Dev",
		Role:  domain.RoleClient,
		Email: "legit@test.dev",
	}

	req := httptest.NewRequest("PUT", "/api/sessions/"+session.ID.Hex()+"/code", bytes.NewReader(bodyBytes))
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, client)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}

	if session.SavedCodeSnippet != codeContent {
		t.Errorf("Expected saved code snippet to match, got %s", session.SavedCodeSnippet)
	}
}

func TestSessionHandler_GetSession_ParticipantAccess(t *testing.T) {
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}
	clientID := bson.NewObjectID()
	mentorID := bson.NewObjectID()
	livekitSvc := service.NewLiveKitService("devkey", "secret", "http://localhost:7880")

	session := &domain.Session{
		ID:              bson.NewObjectID(),
		ClientID:        clientID,
		MentorID:        mentorID,
		MinuteRateCents: 350,
		Status:          domain.SessionStatusActive,
		LiveKitRoomName: "room_get_test",
	}
	sessRepo.sessions[session.ID.Hex()] = session

	h := handler.NewSessionHandler(sessRepo, nil, nil, livekitSvc, nil)

	r := chi.NewRouter()
	r.Get("/api/sessions/{id}", h.GetSession)

	client := &domain.User{
		ID:    clientID,
		Name:  "Dev Tester",
		Role:  domain.RoleClient,
		Email: "dev@test.dev",
	}

	req := httptest.NewRequest("GET", "/api/sessions/"+session.ID.Hex(), nil)
	ctx := context.WithValue(req.Context(), middleware.UserContextKey, client)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rr.Code)
	}

	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	data := resp["data"].(map[string]interface{})
	if data["id"] != session.ID.Hex() {
		t.Errorf("Expected session ID %s, got %v", session.ID.Hex(), data["id"])
	}
	if data["is_client"] != true {
		t.Errorf("Expected is_client to be true, got %v", data["is_client"])
	}
	if data["livekit_token"] == "" {
		t.Error("Expected non-empty livekit_token in response")
	}
}
