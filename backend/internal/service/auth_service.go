package service

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"

	"unblock-backend/internal/domain"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"
)

type JWTClaims struct {
	UserID string      `json:"user_id"`
	Email  string      `json:"email"`
	Role   domain.Role `json:"role"`
	jwt.RegisteredClaims
}

type AuthService struct {
	userRepo  domain.UserRepository
	jwtSecret []byte
}

func NewAuthService(userRepo domain.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

type RegisterDTO struct {
	Name            string      `json:"name"`
	Email           string      `json:"email"`
	Password        string      `json:"password"`
	Role            domain.Role `json:"role"`
	Bio             string      `json:"bio,omitempty"`
	MinuteRateCents int64       `json:"minute_rate_cents,omitempty"`
	Skills          []string    `json:"skills,omitempty"`
	GitHub          string      `json:"github,omitempty"`
	LinkedIn        string      `json:"linkedin,omitempty"`
}

type AuthResponseDTO struct {
	Token string       `json:"token"`
	User  *domain.User `json:"user"`
}

func (s *AuthService) Register(ctx context.Context, dto RegisterDTO) (*AuthResponseDTO, error) {
	name := strings.TrimSpace(dto.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	if len(name) < 2 {
		return nil, errors.New("name must be at least 2 characters long")
	}

	email := strings.ToLower(strings.TrimSpace(dto.Email))
	if email == "" {
		return nil, errors.New("email is required")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return nil, errors.New("invalid email format")
	}

	if dto.Password == "" {
		return nil, errors.New("password is required")
	}
	if len(dto.Password) < 6 {
		return nil, errors.New("password must be at least 6 characters long")
	}

	role := dto.Role
	if role == "" {
		role = domain.RoleClient
	}
	if role != domain.RoleClient && role != domain.RoleMentor && role != domain.RoleAdmin {
		return nil, errors.New("invalid role. Must be 'client' or 'mentor'")
	}

	if role == domain.RoleMentor {
		if dto.MinuteRateCents <= 0 {
			return nil, errors.New("minute rate must be greater than zero for mentors")
		}
		if len(dto.Skills) == 0 {
			return nil, errors.New("at least one skill is required for mentors")
		}
	}

	// Check if user already exists
	existing, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}
	if existing != nil {
		return nil, errors.New("user with this email already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &domain.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		Wallet: domain.Wallet{
			BalanceCents: 0,
			Currency:     "BRL",
		},
		SocialLinks: domain.SocialLinks{
			GitHub:   strings.TrimSpace(dto.GitHub),
			LinkedIn: strings.TrimSpace(dto.LinkedIn),
		},
	}

	if role == domain.RoleMentor {
		user.MentorProfile = &domain.MentorProfile{
			Bio:             strings.TrimSpace(dto.Bio),
			MinuteRateCents: dto.MinuteRateCents,
			Skills:          dto.Skills,
			IsOnline:        true,
			RatingAvg:       5.0,
			TotalRatings:    0,
			TotalSessions:   0,
		}
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &AuthResponseDTO{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*AuthResponseDTO, error) {
	cleanEmail := strings.ToLower(strings.TrimSpace(email))
	if cleanEmail == "" {
		return nil, errors.New("email is required")
	}
	if password == "" {
		return nil, errors.New("password is required")
	}

	user, err := s.userRepo.GetByEmail(ctx, cleanEmail)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &AuthResponseDTO{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) GenerateToken(user *domain.User) (string, error) {
	claims := &JWTClaims{
		UserID: user.ID.Hex(),
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID.Hex(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *AuthService) ValidateToken(tokenStr string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, idHex string) (*domain.User, error) {
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}
	return s.userRepo.GetByID(ctx, oid)
}

func (s *AuthService) SetMentorOnlineStatus(ctx context.Context, mentorID bson.ObjectID, isOnline bool) error {
	return s.userRepo.SetMentorOnlineStatus(ctx, mentorID, isOnline)
}
