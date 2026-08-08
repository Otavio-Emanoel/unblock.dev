package middleware

import (
	"net/http"
	"sync"
	"time"

	"unblock-backend/pkg/response"
)

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]int
	resetAt  time.Time
	limit    int
}

func NewRateLimiter(limitPerMin int) *RateLimiter {
	return &RateLimiter{
		visitors: make(map[string]int),
		resetAt:  time.Now().Add(time.Minute),
		limit:    limitPerMin,
	}
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rl.mu.Lock()
		if time.Now().After(rl.resetAt) {
			rl.visitors = make(map[string]int)
			rl.resetAt = time.Now().Add(time.Minute)
		}

		ip := r.RemoteAddr
		rl.visitors[ip]++
		count := rl.visitors[ip]
		rl.mu.Unlock()

		if count > rl.limit {
			response.Error(w, http.StatusTooManyRequests, "Rate limit exceeded. Try again in a minute.")
			return
		}

		next.ServeHTTP(w, r)
	})
}
