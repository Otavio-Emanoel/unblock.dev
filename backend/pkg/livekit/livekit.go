package livekit

import (
	"fmt"
	"time"

	lauth "github.com/livekit/protocol/auth"
)

type TokenService struct {
	apiKey    string
	apiSecret string
}

func NewTokenService(apiKey, apiSecret string) *TokenService {
	return &TokenService{
		apiKey:    apiKey,
		apiSecret: apiSecret,
	}
}

func boolPtr(b bool) *bool {
	return &b
}

func (s *TokenService) GenerateJoinToken(roomName, identity, name string, isPublisher bool, ttl time.Duration) (string, error) {
	at := lauth.NewAccessToken(s.apiKey, s.apiSecret)
	grant := &lauth.VideoGrant{
		RoomJoin:          true,
		Room:              roomName,
		CanPublish:        boolPtr(isPublisher),
		CanSubscribe:      boolPtr(true),
		CanPublishData:    boolPtr(isPublisher),
		CanPublishSources: []string{"camera", "microphone", "screen_share"},
	}

	at.AddGrant(grant).
		SetIdentity(identity).
		SetName(name).
		SetValidFor(ttl)

	token, err := at.ToJWT()
	if err != nil {
		return "", fmt.Errorf("failed to sign livekit token: %w", err)
	}

	return token, nil
}
