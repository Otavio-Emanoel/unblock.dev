package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

const SOSChannel = "channel:sos:requests"

type PubSubRepository struct {
	client *redis.Client
}

func NewPubSubRepository(c *redis.Client) *PubSubRepository {
	return &PubSubRepository{client: c}
}

func (p *PubSubRepository) PublishSOS(ctx context.Context, message string) error {
	return p.client.Publish(ctx, SOSChannel, message).Err()
}

func (p *PubSubRepository) SubscribeSOS(ctx context.Context) *redis.PubSub {
	return p.client.Subscribe(ctx, SOSChannel)
}
