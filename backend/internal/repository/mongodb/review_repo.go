package mongodb

import (
	"context"
	"fmt"
	"time"

	"unblock-backend/internal/domain"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type reviewRepo struct {
	coll *mongo.Collection
}

func NewReviewRepo(db *mongo.Database) domain.ReviewRepository {
	return &reviewRepo{
		coll: db.Collection("reviews"),
	}
}

func (r *reviewRepo) Create(ctx context.Context, review *domain.Review) error {
	review.CreatedAt = time.Now()

	res, err := r.coll.InsertOne(ctx, review)
	if err != nil {
		return fmt.Errorf("failed to insert review: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		review.ID = oid
	}
	return nil
}

func (r *reviewRepo) GetBySessionID(ctx context.Context, sessionID bson.ObjectID) (*domain.Review, error) {
	var review domain.Review
	err := r.coll.FindOne(ctx, bson.M{"session_id": sessionID}).Decode(&review)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get review by session_id: %w", err)
	}
	return &review, nil
}

func (r *reviewRepo) ListByMentorID(ctx context.Context, mentorID bson.ObjectID) ([]*domain.Review, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.coll.Find(ctx, bson.M{"mentor_id": mentorID}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list mentor reviews: %w", err)
	}
	defer cursor.Close(ctx)

	var reviews []*domain.Review
	if err := cursor.All(ctx, &reviews); err != nil {
		return nil, fmt.Errorf("failed to decode reviews: %w", err)
	}
	return reviews, nil
}
