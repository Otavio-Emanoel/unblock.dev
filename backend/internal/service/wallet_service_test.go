package service_test

import (
	"context"
	"testing"
	"time"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type mockTxRepo struct {
	txs []*domain.Transaction
}

func (m *mockTxRepo) Create(ctx context.Context, tx *domain.Transaction) error {
	if tx.ID.IsZero() {
		tx.ID = bson.NewObjectID()
	}
	m.txs = append(m.txs, tx)
	return nil
}

func (m *mockTxRepo) ListByUserID(ctx context.Context, userID bson.ObjectID) ([]*domain.Transaction, error) {
	var res []*domain.Transaction
	for _, tx := range m.txs {
		if tx.UserID == userID {
			res = append(res, tx)
		}
	}
	return res, nil
}

type mockSessionRepo struct {
	sessions map[string]*domain.Session
}

func (m *mockSessionRepo) Create(ctx context.Context, session *domain.Session) error {
	if session.ID.IsZero() {
		session.ID = bson.NewObjectID()
	}
	m.sessions[session.LiveKitRoomName] = session
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
	if s, ok := m.sessions[roomName]; ok {
		return s, nil
	}
	return nil, nil
}

func (m *mockSessionRepo) ListByUser(ctx context.Context, userID bson.ObjectID) ([]*domain.Session, error) {
	var res []*domain.Session
	for _, s := range m.sessions {
		if s.ClientID == userID || s.MentorID == userID {
			res = append(res, s)
		}
	}
	return res, nil
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

func TestWalletService_DepositCredits(t *testing.T) {
	userRepo := newMockUserRepo()
	txRepo := &mockTxRepo{}
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}

	ctx := context.Background()

	// Create user
	user := &domain.User{
		Name:  "Client User",
		Email: "client@test.dev",
		Role:  domain.RoleClient,
		Wallet: domain.Wallet{
			BalanceCents: 1000,
			Currency:     "BRL",
		},
	}
	_ = userRepo.Create(ctx, user)

	walletSvc := service.NewWalletService(userRepo, sessRepo, txRepo, nil, nil, 20)

	// Deposit R$ 50,00 (5000 cents)
	tx, err := walletSvc.DepositCredits(ctx, user.ID.Hex(), 5000, "PIX", "ext_123")
	if err != nil {
		t.Fatalf("Deposit failed: %v", err)
	}

	if tx.AmountCents != 5000 {
		t.Errorf("Expected tx amount 5000, got %d", tx.AmountCents)
	}

	// Verify balance updated
	updatedUser, _ := userRepo.GetByID(ctx, user.ID)
	if updatedUser.Wallet.BalanceCents != 6000 {
		t.Errorf("Expected balance 6000, got %d", updatedUser.Wallet.BalanceCents)
	}
}

func TestWalletService_FinalizeRoomSession(t *testing.T) {
	userRepo := newMockUserRepo()
	txRepo := &mockTxRepo{}
	sessRepo := &mockSessionRepo{sessions: make(map[string]*domain.Session)}

	ctx := context.Background()

	clientID := bson.NewObjectID()
	mentorID := bson.NewObjectID()

	client := &domain.User{
		ID:    clientID,
		Name:  "Dev Client",
		Email: "dev@test.dev",
		Role:  domain.RoleClient,
		Wallet: domain.Wallet{
			BalanceCents: 5000,
			Currency:     "BRL",
		},
	}
	mentor := &domain.User{
		ID:    mentorID,
		Name:  "Senior Mentor",
		Email: "mentor@test.dev",
		Role:  domain.RoleMentor,
		Wallet: domain.Wallet{
			BalanceCents: 1000,
			Currency:     "BRL",
		},
	}
	_ = userRepo.Create(ctx, client)
	_ = userRepo.Create(ctx, mentor)

	roomName := "room_test_finalize"
	startedAt := time.Now().Add(-130 * time.Second) // 2m 10s -> 3 minutes billed
	session := &domain.Session{
		ID:              bson.NewObjectID(),
		ClientID:        clientID,
		MentorID:        mentorID,
		MinuteRateCents: 300, // R$ 3,00 / min
		Status:          domain.SessionStatusActive,
		LiveKitRoomName: roomName,
		StartedAt:       startedAt,
	}
	_ = sessRepo.Create(ctx, session)

	walletSvc := service.NewWalletService(userRepo, sessRepo, txRepo, nil, nil, 20)

	// Finalize Session
	err := walletSvc.FinalizeRoomSession(ctx, roomName, false)
	if err != nil {
		t.Fatalf("FinalizeRoomSession failed: %v", err)
	}

	// 3 minutes * 300 cents = 900 cents total
	// Platform fee (20%) = 180 cents
	// Mentor earnings = 720 cents
	updatedClient, _ := userRepo.GetByID(ctx, clientID)
	if updatedClient.Wallet.BalanceCents != 4100 { // 5000 - 900
		t.Errorf("Expected client balance 4100, got %d", updatedClient.Wallet.BalanceCents)
	}

	updatedMentor, _ := userRepo.GetByID(ctx, mentorID)
	if updatedMentor.Wallet.BalanceCents != 1720 { // 1000 + 720
		t.Errorf("Expected mentor balance 1720, got %d", updatedMentor.Wallet.BalanceCents)
	}

	// Check transactions created
	clientTxs, _ := txRepo.ListByUserID(ctx, clientID)
	if len(clientTxs) != 1 || clientTxs[0].AmountCents != -900 {
		t.Errorf("Expected client debit transaction of -900, got %+v", clientTxs)
	}

	mentorTxs, _ := txRepo.ListByUserID(ctx, mentorID)
	if len(mentorTxs) != 1 || mentorTxs[0].AmountCents != 720 {
		t.Errorf("Expected mentor payout transaction of 720, got %+v", mentorTxs)
	}
}
