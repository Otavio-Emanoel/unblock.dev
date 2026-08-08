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

type transactionRepo struct {
	coll *mongo.Collection
}

func NewTransactionRepo(db *mongo.Database) domain.TransactionRepository {
	return &transactionRepo{
		coll: db.Collection("transactions"),
	}
}

func (r *transactionRepo) Create(ctx context.Context, tx *domain.Transaction) error {
	if tx.CreatedAt.IsZero() {
		tx.CreatedAt = time.Now()
	}

	res, err := r.coll.InsertOne(ctx, tx)
	if err != nil {
		return fmt.Errorf("failed to insert transaction: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		tx.ID = oid
	}
	return nil
}

func (r *transactionRepo) ListByUserID(ctx context.Context, userID bson.ObjectID) ([]*domain.Transaction, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.coll.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to list user transactions: %w", err)
	}
	defer cursor.Close(ctx)

	var txs []*domain.Transaction
	if err := cursor.All(ctx, &txs); err != nil {
		return nil, fmt.Errorf("failed to decode transactions: %w", err)
	}
	return txs, nil
}
