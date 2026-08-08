package domain

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Role string

const (
	RoleClient Role = "client"
	RoleMentor Role = "mentor"
	RoleAdmin  Role = "admin"
)

type Wallet struct {
	BalanceCents int64  `bson:"balance_cents" json:"balance_cents"`
	Currency     string `bson:"currency" json:"currency"`
}

type MentorProfile struct {
	Bio             string   `bson:"bio" json:"bio"`
	MinuteRateCents int64    `bson:"minute_rate_cents" json:"minute_rate_cents"`
	Skills          []string `bson:"skills" json:"skills"`
	IsOnline        bool     `bson:"is_online" json:"is_online"`
	RatingAvg       float64  `bson:"rating_avg" json:"rating_avg"`
	TotalRatings    int      `bson:"total_ratings" json:"total_ratings"`
	TotalSessions   int      `bson:"total_sessions" json:"total_sessions"`
}

type SocialLinks struct {
	GitHub   string `bson:"github" json:"github"`
	LinkedIn string `bson:"linkedin" json:"linkedin"`
}

type User struct {
	ID            bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	Name          string         `bson:"name" json:"name"`
	Email         string         `bson:"email" json:"email"`
	PasswordHash  string         `bson:"password_hash" json:"-"`
	AvatarURL     string         `bson:"avatar_url" json:"avatar_url"`
	Role          Role           `bson:"role" json:"role"`
	Wallet        Wallet         `bson:"wallet" json:"wallet"`
	MentorProfile *MentorProfile `bson:"mentor_profile,omitempty" json:"mentor_profile,omitempty"`
	SocialLinks   SocialLinks    `bson:"social_links" json:"social_links"`
	CreatedAt     time.Time      `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time      `bson:"updated_at" json:"updated_at"`
}

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id bson.ObjectID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	UpdateBalance(ctx context.Context, userID bson.ObjectID, amountCents int64) error
	SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error
	ListOnlineMentors(ctx context.Context, skill string) ([]*User, error)
}
