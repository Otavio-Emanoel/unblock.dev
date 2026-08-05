# Documentação de Arquitetura do Backend — Unblock.dev (Go)

Este documento especifica detalhadamente a arquitetura de software, organização de pacotes, módulos de domínio, engine concorrente de faturamento em tempo real, mecanismos de mensageria via WebSockets e integrações do backend do **Unblock.dev**, desenvolvido em **Go (Golang)**.

---

## 1. Visão Geral Arquitetural & Princípios de Design

O backend do **Unblock.dev** é construído utilizando os princípios de **Clean Architecture** (Arquitetura Limpa) e **Idiomatic Go**, priorizando simplicidade, alta concorrência (goroutines leves) e baixíssima latência na resposta de requisições.

### Princípios Norteadores
* **Desacoplamento Rigoroso:** O domínio (`internal/domain`) não possui dependências de frameworks externos ou banco de dados.
* **Concorrência Nativa via Goroutines & Canais:** Execução de tarefas em tempo real (como o motor de bilhetagem por segundo) através dos primitivos nativos do Go.
* **Comunicação Orientada a Eventos:** Uso de Redis Pub/Sub para notificação instantânea da fila de mentores.
* **Transacionalidade e Segurança:** Operações financeiras envelopadas em transações ACID nativas do MongoDB.

---

## 2. Stack Tecnológica & Dependências

| Categoria | Biblioteca / Pacote | Propósito & Justificativa Técnica |
| --- | --- | --- |
| **Linguagem** | Go v1.22+ / v1.23+ | Alta performance, baixo consumo de memória e modelo de concorrência com Goroutines. |
| **HTTP Router** | `github.com/go-chi/chi/v5` | Roteador idiômico, ultralight, 100% compatível com `net/http` e excelente suporte a middlewares. |
| **Driver MongoDB** | `go.mongodb.org/mongo-driver/v2` | Driver oficial com suporte nativo a transações multi-documento e suporte a `context.Context`. |
| **Cliente Redis** | `github.com/redis/go-redis/v9` | Gerenciamento de cache, Locks distribuídos (`SETNX`) e canais de comunicação Pub/Sub. |
| **WebSockets** | `github.com/gorilla/websocket` | Comunicação bi-direcional em tempo real utilizando o padrão de WebSocket Hub. |
| **SDK LiveKit** | `github.com/livekit/server-sdk-go/v2` | Geração de tokens WebRTC JWT e validação de assinaturas de Webhooks de sala. |
| **JWT & Autenticação** | `github.com/golang-jwt/jwt/v5` | Emissão, parsing e verificação de Access Tokens (EdDSA / HMAC). |
| **Criptografia** | `golang.org/x/crypto/bcrypt` | Armazenamento seguro de senhas com algoritmo bcrypt. |
| **Logging Estruturado**| `log/slog` (Standard Library) | Logs estruturados em JSON de alta performance integrados à biblioteca padrão do Go. |

---

## 3. Estrutura de Diretórios (`Standard Go Project Layout`)

```text
unblock-backend/
├── cmd/
│   ├── api/                     # Entrypoint da API HTTP / WebSockets
│   │   └── main.go
│   └── worker/                  # Worker assíncrono para relatórios e limpezas
│       └── main.go
│
├── internal/                    # Código privado da aplicação (isolado)
│   ├── config/                  # Leitura de variáveis de ambiente (ENVs)
│   │   └── config.go
│   │
│   ├── domain/                  # Entidades de negócio e interfaces puras
│   │   ├── user.go
│   │   ├── request.go
│   │   ├── session.go
│   │   └── transaction.go
│   │
│   ├── handler/                 # Controllers HTTP e WebSockets
│   │   ├── auth_handler.go
│   │   ├── request_handler.go
│   │   ├── session_handler.go
│   │   ├── wallet_handler.go
│   │   ├── ws_handler.go
│   │   └── webhook_handler.go
│   │
│   ├── service/                 # Casos de uso e regras de negócio
│   │   ├── auth_service.go
│   │   ├── matchmaker_service.go
│   │   ├── livekit_service.go
│   │   ├── ticker_engine.go     # Engine concorrente de contagem de saldo
│   │   └── wallet_service.go
│   │
│   ├── repository/              # Persistência de dados (MongoDB e Redis)
│   │   ├── mongodb/
│   │   │   ├── user_repo.go
│   │   │   ├── request_repo.go
│   │   │   ├── session_repo.go
│   │   │   └── transaction_repo.go
│   │   └── redis/
│   │       ├── balance_cache.go
│   │       ├── lock_repo.go
│   │       └── pubsub_repo.go
│   │
│   └── middleware/              # Middlewares HTTP
│       ├── auth_middleware.go
│       ├── cors_middleware.go
│       └── rate_limiter.go
│
├── pkg/                         # Utilitários compartilhados
│   ├── livekit/                 # Wrapper configurado do SDK LiveKit
│   └── response/                # Padronização de respostas JSON
│
├── Dockerfile                   # Build multi-stage otimizado
├── docker-compose.yml           # Dependências de ambiente local (MongoDB + Redis)
└── go.mod
```

---

## 4. Detalhamento Módulo a Módulo

```text
  +-----------------------------------------------------------------------------------+
  |                                   API GATEWAY / CHI                               |
  +-------+-----------------------+----------------------+--------------------+-------+
          |                       |                      |                    |
          v                       v                      v                    v
  +---------------+      +------------------+   +-----------------+  +----------------+
  | Módulo Auth   |      | Módulo Matchmaker|   | Módulo LiveKit  |  | Módulo Wallet  |
  | - GitHub OAuth|      | - WS Mentores    |   | - Token RTC     |  | - Webhooks Pay |
  | - Emissão JWT |      | - Fila de SOS    |   | - Room Webhooks |  | - Tx MongoDB   |
  +---------------+      +------------------+   +-----------------+  +----------------+
```

### 4.1. Módulo `auth` (Autenticação e Sessão)
* **OAuth 2.0:** Troca de código de autorização do GitHub/Google pelos dados de perfil do desenvolvedor.
* **Token Management:** Emissão de `AccessToken` (expiração em 15 minutos) e `RefreshToken` persistido no Redis com rotação de chaves.
* **Middleware de Proteção:** Intercepta requisições HTTP, extrai o Bearer Token, valida a assinatura e injeta a entidade `domain.User` no `context.Context`.

---

### 4.2. Módulo `matchmaker` (Sistema de Socorro e Lock Distribuído)

Quando um cliente cria um chamado de auxílio SOS, ocorre o seguinte fluxo de eventos:

```text
[Cliente: POST /requests] ──> [MongoDB: Save Request (OPEN)]
                                        │
                                        ▼
                           [Redis Pub/Sub: Publish SOS]
                                        │
                                        ▼
                           [WebSocket Hub: Broadcast]
                                        │
                                        ▼
                         [Mentores Conectados Notificados]
                                        │
                         ┌──────────────┴──────────────┐
                         │ (Vários Mentores Clicam)    │
                         ▼                             ▼
              [Mentor A: SETNX Lock]        [Mentor B: SETNX Lock]
                         │                             │
                     (SUCESSO)                      (FALHA)
                         │                             │
                         ▼                             ▼
              [Criar Sala e Redirecionar]     [Erro: Já Aceito]
```

#### Prevenção de Race Condition via Lock Distribuído (`SETNX`)
Para evitar que múltiplos mentores aceitem o mesmo chamado simultaneamente, a API tenta adquirir um Lock atômico no Redis antes de aprovar o atendimento:

```go
lockKey := fmt.Sprintf("lock:request:%s", requestID)
success, err := redisClient.SetNX(ctx, lockKey, mentorID, 10*time.Second).Result()
if !success || err != nil {
    return errors.New("chamado já aceito por outro mentor")
}
```

---

### 4.3. Módulo `livekit` & Webhooks

* **Geração de Tokens WebRTC:** Cria tokens com permissões customizadas de vídeo, áudio e compartilhamento de tela baseadas no perfil (Mentor vs Cliente).
* **Validação de Webhooks:** Utiliza o `WebhookReceiver` do SDK do LiveKit para validar a assinatura SHA256 dos eventos recebidos do cluster de mídia (`participant_joined`, `participant_left`, `room_finished`).

---

### 4.4. Módulo `wallet` & Transações Financeiras

* **Webhooks de Pagamento:** Processa notificações de pagamento via Pix/Cartão de gateways externos (Stripe/Asaas).
* **Consistência Atômica:** Atualização de saldo e inserção de log no extrato executados dentro de transações nativas do MongoDB (`mongo.Session`).

---

## 5. Engine Concorrente de Cobrança em Tempo Real (`TickerEngine`)

A `TickerEngine` é o componente responsável pelo faturamento por minuto em tempo real. Cada chamada ativa roda em uma **Goroutine dedicada isolada**, coordenada por um `time.Ticker` e controlada via `context.Context`.

```text
[LiveKit Webhook: participant_joined]
                 │
                 ▼
     [StartBillingTicker()] ──> Spawns Goroutine por Sala
                                         │
                                         ▼
                             [Loop: Ticker 5 Segundos]
                                         │
                                         ▼
                            [DecrBy Saldo no Redis]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
         [Saldo > 0: Continua]                       [Saldo <= 0]
                   │                                           │
                   ▼                                           ▼
        [Próximo Ticker Tick]                 [LiveKit.DeleteRoom()]
                                              [Desconecta Chamada]
```

### Código Completo da `TickerEngine` em Go

```go
package service

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/livekit/server-sdk-go/v2"
	"github.com/redis/go-redis/v9"
)

type ActiveSession struct {
	CancelFunc context.CancelFunc
	StartedAt  time.Time
}

type TickerEngine struct {
	redisClient   *redis.Client
	livekitClient *livekit.RoomServiceClient
	logger        *slog.Logger
	activeRooms   sync.Map // map[string]*ActiveSession
}

func NewTickerEngine(r *redis.Client, lk *livekit.RoomServiceClient, log *slog.Logger) *TickerEngine {
	return &TickerEngine{
		redisClient:   r,
		livekitClient: lk,
		logger:        log,
	}
}

// StartBillingTicker inicia o ciclo de cobrança de 5 em 5 segundos
func (e *TickerEngine) StartBillingTicker(parentCtx context.Context, roomName string, clientID string, ratePerMinCents int64) {
	ctx, cancel := context.WithCancel(parentCtx)

	session := &ActiveSession{
		CancelFunc: cancel,
		StartedAt:  time.Now(),
	}
	e.activeRooms.Store(roomName, session)

	go func() {
		defer func() {
			e.activeRooms.Delete(roomName)
			cancel()
		}()

		// Intervalo de verificação: 5 segundos
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		// Custo por intervalo de 5 segundos
		costPerInterval := int64(float64(ratePerMinCents) / 12.0)

		for {
			select {
			case <-ctx.Done():
				e.logger.Info("Ticker de cobrança finalizado", "room", roomName)
				return

			case <-ticker.C:
				key := fmt.Sprintf("user:balance:cache:%s", clientID)
				newBalance, err := e.redisClient.DecrBy(ctx, key, costPerInterval).Result()

				if err != nil {
					e.logger.Error("Erro ao decrementar saldo no Redis", "err", err, "client", clientID)
					continue
				}

				// Alerta de 2 minutos restantes (120 seg)
				if newBalance > 0 && newBalance <= (ratePerMinCents*2) {
					e.logger.Warn("Cliente com saldo baixo!", "room", roomName, "balance", newBalance)
					// Dispara evento WS de aviso ao cliente
				}

				// Se o saldo esgotou, derruba a sala no LiveKit imediatamente
				if newBalance <= 0 {
					e.logger.Warn("Saldo ESGOTADO. Forçando encerramento da sala no LiveKit!", "room", roomName)

					_, err := e.livekitClient.DeleteRoom(ctx, &livekit.DeleteRoomRequest{
						Room: roomName,
					})
					if err != nil {
						e.logger.Error("Erro ao apagar sala no LiveKit", "err", err)
					}
					return
				}
			}
		}
	}()
}

// StopBillingTicker encerra manualmente a goroutine de cobrança
func (e *TickerEngine) StopBillingTicker(roomName string) {
	if val, ok := e.activeRooms.Load(roomName); ok {
		session := val.(*ActiveSession)
		session.CancelFunc()
		e.activeRooms.Delete(roomName)
	}
}
```

---

## 6. Arquitetura do WebSocket Hub (`Hub Pattern`)

Para gerenciamento das conexões de mentores e notificações em tempo real, o Go implementa o padrão **Hub de WebSockets** concorrente e thread-safe:

```go
package ws

import (
	"sync"
	"github.com/gorilla/websocket"
)

type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	Send     chan []byte
	UserID   string
	IsMentor bool
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}
```

---

## 7. Desligamento Suave (Graceful Shutdown)

A aplicação intercepta sinais de interrupção do sistema operacional (`SIGINT`, `SIGTERM`) para encerrar conexões com segurança sem corromper transações ativas:

```go
shutdown := make(chan os.Signal, 1)
signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

<-shutdown
slog.Info("Iniciando desligamento suave do servidor...")

ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
defer cancel()

// 1. Parar o servidor HTTP
if err := server.Shutdown(ctx); err != nil {
    slog.Error("Erro ao desligar servidor HTTP", "err", err)
}

// 2. Fechar conexões de banco de dados
mongoClient.Disconnect(ctx)
redisClient.Close()

slog.Info("Servidor encerrado com sucesso!")
```
