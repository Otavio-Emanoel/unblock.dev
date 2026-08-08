package middleware

import (
	"context"
	"net/http"
	"strings"

	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"
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

		ctx := context.WithValue(r.Context(), "user", user)
		ctx = context.WithValue(ctx, "claims", claims)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
