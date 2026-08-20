package mongodb

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Client struct {
	Mongo *mongo.Client
	DB    *mongo.Database
}

func Connect(ctx context.Context, uri, dbName string) (*Client, error) {
	clientOpts := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	// Ping the database
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	db := client.Database(dbName)
	c := &Client{
		Mongo: client,
		DB:    db,
	}

	if err := c.initIndexes(ctx); err != nil {
		slog.Warn("Failed to initialize some indexes", "err", err)
	} else {
		slog.Info("MongoDB indexes initialized successfully")
	}

	return c, nil
}

func (c *Client) initIndexes(ctx context.Context) error {
	// 1. Users collection
	usersColl := c.DB.Collection("users")
	_, err := usersColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "role", Value: 1},
				{Key: "mentor_profile.is_online", Value: 1},
				{Key: "mentor_profile.skills", Value: 1},
			},
		},
	})
	if err != nil {
		return fmt.Errorf("users indexes error: %w", err)
	}

	// 2. Requests collection
	reqColl := c.DB.Collection("requests")
	_, err = reqColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "status", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
		{
			Keys: bson.D{{Key: "client_id", Value: 1}},
		},
		{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0), // TTL Index
		},
	})
	if err != nil {
		return fmt.Errorf("requests indexes error: %w", err)
	}

	// 3. Sessions collection
	sessColl := c.DB.Collection("sessions")
	_, err = sessColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "client_id", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
		{
			Keys: bson.D{
				{Key: "mentor_id", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
		{
			Keys: bson.D{{Key: "status", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "livekit_room_name", Value: 1}},
		},
	})
	if err != nil {
		return fmt.Errorf("sessions indexes error: %w", err)
	}

	// 4. Transactions collection
	txColl := c.DB.Collection("transactions")
	_, err = txColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "user_id", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
	})
	if err != nil {
		return fmt.Errorf("transactions indexes error: %w", err)
	}

	// 5. Reviews collection
	revColl := c.DB.Collection("reviews")
	_, err = revColl.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "mentor_id", Value: 1},
				{Key: "created_at", Value: -1},
			},
		},
		{
			Keys:    bson.D{{Key: "session_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		return fmt.Errorf("reviews indexes error: %w", err)
	}

	return nil
}
