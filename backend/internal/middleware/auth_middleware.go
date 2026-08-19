package middleware

import (
	"context"
	"net/http"
	"strings"

	"unblock-backend/internal/domain"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"
)

type ContextKey string

const (
	UserContextKey   ContextKey = "user"
	ClaimsContextKey ContextKey = "claims"
)

type AuthMiddleware struct {
	authSvc *service.AuthService
}

func NewAuthMiddleware(authSvc *service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{authSvc: authSvc}
}

func (m *AuthMiddleware) Protect(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			response.Error(w, http.StatusUnauthorized, "Missing Authorization header")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Error(w, http.StatusUnauthorized, "Invalid Authorization header format")
			return
		}

		tokenStr := parts[1]
		claims, err := m.authSvc.ValidateToken(tokenStr)
		if err != nil {
			response.Error(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		user, err := m.authSvc.GetUserByID(r.Context(), claims.UserID)
		if err != nil || user == nil {
			response.Error(w, http.StatusUnauthorized, "User not found")
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		ctx = context.WithValue(ctx, ClaimsContextKey, claims)
		// Also store string key for backwards compatibility
		ctx = context.WithValue(ctx, "user", user)
		ctx = context.WithValue(ctx, "claims", claims)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserFromContext(ctx context.Context) *domain.User {
	if u, ok := ctx.Value(UserContextKey).(*domain.User); ok {
		return u
	}
	if u, ok := ctx.Value("user").(*domain.User); ok {
		return u
	}
	return nil
}
