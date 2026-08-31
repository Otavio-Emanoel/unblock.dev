package service_test

import (
	"context"
	"io"
	"log/slog"
	"testing"
	"time"

	"unblock-backend/internal/service"
)

func TestTickerEngine_StartAndStop(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	engine := service.NewTickerEngine(nil, nil, logger)

	roomName := "room_ticker_test"
	clientID := "client_123"

	if engine.IsRoomActive(roomName) {
		t.Error("Expected room NOT to be active before start")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	engine.StartBillingTicker(ctx, roomName, clientID, 300)

	if !engine.IsRoomActive(roomName) {
		t.Error("Expected room to be active after StartBillingTicker")
	}

	// Calling start again on the same room should be idempotent
	engine.StartBillingTicker(ctx, roomName, clientID, 300)
	if !engine.IsRoomActive(roomName) {
		t.Error("Expected room to remain active")
	}

	// Stop ticker
	engine.StopBillingTicker(roomName)
	time.Sleep(10 * time.Millisecond)

	if engine.IsRoomActive(roomName) {
		t.Error("Expected room NOT to be active after StopBillingTicker")
	}
}
