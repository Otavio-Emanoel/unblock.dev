package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"unblock-backend/internal/config"
	repoMongo "unblock-backend/internal/repository/mongodb"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	logger.Info("Starting Unblock.dev Background Worker...")

	cfg := config.LoadConfig()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mongoClient, err := repoMongo.Connect(ctx, cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		logger.Error("Worker MongoDB connection failed", "err", err)
		os.Exit(1)
	}
	defer mongoClient.Mongo.Disconnect(context.Background())

	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	shutdownSignal := make(chan os.Signal, 1)
	signal.Notify(shutdownSignal, os.Interrupt, syscall.SIGTERM)

	logger.Info("Worker active and listening...")

	for {
		select {
		case <-shutdownSignal:
			logger.Info("Worker shutting down gracefully...")
			return
		case <-ticker.C:
			logger.Info("Worker heartbeat check...")
		}
	}
}
