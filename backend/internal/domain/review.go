package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Review struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	SessionID bson.ObjectID `bson:"session_id" json:"session_id"`
	ClientID  bson.ObjectID `bson:"client_id" json:"client_id"`
	MentorID  bson.ObjectID `bson:"mentor_id" json:"mentor_id"`
	Rating    int           `bson:"rating" json:"rating"` // 1 to 5
	Comment   string        `bson:"comment" json:"comment"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}

type ReviewRepository interface {
	Create(ctx context.Context, review *Review) error
	GetBySessionID(ctx context.Context, sessionID bson.ObjectID) (*Review, error)
	ListByMentorID(ctx context.Context, mentorID bson.ObjectID) ([]*Review, error)
}
