package service

import (
	"context"
	"log/slog"
	"sync"
	"time"

	repoRedis "unblock-backend/internal/repository/redis"
)

type ActiveSession struct {
	CancelFunc      context.CancelFunc
	StartedAt       time.Time
	ClientID        string
	RoomName        string
	RatePerMinCents int64
}

type TickerEngine struct {
	balanceCache  *repoRedis.BalanceCache
	walletService *WalletService
	logger        *slog.Logger
	activeRooms   sync.Map // map[string]*ActiveSession
}

func NewTickerEngine(bc *repoRedis.BalanceCache, ws *WalletService, logger *slog.Logger) *TickerEngine {
	return &TickerEngine{
		balanceCache:  bc,
		walletService: ws,
		logger:        logger,
	}
}

// StartBillingTicker starts a 5-second interval billing goroutine for a room
func (e *TickerEngine) StartBillingTicker(parentCtx context.Context, roomName string, clientID string, ratePerMinCents int64) {
	if _, loaded := e.activeRooms.Load(roomName); loaded {
		e.logger.Info("Billing ticker already active for room", "room", roomName)
		return
	}

	ctx, cancel := context.WithCancel(parentCtx)

	session := &ActiveSession{
		CancelFunc:      cancel,
		StartedAt:       time.Now(),
		ClientID:        clientID,
		RoomName:        roomName,
		RatePerMinCents: ratePerMinCents,
	}
	e.activeRooms.Store(roomName, session)

	go func() {
		defer func() {
			e.activeRooms.Delete(roomName)
			cancel()
		}()

		e.logger.Info("Billing ticker started", "room", roomName, "client", clientID, "rate_cents_min", ratePerMinCents)

		// 5 seconds tick interval
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		// Cost per 5 seconds interval
		costPerInterval := int64(float64(ratePerMinCents) / 12.0)
		if costPerInterval < 1 {
			costPerInterval = 1
		}

		for {
			select {
			case <-ctx.Done():
				e.logger.Info("Billing ticker stopped", "room", roomName)
				return

			case <-ticker.C:
				newBalance, err := e.balanceCache.DecrByBalance(ctx, clientID, costPerInterval)
				if err != nil {
					e.logger.Error("Error decrementing balance in Redis", "err", err, "client", clientID)
					continue
				}

				// Warn when balance is low (< 2 minutes remaining)
				if newBalance > 0 && newBalance <= (ratePerMinCents*2) {
					e.logger.Warn("Client low balance alert!", "room", roomName, "balance_cents", newBalance)
				}

				// If balance is exhausted (<= 0), terminate session
				if newBalance <= 0 {
					e.logger.Warn("BALANCE EXHAUSTED! Forcing room termination.", "room", roomName, "client", clientID)

					// Settle session in MongoDB
					if e.walletService != nil {
						if err := e.walletService.FinalizeRoomSession(context.Background(), roomName, true); err != nil {
							e.logger.Error("Failed to finalize exhausted session", "err", err, "room", roomName)
						}
					}
					return
				}
			}
		}
	}()
}

// StopBillingTicker manually stops the billing goroutine for a room
func (e *TickerEngine) StopBillingTicker(roomName string) {
	if val, ok := e.activeRooms.Load(roomName); ok {
		session := val.(*ActiveSession)
		session.CancelFunc()
		e.activeRooms.Delete(roomName)
		e.logger.Info("Billing ticker stopped manually", "room", roomName)
	}
}

func (e *TickerEngine) IsRoomActive(roomName string) bool {
	_, ok := e.activeRooms.Load(roomName)
	return ok
}
