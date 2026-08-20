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
