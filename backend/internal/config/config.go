package config

import (
	"log/slog"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  string
	Env                   string
	MongoURI              string
	MongoDBName           string
	RedisURI              string
	RedisPassword         string
	JWTSecret             string
	LiveKitAPIKey         string
	LiveKitAPISecret      string
	LiveKitHost           string
	PlatformFeePercentage int
}

func LoadConfig() *Config {
	// Attempt to load .env file, ignore error if missing (e.g. in containerized env)
	if err := godotenv.Load(); err != nil {
		slog.Info("No .env file found, reading from environment variables")
	}

	fee, _ := strconv.Atoi(getEnv("PLATFORM_FEE_PERCENTAGE", "20"))

	return &Config{
		Port:                  getEnv("PORT", "8080"),
		Env:                   getEnv("ENV", "development"),
		MongoURI:              getEnv("MONGO_URI", "mongodb://localhost:27017/unblock?directConnection=true"),
		MongoDBName:           getEnv("MONGO_DB_NAME", "unblock"),
		RedisURI:              getEnv("REDIS_URI", "localhost:6379"),
		RedisPassword:         getEnv("REDIS_PASSWORD", ""),
		JWTSecret:             getEnv("JWT_SECRET", "supersecretjwtkey_unblock_dev_2026"),
		LiveKitAPIKey:         getEnv("LIVEKIT_API_KEY", "devkey"),
		LiveKitAPISecret:      getEnv("LIVEKIT_API_SECRET", "secret"),
		LiveKitHost:           getEnv("LIVEKIT_HOST", "http://localhost:7880"),
		PlatformFeePercentage: fee,
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
