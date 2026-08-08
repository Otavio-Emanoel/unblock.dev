package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type SessionStatus string

const (
	SessionStatusActive    SessionStatus = "ACTIVE"
	SessionStatusCompleted SessionStatus = "COMPLETED"
	SessionStatusExhausted SessionStatus = "EXHAUSTED"
	SessionStatusCancelled SessionStatus = "CANCELLED"
)

type FinancialSummary struct {
	TotalChargedCents   int64 `bson:"total_charged_cents" json:"total_charged_cents"`
	MentorEarningsCents int64 `bson:"mentor_earnings_cents" json:"mentor_earnings_cents"`
	PlatformFeeCents    int64 `bson:"platform_fee_cents" json:"platform_fee_cents"`
}

type Session struct {
	ID               bson.ObjectID    `bson:"_id,omitempty" json:"id"`
	RequestID        bson.ObjectID    `bson:"request_id" json:"request_id"`
	ClientID         bson.ObjectID    `bson:"client_id" json:"client_id"`
	MentorID         bson.ObjectID    `bson:"mentor_id" json:"mentor_id"`
	MinuteRateCents  int64            `bson:"minute_rate_cents" json:"minute_rate_cents"`
	Status           SessionStatus    `bson:"status" json:"status"`
	LiveKitRoomName  string           `bson:"livekit_room_name" json:"livekit_room_name"`
	YjsDocID         string           `bson:"yjs_doc_id" json:"yjs_doc_id"`
	StartedAt        time.Time        `bson:"started_at" json:"started_at"`
	EndedAt          *time.Time       `bson:"ended_at,omitempty" json:"ended_at,omitempty"`
	DurationSeconds  int64            `bson:"duration_seconds" json:"duration_seconds"`
	FinancialSummary FinancialSummary `bson:"financial_summary" json:"financial_summary"`
	SavedCodeSnippet string           `bson:"saved_code_snippet,omitempty" json:"saved_code_snippet,omitempty"`
	CreatedAt        time.Time        `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time        `bson:"updated_at" json:"updated_at"`
}

type SessionRepository interface {
	Create(ctx context.Context, session *Session) error
	GetByID(ctx context.Context, id bson.ObjectID) (*Session, error)
	GetByRoomName(ctx context.Context, roomName string) (*Session, error)
	ListByUser(ctx context.Context, userID bson.ObjectID) ([]*Session, error)
	SaveCodeSnippet(ctx context.Context, id bson.ObjectID, code string) error
	CompleteSession(ctx context.Context, id bson.ObjectID, status SessionStatus, endedAt time.Time, durationSec int64, summary FinancialSummary) error
}
