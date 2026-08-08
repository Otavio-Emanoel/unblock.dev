package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"unblock-backend/internal/config"
	"unblock-backend/internal/handler"
	"unblock-backend/internal/middleware"
	repoMongo "unblock-backend/internal/repository/mongodb"
	repoRedis "unblock-backend/internal/repository/redis"
	"unblock-backend/internal/service"
	"unblock-backend/pkg/response"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	// 1. Logger Setup
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	logger.Info("Starting Unblock.dev Go Backend...")

	// 2. Load Configuration
	cfg := config.LoadConfig()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 3. Database Connections
	mongoClient, err := repoMongo.Connect(ctx, cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		logger.Error("MongoDB connection failed", "err", err)
		os.Exit(1)
	}
	defer mongoClient.Mongo.Disconnect(context.Background())

	redisClient, err := repoRedis.NewClient(ctx, cfg.RedisURI, cfg.RedisPassword)
	if err != nil {
		logger.Error("Redis connection failed", "err", err)
		os.Exit(1)
	}
	defer redisClient.Close()

	// 4. Repositories Initialization
	userRepo := repoMongo.NewUserRepo(mongoClient.DB)
	reqRepo := repoMongo.NewRequestRepo(mongoClient.DB)
	sessionRepo := repoMongo.NewSessionRepo(mongoClient.DB)
	txRepo := repoMongo.NewTransactionRepo(mongoClient.DB)

	balanceCache := repoRedis.NewBalanceCache(redisClient)
	lockRepo := repoRedis.NewLockRepository(redisClient)
	pubSubRepo := repoRedis.NewPubSubRepository(redisClient)

	// 5. Services Initialization
	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret)
	livekitSvc := service.NewLiveKitService(cfg.LiveKitAPIKey, cfg.LiveKitAPISecret, cfg.LiveKitHost)
	matchmakerSvc := service.NewMatchmakerService(reqRepo, sessionRepo, userRepo, lockRepo, pubSubRepo, balanceCache, livekitSvc)
	walletSvc := service.NewWalletService(userRepo, sessionRepo, txRepo, balanceCache, mongoClient, cfg.PlatformFeePercentage)
	tickerEngine := service.NewTickerEngine(balanceCache, walletSvc, logger)

	// 6. Handlers & Hub
	authHandler := handler.NewAuthHandler(authSvc)
	reqHandler := handler.NewRequestHandler(matchmakerSvc, reqRepo)
	sessionHandler := handler.NewSessionHandler(sessionRepo, walletSvc, tickerEngine)
	walletHandler := handler.NewWalletHandler(walletSvc, txRepo)
	webhookHandler := handler.NewWebhookHandler(tickerEngine, walletSvc, sessionRepo, logger)
	wsHub := handler.NewWSHub(pubSubRepo, authSvc, logger)

	authMiddleware := middleware.NewAuthMiddleware(authSvc)

	// Run WebSocket Hub background worker
	go wsHub.Run(ctx)

	// 7. Chi Router Setup
	r := chi.NewRouter()

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(middleware.CORSMiddleware())

	// Healthcheck
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]string{
			"status": "UP",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// Public Auth Routes
	r.Post("/api/auth/register", authHandler.Register)
	r.Post("/api/auth/login", authHandler.Login)

	// WebSockets & Webhooks
	r.Get("/api/ws", wsHub.HandleWS)
	r.Post("/api/webhooks/livekit", webhookHandler.HandleLiveKitWebhook)

	// Protected Routes
	r.Group(func(pr chi.Router) {
		pr.Use(authMiddleware.Protect)

		// User
		pr.Get("/api/auth/me", authHandler.Me)

		// SOS Requests
		pr.Post("/api/requests", reqHandler.CreateSOS)
		pr.Get("/api/requests/open", reqHandler.ListOpen)
		pr.Get("/api/requests/my", reqHandler.ListMy)
		pr.Post("/api/requests/{id}/accept", reqHandler.AcceptSOS)

		// Sessions
		pr.Get("/api/sessions/{id}", sessionHandler.GetSession)
		pr.Post("/api/sessions/{id}/end", sessionHandler.EndSession)
		pr.Put("/api/sessions/{id}/code", sessionHandler.SaveCode)

		// Wallet
		pr.Get("/api/wallet/balance", walletHandler.GetBalance)
		pr.Post("/api/wallet/deposit", walletHandler.Deposit)
		pr.Get("/api/wallet/transactions", walletHandler.ListTransactions)
	})

	// 8. HTTP Server Execution & Graceful Shutdown
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("API Server listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("HTTP Server error", "err", err)
			os.Exit(1)
		}
	}()

	// Signal Interception
	shutdownSignal := make(chan os.Signal, 1)
	signal.Notify(shutdownSignal, os.Interrupt, syscall.SIGTERM)

	<-shutdownSignal
	logger.Info("Shutting down API server gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("Error shutting down HTTP server", "err", err)
	}

	logger.Info("Unblock.dev Backend stopped cleanly.")
}
