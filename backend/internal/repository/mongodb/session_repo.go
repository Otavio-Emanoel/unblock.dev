package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"unblock-backend/internal/domain"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type sessionRepo struct {
	coll *mongo.Collection
}

func NewSessionRepo(db *mongo.Database) domain.SessionRepository {
	return &sessionRepo{
		coll: db.Collection("sessions"),
	}
}

func (r *sessionRepo) Create(ctx context.Context, session *domain.Session) error {
	now := time.Now()
	session.CreatedAt = now
	session.UpdatedAt = now
	if session.StartedAt.IsZero() {
		session.StartedAt = now
	}

	res, err := r.coll.InsertOne(ctx, session)
	if err != nil {
		return fmt.Errorf("failed to insert session: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		session.ID = oid
	}
	return nil
}

func (r *sessionRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.Session, error) {
	var session domain.Session
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&session)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session by id: %w", err)
	}
	return &session, nil
}

func (r *sessionRepo) GetByRoomName(ctx context.Context, roomName string) (*domain.Session, error) {
	var session domain.Session
	err := r.coll.FindOne(ctx, bson.M{"livekit_room_name": roomName}).Decode(&session)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get session by room name: %w", err)
	}
	return &session, nil
}

func (r *sessionRepo) ListByUser(ctx context.Context, userID bson.ObjectID) ([]*domain.Session, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"client_id": userID},
			{"mentor_id": userID},
		},
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list user sessions: %w", err)
	}
	defer cursor.Close(ctx)

	var sessions []*domain.Session
	if err := cursor.All(ctx, &sessions); err != nil {
		return nil, fmt.Errorf("failed to decode sessions: %w", err)
	}
	return sessions, nil
}

func (r *sessionRepo) SaveCodeSnippet(ctx context.Context, id bson.ObjectID, code string) error {
	update := bson.M{
		"$set": bson.M{
			"saved_code_snippet": code,
			"updated_at":         time.Now(),
		},
	}
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return fmt.Errorf("failed to save code snippet: %w", err)
	}
	return nil
}

func (r *sessionRepo) CompleteSession(ctx context.Context, id bson.ObjectID, status domain.SessionStatus, endedAt time.Time, durationSec int64, summary domain.FinancialSummary) error {
	update := bson.M{
		"$set": bson.M{
			"status":            status,
			"ended_at":          endedAt,
			"duration_seconds":  durationSec,
			"financial_summary": summary,
			"updated_at":        time.Now(),
		},
	}
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return fmt.Errorf("failed to complete session: %w", err)
	}
	return nil
}
