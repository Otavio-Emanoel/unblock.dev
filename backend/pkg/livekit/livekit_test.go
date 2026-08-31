package livekit_test

import (
	"testing"
	"time"

	pkgLiveKit "unblock-backend/pkg/livekit"

	lauth "github.com/livekit/protocol/auth"
)

func TestTokenService_GenerateJoinToken(t *testing.T) {
	apiKey := "devkey"
	apiSecret := "secretkey1234567890secretkey123"

	tokenSvc := pkgLiveKit.NewTokenService(apiKey, apiSecret)

	roomName := "room_test_123"
	identity := "user_456"
	name := "Alice Developer"
	ttl := 2 * time.Hour

	tokenStr, err := tokenSvc.GenerateJoinToken(roomName, identity, name, true, ttl)
	if err != nil {
		t.Fatalf("GenerateJoinToken failed: %v", err)
	}

	if tokenStr == "" {
		t.Fatal("Expected non-empty token string")
	}

	// Verify token with LiveKit TokenVerifier
	verifier, err := lauth.ParseAPIToken(tokenStr)
	if err != nil {
		t.Fatalf("Failed to parse token: %v", err)
	}

	_, grants, err := verifier.Verify(apiSecret)
	if err != nil {
		t.Fatalf("Failed to verify token signature: %v", err)
	}

	if grants.Identity != identity {
		t.Errorf("Expected identity %s, got %s", identity, grants.Identity)
	}

	if grants.Name != name {
		t.Errorf("Expected name %s, got %s", name, grants.Name)
	}

	if grants.Video == nil || grants.Video.Room != roomName {
		t.Errorf("Expected video room %s, got %+v", roomName, grants.Video)
	}
}
