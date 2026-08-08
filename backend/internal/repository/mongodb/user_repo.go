package mongodb

import (
	"context"
	"errors"
	"fmt"
	"time"

	"unblock-backend/internal/domain"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type userRepo struct {
	coll *mongo.Collection
}

func NewUserRepo(db *mongo.Database) domain.UserRepository {
	return &userRepo{
		coll: db.Collection("users"),
	}
}

func (r *userRepo) Create(ctx context.Context, user *domain.User) error {
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	res, err := r.coll.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		user.ID = oid
	}
	return nil
}

func (r *userRepo) GetByID(ctx context.Context, id bson.ObjectID) (*domain.User, error) {
	var user domain.User
	err := r.coll.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}
	return &user, nil
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	err := r.coll.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	return &user, nil
}

func (r *userRepo) Update(ctx context.Context, user *domain.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.coll.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

func (r *userRepo) UpdateBalance(ctx context.Context, userID bson.ObjectID, amountCents int64) error {
	update := bson.M{
		"$inc": bson.M{"wallet.balance_cents": amountCents},
		"$set": bson.M{"updated_at": time.Now()},
	}
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": userID}, update)
	if err != nil {
		return fmt.Errorf("failed to update user balance: %w", err)
	}
	return nil
}

func (r *userRepo) SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error {
	update := bson.M{
		"$set": bson.M{
			"mentor_profile.is_online": isOnline,
			"updated_at":               time.Now(),
		},
	}
	_, err := r.coll.UpdateOne(ctx, bson.M{"_id": mentorID, "role": domain.RoleMentor}, update)
	if err != nil {
		return fmt.Errorf("failed to set mentor online status: %w", err)
	}
	return nil
}

func (r *userRepo) ListOnlineMentors(ctx context.Context, skill string) ([]*domain.User, error) {
	filter := bson.M{
		"role":                     domain.RoleMentor,
		"mentor_profile.is_online": true,
	}

	if skill != "" {
		filter["mentor_profile.skills"] = skill
	}

	cursor, err := r.coll.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find online mentors: %w", err)
	}
	defer cursor.Close(ctx)

	var mentors []*domain.User
	if err := cursor.All(ctx, &mentors); err != nil {
		return nil, fmt.Errorf("failed to decode mentors: %w", err)
	}
	return mentors, nil
}
