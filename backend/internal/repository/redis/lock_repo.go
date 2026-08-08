package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type LockRepository struct {
	client *redis.Client
}

func NewLockRepository(c *redis.Client) *LockRepository {
	return &LockRepository{client: c}
}

// AcquireRequestLock attempts atomic SETNX on key "lock:request:{requestID}"
func (r *LockRepository) AcquireRequestLock(ctx context.Context, requestID string, mentorID string, ttl time.Duration) (bool, error) {
	key := fmt.Sprintf("lock:request:%s", requestID)
	success, err := r.client.SetNX(ctx, key, mentorID, ttl).Result()
	if err != nil {
		return false, err
	}
	return success, nil
}

// ReleaseRequestLock releases lock if held by mentorID
func (r *LockRepository) ReleaseRequestLock(ctx context.Context, requestID string, mentorID string) error {
	key := fmt.Sprintf("lock:request:%s", requestID)
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil
		}
		return err
	}
	if val == mentorID {
		return r.client.Del(ctx, key).Err()
	}
	return nil
}
