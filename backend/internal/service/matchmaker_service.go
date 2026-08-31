package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"unblock-backend/internal/domain"
	repoRedis "unblock-backend/internal/repository/redis"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type MatchmakerService struct {
	reqRepo      domain.RequestRepository
	sessionRepo  domain.SessionRepository
	userRepo     domain.UserRepository
	lockRepo     *repoRedis.LockRepository
	pubSubRepo   *repoRedis.PubSubRepository
	balanceCache *repoRedis.BalanceCache
	livekitSvc   *LiveKitService
}

func NewMatchmakerService(
	reqRepo domain.RequestRepository,
	sessionRepo domain.SessionRepository,
	userRepo domain.UserRepository,
	lockRepo *repoRedis.LockRepository,
	pubSubRepo *repoRedis.PubSubRepository,
	balanceCache *repoRedis.BalanceCache,
	livekitSvc *LiveKitService,
) *MatchmakerService {
	return &MatchmakerService{
		reqRepo:      reqRepo,
		sessionRepo:  sessionRepo,
		userRepo:     userRepo,
		lockRepo:     lockRepo,
		pubSubRepo:   pubSubRepo,
		balanceCache: balanceCache,
		livekitSvc:   livekitSvc,
	}
}

type CreateSOSDTO struct {
	Title              string   `json:"title"`
	Description        string   `json:"description"`
	Stack              []string `json:"stack"`
	MaxMinuteRateCents int64    `json:"max_minute_rate_cents"`
}

func (s *MatchmakerService) CreateSOS(ctx context.Context, clientUser *domain.User, dto CreateSOSDTO) (*domain.Request, error) {
	if clientUser.Wallet.BalanceCents < dto.MaxMinuteRateCents*3 {
		return nil, errors.New("saldo insuficiente para abrir chamado (necessário ao menos 3 minutos)")
	}

	req := &domain.Request{
		ClientID:           clientUser.ID,
		ClientName:         clientUser.Name,
		ClientAvatar:       clientUser.AvatarURL,
		Title:              dto.Title,
		Description:        dto.Description,
		Stack:              dto.Stack,
		MaxMinuteRateCents: dto.MaxMinuteRateCents,
		Status:             domain.RequestStatusOpen,
		ExpiresAt:          time.Now().Add(15 * time.Minute),
	}

	if err := s.reqRepo.Create(ctx, req); err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Cache user balance in Redis
	if s.balanceCache != nil {
		_ = s.balanceCache.SetBalance(ctx, clientUser.ID.Hex(), clientUser.Wallet.BalanceCents, 24*time.Hour)
	}

	// Publish SOS event to Redis Pub/Sub for instant real-time broadcast to mentors
	if s.pubSubRepo != nil {
		eventPayload := map[string]interface{}{
			"type":    "REQUEST_CREATED",
			"request": req,
		}
		msgBytes, _ := json.Marshal(eventPayload)
		_ = s.pubSubRepo.PublishSOS(ctx, string(msgBytes))
	}

	return req, nil
}

type AcceptResult struct {
	Session      *domain.Session `json:"session"`
	MentorToken  string          `json:"mentor_token"`
	ClientToken  string          `json:"client_token"`
	LiveKitRoom  string          `json:"livekit_room"`
}

func (s *MatchmakerService) AcceptSOS(ctx context.Context, mentorUser *domain.User, requestIDHex string) (*AcceptResult, error) {
	if mentorUser.Role != domain.RoleMentor {
		return nil, errors.New("somente mentores podem aceitar chamados")
	}

	reqID, err := bson.ObjectIDFromHex(requestIDHex)
	if err != nil {
		return nil, errors.New("ID de chamado inválido")
	}

	// Acquire Distributed Lock via SETNX
	locked, err := s.lockRepo.AcquireRequestLock(ctx, requestIDHex, mentorUser.ID.Hex(), 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("lock error: %w", err)
	}
	if !locked {
		return nil, errors.New("chamado já aceito por outro mentor")
	}

	// Fetch Request
	req, err := s.reqRepo.GetByID(ctx, reqID)
	if err != nil || req == nil {
		return nil, errors.New("chamado não encontrado")
	}

	if req.Status != domain.RequestStatusOpen {
		return nil, errors.New("este chamado não está mais disponível")
	}

	if req.ClientID == mentorUser.ID {
		return nil, errors.New("você não pode aceitar seu próprio chamado de mentoria")
	}

	// Update Request status to ACCEPTED
	mentorID := mentorUser.ID
	if err := s.reqRepo.UpdateStatus(ctx, reqID, domain.RequestStatusAccepted, &mentorID); err != nil {
		return nil, fmt.Errorf("failed to update request: %w", err)
	}

	// Rate is the minimum of mentor rate and client max rate
	rate := req.MaxMinuteRateCents
	if mentorUser.MentorProfile != nil && mentorUser.MentorProfile.MinuteRateCents > 0 {
		if mentorUser.MentorProfile.MinuteRateCents < rate {
			rate = mentorUser.MentorProfile.MinuteRateCents
		}
	}

	roomName := fmt.Sprintf("room_%s", reqID.Hex())
	yjsDocID := fmt.Sprintf("doc_%s", reqID.Hex())

	session := &domain.Session{
		RequestID:       req.ID,
		ClientID:        req.ClientID,
		MentorID:        mentorUser.ID,
		MinuteRateCents: rate,
		Status:          domain.SessionStatusActive,
		LiveKitRoomName: roomName,
		YjsDocID:        yjsDocID,
		StartedAt:       time.Now(),
	}

	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Generate LiveKit tokens
	mentorToken, err := s.livekitSvc.GetRoomJoinToken(roomName, mentorUser.ID.Hex(), mentorUser.Name, true)
	if err != nil {
		return nil, fmt.Errorf("failed to generate mentor token: %w", err)
	}

	clientToken, err := s.livekitSvc.GetRoomJoinToken(roomName, req.ClientID.Hex(), req.ClientName, true)
	if err != nil {
		return nil, fmt.Errorf("failed to generate client token: %w", err)
	}

	// Publish REQUEST_ACCEPTED event to Redis Pub/Sub for instant client notification & queue update
	if s.pubSubRepo != nil {
		acceptEvent := map[string]interface{}{
			"type":         "REQUEST_ACCEPTED",
			"request_id":   req.ID.Hex(),
			"session_id":   session.ID.Hex(),
			"client_id":    req.ClientID.Hex(),
			"mentor_id":    mentorUser.ID.Hex(),
			"mentor_name":  mentorUser.Name,
			"livekit_room": roomName,
		}
		acceptBytes, _ := json.Marshal(acceptEvent)
		_ = s.pubSubRepo.PublishSOS(ctx, string(acceptBytes))
	}

	return &AcceptResult{
		Session:     session,
		MentorToken: mentorToken,
		ClientToken: clientToken,
		LiveKitRoom: roomName,
	}, nil
}
