package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type RequestStatus string

const (
	RequestStatusOpen       RequestStatus = "OPEN"
	RequestStatusAccepted   RequestStatus = "ACCEPTED"
	RequestStatusInProgress RequestStatus = "IN_PROGRESS"
	RequestStatusCompleted  RequestStatus = "COMPLETED"
	RequestStatusExpired    RequestStatus = "EXPIRED"
	RequestStatusCancelled  RequestStatus = "CANCELLED"
)

type Request struct {
	ID                 bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	ClientID           bson.ObjectID  `bson:"client_id" json:"client_id"`
	ClientName         string         `bson:"client_name,omitempty" json:"client_name,omitempty"`
	ClientAvatar       string         `bson:"client_avatar,omitempty" json:"client_avatar,omitempty"`
	Title              string         `bson:"title" json:"title"`
	Description        string         `bson:"description" json:"description"`
	Stack              []string       `bson:"stack" json:"stack"`
	MaxMinuteRateCents int64          `bson:"max_minute_rate_cents" json:"max_minute_rate_cents"`
	Status             RequestStatus  `bson:"status" json:"status"`
	AcceptedMentorID   *bson.ObjectID `bson:"accepted_mentor_id,omitempty" json:"accepted_mentor_id,omitempty"`
	ExpiresAt          time.Time      `bson:"expires_at" json:"expires_at"`
	CreatedAt          time.Time      `bson:"created_at" json:"created_at"`
	UpdatedAt          time.Time      `bson:"updated_at" json:"updated_at"`
}

type RequestRepository interface {
	Create(ctx context.Context, req *Request) error
	GetByID(ctx context.Context, id bson.ObjectID) (*Request, error)
	ListOpen(ctx context.Context, stack string) ([]*Request, error)
	ListByClient(ctx context.Context, clientID bson.ObjectID) ([]*Request, error)
	UpdateStatus(ctx context.Context, id bson.ObjectID, status RequestStatus, mentorID *bson.ObjectID) error
}
