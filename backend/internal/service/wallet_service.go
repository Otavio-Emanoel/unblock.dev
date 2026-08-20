package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"unblock-backend/internal/domain"
	repoMongo "unblock-backend/internal/repository/mongodb"
	repoRedis "unblock-backend/internal/repository/redis"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type WalletService struct {
	userRepo        domain.UserRepository
	sessionRepo     domain.SessionRepository
	txRepo          domain.TransactionRepository
	balanceCache    *repoRedis.BalanceCache
	mongoClient     *repoMongo.Client
	platformFeePerc int
}

func NewWalletService(
	userRepo domain.UserRepository,
	sessionRepo domain.SessionRepository,
	txRepo domain.TransactionRepository,
	balanceCache *repoRedis.BalanceCache,
	mongoClient *repoMongo.Client,
	platformFeePerc int,
) *WalletService {
	return &WalletService{
		userRepo:        userRepo,
		sessionRepo:     sessionRepo,
		txRepo:          txRepo,
		balanceCache:    balanceCache,
		mongoClient:     mongoClient,
		platformFeePerc: platformFeePerc,
	}
}

func (s *WalletService) GetUserBalance(ctx context.Context, userID bson.ObjectID) (int64, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil || user == nil {
		return 0, errors.New("user not found")
	}
	return user.Wallet.BalanceCents, nil
}

func (s *WalletService) DepositCredits(ctx context.Context, userIDHex string, amountCents int64, gateway, paymentExtID string) (*domain.Transaction, error) {
	if amountCents <= 0 {
		return nil, errors.New("o valor do depósito deve ser maior que zero")
	}
	if amountCents > 1000000 { // Max R$ 10,000.00
		return nil, errors.New("o valor do depósito excede o limite máximo permitido de R$ 10.000,00")
	}

	uid, err := bson.ObjectIDFromHex(userIDHex)
	if err != nil {
		return nil, errors.New("ID de usuário inválido")
	}

	user, err := s.userRepo.GetByID(ctx, uid)
	if err != nil || user == nil {
		return nil, errors.New("usuário não encontrado")
	}

	newBalance := user.Wallet.BalanceCents + amountCents

	// Update DB balance
	if err := s.userRepo.UpdateBalance(ctx, uid, amountCents); err != nil {
		return nil, fmt.Errorf("failed to update user balance: %w", err)
	}

	// Update Redis cache
	if s.balanceCache != nil {
		_ = s.balanceCache.SetBalance(ctx, userIDHex, newBalance, 24*time.Hour)
	}

	tx := &domain.Transaction{
		UserID:            uid,
		Type:              domain.TxTypeDeposit,
		AmountCents:       amountCents,
		BalanceAfterCents: newBalance,
		Gateway:           gateway,
		PaymentExternalID: paymentExtID,
		Description:       fmt.Sprintf("Depósito de R$ %.2f via %s", float64(amountCents)/100.0, gateway),
		Status:            domain.TxStatusSuccess,
		CreatedAt:         time.Now(),
	}

	if err := s.txRepo.Create(ctx, tx); err != nil {
		return nil, fmt.Errorf("failed to record deposit transaction: %w", err)
	}

	return tx, nil
}

func (s *WalletService) FinalizeRoomSession(ctx context.Context, roomName string, isExhausted bool) error {
	session, err := s.sessionRepo.GetByRoomName(ctx, roomName)
	if err != nil || session == nil {
		return errors.New("session not found")
	}

	if session.Status != domain.SessionStatusActive {
		return nil // Already finalized
	}

	endedAt := time.Now()
	durationSec := int64(endedAt.Sub(session.StartedAt).Seconds())
	if durationSec < 5 {
		durationSec = 5
	}

	// Billing calculation (per minute rounded up, minimum 1 min)
	minutes := math.Ceil(float64(durationSec) / 60.0)
	totalChargedCents := int64(minutes) * session.MinuteRateCents

	platformFeeCents := (totalChargedCents * int64(s.platformFeePerc)) / 100
	mentorEarningsCents := totalChargedCents - platformFeeCents

	finSummary := domain.FinancialSummary{
		TotalChargedCents:   totalChargedCents,
		MentorEarningsCents: mentorEarningsCents,
		PlatformFeeCents:    platformFeeCents,
	}

	status := domain.SessionStatusCompleted
	if isExhausted {
		status = domain.SessionStatusExhausted
	}

	// Transaction execution function
	executeSettlement := func(sessCtx context.Context) error {
		// 1. Deduct balance from Client
		if err := s.userRepo.UpdateBalance(sessCtx, session.ClientID, -totalChargedCents); err != nil {
			return err
		}

		// 2. Credit balance to Mentor
		if err := s.userRepo.UpdateBalance(sessCtx, session.MentorID, mentorEarningsCents); err != nil {
			return err
		}

		// Fetch latest balances
		clientUser, _ := s.userRepo.GetByID(sessCtx, session.ClientID)
		mentorUser, _ := s.userRepo.GetByID(sessCtx, session.MentorID)

		clientBal := int64(0)
		if clientUser != nil {
			clientBal = clientUser.Wallet.BalanceCents
		}

		mentorBal := int64(0)
		if mentorUser != nil {
			mentorBal = mentorUser.Wallet.BalanceCents
		}

		// 3. Record Client Transaction (Debit)
		clientTx := &domain.Transaction{
			UserID:             session.ClientID,
			Type:               domain.TxTypeSessionDebit,
			AmountCents:        -totalChargedCents,
			BalanceAfterCents:  clientBal,
			ReferenceSessionID: &session.ID,
			Gateway:            "INTERNAL",
			Description:        fmt.Sprintf("Débito referente a %d min de atendimento", int(minutes)),
			Status:             domain.TxStatusSuccess,
			CreatedAt:          endedAt,
		}
		if err := s.txRepo.Create(sessCtx, clientTx); err != nil {
			return err
		}

		// 4. Record Mentor Transaction (Payout)
		mentorTx := &domain.Transaction{
			UserID:             session.MentorID,
			Type:               domain.TxTypeMentorPayout,
			AmountCents:        mentorEarningsCents,
			BalanceAfterCents:  mentorBal,
			ReferenceSessionID: &session.ID,
			Gateway:            "INTERNAL",
			Description:        fmt.Sprintf("Ganhos de mentoria (%d min)", int(minutes)),
			Status:             domain.TxStatusSuccess,
			CreatedAt:          endedAt,
		}
		if err := s.txRepo.Create(sessCtx, mentorTx); err != nil {
			return err
		}

		// 5. Update Session status
		return s.sessionRepo.CompleteSession(sessCtx, session.ID, status, endedAt, durationSec, finSummary)
	}

	// Try MongoDB Session Transaction (ACID) if client is connected
	if s.mongoClient != nil && s.mongoClient.Mongo != nil {
		mongoSess, err := s.mongoClient.Mongo.StartSession()
		if err == nil {
			defer mongoSess.EndSession(ctx)
			_, txErr := mongoSess.WithTransaction(ctx, func(sessCtx context.Context) (interface{}, error) {
				return nil, executeSettlement(sessCtx)
			})
			if txErr == nil {
				// Update Redis balance cache for client
				clientUser, _ := s.userRepo.GetByID(ctx, session.ClientID)
				if clientUser != nil && s.balanceCache != nil {
					_ = s.balanceCache.SetBalance(ctx, session.ClientID.Hex(), clientUser.Wallet.BalanceCents, 24*time.Hour)
				}
				return nil
			}
		}
	}

	// Fallback for standalone Mongo instances without replica set
	err = executeSettlement(ctx)
	if err == nil {
		clientUser, _ := s.userRepo.GetByID(ctx, session.ClientID)
		if clientUser != nil && s.balanceCache != nil {
			_ = s.balanceCache.SetBalance(ctx, session.ClientID.Hex(), clientUser.Wallet.BalanceCents, 24*time.Hour)
		}
	}
	return err
}
