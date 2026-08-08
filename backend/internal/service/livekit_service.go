package service

import (
	"time"

	pkgLiveKit "unblock-backend/pkg/livekit"
)

type LiveKitService struct {
	tokenSvc *pkgLiveKit.TokenService
	host     string
}

func NewLiveKitService(apiKey, apiSecret, host string) *LiveKitService {
	return &LiveKitService{
		tokenSvc: pkgLiveKit.NewTokenService(apiKey, apiSecret),
		host:     host,
	}
}

func (s *LiveKitService) GetRoomJoinToken(roomName, userID, userName string, isMentor bool) (string, error) {
	ttl := 4 * time.Hour
	return s.tokenSvc.GenerateJoinToken(roomName, userID, userName, true, ttl)
}
