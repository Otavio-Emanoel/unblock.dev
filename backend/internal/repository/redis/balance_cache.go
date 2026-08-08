package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type BalanceCache struct {
	client *redis.Client
}

func NewBalanceCache(c *redis.Client) *BalanceCache {
	return &BalanceCache{client: c}
}

func (b *BalanceCache) getKey(userID string) string {
	return fmt.Sprintf("user:balance:cache:%s", userID)
}

func (b *BalanceCache) SetBalance(ctx context.Context, userID string, balanceCents int64, ttl time.Duration) error {
	key := b.getKey(userID)
	return b.client.Set(ctx, key, balanceCents, ttl).Err()
}

func (b *BalanceCache) GetBalance(ctx context.Context, userID string) (int64, error) {
	key := b.getKey(userID)
	val, err := b.client.Get(ctx, key).Int64()
	if err != nil {
		return 0, err
	}
	return val, nil
}

func (b *BalanceCache) DecrByBalance(ctx context.Context, userID string, amount int64) (int64, error) {
	key := b.getKey(userID)
	return b.client.DecrBy(ctx, key, amount).Result()
}
