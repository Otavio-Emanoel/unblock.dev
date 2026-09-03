# ⚙️ Unblock.dev — Backend API & Real-Time Engine

[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Chi Router](https://img.shields.io/badge/Router-Chi_v5-black?style=flat)](https://github.com/go-chi/chi)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=flat&logo=redis)](https://redis.io/)
[![LiveKit](https://img.shields.io/badge/LiveKit_SDK-Go-FF4F00?style=flat&logo=webrtc)](https://livekit.io/)

The **Unblock.dev Backend** is a high-performance, concurrency-safe microservice written in **Go (Golang)**. It handles authentication, real-time matchmaking with distributed locking, second-by-second billing calculation (`TickerEngine`), WebRTC video room tokens (LiveKit), collaborative workspace persistence, and ACID financial ledger settlements.

---

## 🏛️ Architecture Overview

The backend follows **Clean Architecture** principles to decouple business rules from external frameworks and database drivers:

```text
backend/
├── cmd/
│   └── api/
│       └── main.go               # Server bootstrap, DI container & graceful shutdown
│
├── internal/
│   ├── config/                   # Environment loading & application configuration
│   ├── domain/                   # Enterprise entities & repository interfaces
│   │   ├── user.go               # User profile, mentor skills, credentials
│   │   ├── request.go            # SOS emergency tickets & lifecycle states
│   │   ├── session.go            # Active pair programming rooms & code files
│   │   ├── transaction.go        # Immutable financial ledger entries
│   │   └── review.go             # Post-session mentor ratings & feedback
│   │
│   ├── handler/                  # HTTP REST controllers & WebSocket Handlers
│   │   ├── auth_handler.go       # Login, Register, Me & Mentor status
│   │   ├── request_handler.go    # SOS creation, listing & acceptance
│   │   ├── session_handler.go    # Room lifecycle, multi-file code persistence
│   │   ├── wallet_handler.go     # Balance retrieval, deposits & statement
│   │   ├── review_handler.go     # Session reviews & mentor ratings
│   │   ├── webhook_handler.go    # LiveKit server room exit webhooks
│   │   └── ws_hub.go             # Gorilla WebSocket Hub with Redis Pub/Sub backplane
│   │
│   ├── service/                  # Core domain services & business rules
│   │   ├── auth_service.go       # Password hashing (bcrypt) & JWT token minting
│   │   ├── matchmaker.go         # Concurrency-safe SOS matching (Redis SETNX)
│   │   ├── ticker_engine.go      # Second-by-second billing goroutine engine
│   │   ├── wallet_service.go     # Multi-document ACID financial transactions
│   │   ├── livekit_service.go    # WebRTC room provisioning & access tokens
│   │   └── review_service.go     # Rating calculations & review persistence
│   │
│   ├── repository/               # Data persistence implementations
│   │   ├── mongodb/              # MongoDB collections, compound indexes & sessions
│   │   └── redis/                # Balance caching, Pub/Sub channels & locks
│   │
│   └── middleware/               # HTTP filters (JWT auth, CORS, Rate Limit, Logging)
│
├── pkg/
│   └── response/                 # Standard JSON envelopes & error serialization
│
├── go.mod                        # Go module definition & dependencies
└── go.sum                        # Cryptographic checksums
```

---

## ⚡ Core Technical Engines & Innovations

### 1. 🔒 Concurrency-Safe Matchmaking (Redis `SETNX`)
When multiple senior mentors attempt to claim the same high-bounty SOS ticket simultaneously, a distributed atomic lock is acquired via Redis:
```go
lockKey := fmt.Sprintf("lock:request:%s", reqID)
acquired, err := s.lockRepo.AcquireLock(ctx, lockKey, mentorID, 30*time.Second)
if err != nil || !acquired {
    return nil, ErrRequestAlreadyAccepted
}
```
This guarantees **zero race conditions** and ensures exactly one mentor enters the session.

### 2. ⏱️ Real-Time Billing Engine (`TickerEngine`)
For each active pair programming room, the `TickerEngine` spins up an independent, non-blocking goroutine with a `time.Ticker`:
- Periodically decrements the client's balance in Redis and increments the session's billable seconds.
- Pushes live balance telemetry to both client and mentor via WebSockets.
- Automatically and gracefully terminates the session when the client's balance drops to zero, disconnecting the WebRTC room.

### 3. 💳 ACID Financial Ledger Transactions
All monetary events (deposits, session billing debits, and mentor payouts) are executed within **MongoDB multi-document ACID transactions** (`mongoClient.UseSession`):
- Guarantees that client balance deduction and mentor credit increment (with an 80% mentor / 20% platform split) happen atomically.
- Records an immutable append-only transaction ledger document for full financial auditability.

### 4. 📹 LiveKit WebRTC SFU Integration
- Mints cryptographic JWT video tokens with custom room permissions (`canPublish: true`, `canSubscribe: true`).
- Processes server-side webhooks (`participant_left`, `room_finished`) to detect unexpected disconnections and freeze billing instantly.

---

## 🌐 API Specification

### Public Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service healthcheck & timestamp |
| `POST` | `/api/auth/register` | Register client or mentor account |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/ws` | Real-time WebSocket connection (ticket radar & notifications) |
| `POST` | `/api/webhooks/livekit` | LiveKit SFU server events webhook |

### Authenticated Routes (`Authorization: Bearer <JWT>`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & balance |
| `PUT` | `/api/auth/mentor/online` | Toggle mentor online/offline queue status |
| `POST` | `/api/requests` | Create new SOS ticket (stack, description, max rate) |
| `GET` | `/api/requests/open` | List open SOS tickets waiting for a mentor |
| `GET` | `/api/requests/my` | List current user's opened tickets |
| `POST` | `/api/requests/{id}/accept` | Mentor exclusively accepts an SOS ticket |
| `GET` | `/api/sessions/{id}` | Fetch session details, LiveKit token & active files |
| `POST` | `/api/sessions/{id}/end` | End session, stop billing & trigger financial settlement |
| `PUT` | `/api/sessions/{id}/code` | Save multi-file Monaco workspace code to cloud |
| `POST` | `/api/sessions/{id}/review` | Submit post-session 1-5 star review & feedback |
| `GET` | `/api/sessions/{id}/review` | Retrieve review for a specific session |
| `GET` | `/api/mentors/{id}/reviews` | List all reviews and rating average for a mentor |
| `GET` | `/api/wallet/balance` | Query current wallet balance & currency |
| `POST` | `/api/wallet/deposit` | Simulate or execute instant PIX / card balance recharge |
| `GET` | `/api/wallet/transactions` | Retrieve complete audit trail of wallet transactions |

---

## 🚀 Getting Started

### Prerequisites
- **Go 1.22+** or **Go 1.24+**
- **MongoDB 7.0+** running locally or in Docker (`localhost:27017`)
- **Redis 7.2+** running locally or in Docker (`localhost:6379`)
- **LiveKit Server** running locally or in Docker (`localhost:7880`)

### 1. Environment Configuration
Create a `.env` file in `backend/`:

```env
PORT=8081
MONGO_URI=mongodb://localhost:27017/unblock
MONGO_DB=unblock
REDIS_URI=localhost:6379
REDIS_PASSWORD=
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
JWT_SECRET=supersecretjwtkeyforunblockdev2026
PLATFORM_FEE_PERCENTAGE=0.20
```

### 2. Install Dependencies
```bash
go mod download
```

### 3. Run the API Server
```bash
go run cmd/api/main.go
```
The server will start listening on `http://localhost:8081`.

---

## 🧪 Running Automated Tests

Run the complete backend test suite:
```bash
go test -v ./...
```

Run tests with race condition detection:
```bash
go test -v -race ./...
```
