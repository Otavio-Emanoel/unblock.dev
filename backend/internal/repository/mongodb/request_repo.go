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

type requestRepo struct {
	coll *mongo.Collection
}

func NewRequestRepo(db *mongo.Database) domain.RequestRepository {
	return &requestRepo{
		coll: db.Collection("requests"),
	}
}

func (r *requestRepo) Create(ctx context.Context, req *domain.Request) error {
	now := time.Now()
	req.CreatedAt = now
	req.UpdatedAt = now
	if req.ExpiresAt.IsZero() {
		req.ExpiresAt = now.Add(15 * time.Minute)
	}

	res, err := r.coll.InsertOne(ctx, req)
	if err != nil {
		return fmt.Errorf("failed to insert request: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		req.ID = oid
	}
	return nil
}

func (r *requestRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.Request, error) {
	var req domain.Request
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&req)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get request by id: %w", err)
	}
	return &req, nil
}

func (r *requestRepo) ListOpen(ctx context.Context, stack string, clientID *bson.ObjectID) ([]*domain.Request, error) {
	filter := bson.M{
		"status": domain.RequestStatusOpen,
	}
	if stack != "" {
		filter["stack"] = stack
	}
	if clientID != nil {
		filter["client_id"] = clientID
	}

	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list open requests: %w", err)
	}
	defer cursor.Close(ctx)

	var reqs []*domain.Request
	if err := cursor.All(ctx, &reqs); err != nil {
		return nil, fmt.Errorf("failed to decode requests: %w", err)
	}
	return reqs, nil
}

func (r *requestRepo) ListByClient(ctx context.Context, clientID bson.ObjectID) ([]*domain.Request, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.coll.Find(ctx, bson.M{"client_id": clientID}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list client requests: %w", err)
	}
	defer cursor.Close(ctx)

	var reqs []*domain.Request
	if err := cursor.All(ctx, &reqs); err != nil {
		return nil, fmt.Errorf("failed to decode requests: %w", err)
	}
	return reqs, nil
}

func (r *requestRepo) UpdateStatus(ctx context.Context, id bson.ObjectID, status domain.RequestStatus, mentorID *bson.ObjectID) error {
	updateFields := bson.M{
		"status":     status,
		"updated_at": time.Now(),
	}
	if mentorID != nil {
		updateFields["accepted_mentor_id"] = mentorID
	}

	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": updateFields})
	if err != nil {
		return fmt.Errorf("failed to update request status: %w", err)
	}
	return nil
}
