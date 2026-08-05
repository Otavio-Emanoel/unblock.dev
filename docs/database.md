# Documentação de Arquitetura do Banco de Dados — Unblock.dev (MongoDB)

Este documento especifica a modelagem de dados, esquemas de coleções, estratégias de indexação, transações ACID e governança de persistência da camada de banco de dados do **Unblock.dev**, utilizando **MongoDB** com **Go (Official MongoDB Driver)**.

---

## 1. Visão Geral & Decisão Arquitetural

O **Unblock.dev** utiliza o **MongoDB** (versão 7.0+) como seu banco de dados principal. 

### Por que MongoDB para o Unblock.dev?
* **Modelagem Flexível de Sessões e Snippets:** Permite o armazenamento de snapshots de código, logs de terminal e subdocumentos de perfil de mentor sem a rigidez de tabelas relacionais.
* **Transações Multi-Documento (ACID):** Garante a atomicidade nas operações financeiras críticas (débito de saldo do cliente, repasse para o mentor e alteração de status da sessão).
* **Alta Performance de Leitura/Escrita:** Excelente throughput para operações de alta frequência, como pings de sessão e atualizações de status.
* **TTL Indexes (Time-To-Live):** Auto-expiração automática de chamados de auxílio não atendidos na fila.

---

## 2. Diagrama Entidade-Relacionamento Lógico (ERD)

```text
               +-------------------+
               |       users       |
               +-------------------+
               | _id (PK)          |
               | email (Unique)    |
               | wallet.balance    |
               | mentor_profile {} |
               +--------+----------+
                        |
            +-----------+-----------+
            | 1:N                   | 1:N
            v                       v
   +-----------------+     +------------------+
   |    requests     |     |   transactions   |
   +-----------------+     +------------------+
   | _id (PK)        |     | _id (PK)         |
   | client_id (FK)  |     | user_id (FK)     |
   | status          |     | amount_cents     |
   +--------+--------+     | type (DEBIT/...) |
            |              +------------------+
            | 1:1
            v
   +-----------------+
   |    sessions     |
   +-----------------+
   | _id (PK)        |
   | request_id (FK) |
   | client_id (FK)  |
   | mentor_id (FK)  |
   | status          |
   | duration_sec    |
   +--------+--------+
            |
            | 1:1
            v
   +-----------------+
   |     reviews     |
   +-----------------+
   | _id (PK)        |
   | session_id (FK) |
   | rating          |
   +-----------------+
```

---

## 3. Especificação das Coleções e Schemas BSON

### 3.1. Coleção `users`
Armazena tanto usuários clientes quanto mentores, utilizando o padrão de *Subdocument Embedding* para dados específicos de mentoria.

```json
{
  "_id": ObjectId("66b2a1e4f1a2b3c4d5e6f7a8"),
  "name": "Lucas Silva",
  "email": "lucas@example.com",
  "password_hash": "$2a$12$e8n... (bcrypt hash)",
  "avatar_url": "https://avatars.githubusercontent.com/u/123456",
  "role": "mentor", // "client" | "mentor" | "admin"
  "wallet": {
    "balance_cents": NumberLong(15000), // R$ 150,00 em centavos
    "currency": "BRL"
  },
  "mentor_profile": {
    "bio": "Desenvolvedor Backend especialista em Go, Microserviços e Docker.",
    "minute_rate_cents": NumberLong(350), // R$ 3,50 por minuto
    "skills": ["Go", "Docker", "PostgreSQL", "MongoDB", "Kubernetes"],
    "is_online": true,
    "rating_avg": 4.95,
    "total_ratings": 42,
    "total_sessions": 58
  },
  "social_links": {
    "github": "https://github.com/lucassilva",
    "linkedin": "https://linkedin.com/in/lucassilva"
  },
  "created_at": ISODate("2026-01-15T10:00:00Z"),
  "updated_at": ISODate("2026-08-05T08:00:00Z")
}
```

---

### 3.2. Coleção `requests` (Fila de Chamados SOS)
Representa os pedidos de auxílio criados pelos clientes aguardando por um mentor.

```json
{
  "_id": ObjectId("66b2b5f9f1a2b3c4d5e6f7b9"),
  "client_id": ObjectId("66b2a1e4f1a2b3c4d5e6f7a8"),
  "title": "Erro de Deadlock em Goroutines com Canais Não-Bufferizados",
  "description": "Estou recebendo fatal error: all goroutines are asleep - deadlock! preciso de ajuda para identificar o vazamento.",
  "stack": ["Go", "Concurrency"],
  "max_minute_rate_cents": NumberLong(400), // Cliente aceita até R$ 4,00/min
  "status": "OPEN", // "OPEN" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "CANCELLED"
  "accepted_mentor_id": null,
  "expires_at": ISODate("2026-08-05T09:15:00Z"), // Expira em 15 min se ninguém aceitar
  "created_at": ISODate("2026-08-05T09:00:00Z"),
  "updated_at": ISODate("2026-08-05T09:00:00Z")
}
```

---

### 3.3. Coleção `sessions` (Salas de Atendimento)
Mantém o registro completo de cada sessão de pair programming, incluindo os custos calculados e links dos serviços de tempo real.

```json
{
  "_id": ObjectId("66b2c6a0f1a2b3c4d5e6f7c0"),
  "request_id": ObjectId("66b2b5f9f1a2b3c4d5e6f7b9"),
  "client_id": ObjectId("66b2a1e4f1a2b3c4d5e6f7a8"),
  "mentor_id": ObjectId("66b2a999f1a2b3c4d5e6f7f1"),
  "minute_rate_cents": NumberLong(350),
  "status": "COMPLETED", // "ACTIVE" | "COMPLETED" | "EXHAUSTED" | "CANCELLED"
  "livekit_room_name": "room_66b2c6a0f1a2b3c4d5e6f7c0",
  "yjs_doc_id": "doc_66b2c6a0f1a2b3c4d5e6f7c0",
  "started_at": ISODate("2026-08-05T09:05:00Z"),
  "ended_at": ISODate("2026-08-05T09:25:00Z"),
  "duration_seconds": 1200, // 20 minutos
  "financial_summary": {
    "total_charged_cents": NumberLong(7000),  // R$ 70,00 debitado do cliente
    "mentor_earnings_cents": NumberLong(5600), // R$ 56,00 (80% repassado ao mentor)
    "platform_fee_cents": NumberLong(1400)    // R$ 14,00 (20% taxa Unblock.dev)
  },
  "saved_code_snippet": "package main\n\nfunc main() {\n\tch := make(chan int, 1)\n\tch <- 42\n}",
  "created_at": ISODate("2026-08-05T09:05:00Z"),
  "updated_at": ISODate("2026-08-05T09:25:00Z")
}
```

---

### 3.4. Coleção `transactions` (Extrato Financeiro)
Registra todas as movimentações da carteira do usuário de forma imutável (Append-Only Ledger).

```json
{
  "_id": ObjectId("66b2d711f1a2b3c4d5e6f7d1"),
  "user_id": ObjectId("66b2a1e4f1a2b3c4d5e6f7a8"),
  "type": "SESSION_DEBIT", // "DEPOSIT" | "SESSION_DEBIT" | "MENTOR_PAYOUT" | "REFUND"
  "amount_cents": NumberLong(-7000), // Valor negativo para débitos
  "balance_after_cents": NumberLong(8000),
  "reference_session_id": ObjectId("66b2c6a0f1a2b3c4d5e6f7c0"),
  "gateway": "INTERNAL", // "STRIPE" | "ASAAS" | "PIX" | "INTERNAL"
  "payment_external_id": null,
  "description": "Débito referente a 20 minutos na sessão #66b2c6a0",
  "status": "SUCCESS", // "PENDING" | "SUCCESS" | "FAILED"
  "created_at": ISODate("2026-08-05T09:25:01Z")
}
```

---

### 3.5. Coleção `reviews` (Avaliações pós-sessão)

```json
{
  "_id": ObjectId("66b2e822f1a2b3c4d5e6f7e2"),
  "session_id": ObjectId("66b2c6a0f1a2b3c4d5e6f7c0"),
  "client_id": ObjectId("66b2a1e4f1a2b3c4d5e6f7a8"),
  "mentor_id": ObjectId("66b2a999f1a2b3c4d5e6f7f1"),
  "rating": 5, // 1 a 5 estrelas
  "comment": "Excepcional! O mentor identificou o deadlock na goroutine em menos de 5 minutos.",
  "created_at": ISODate("2026-08-05T09:27:00Z")
}
```

---

## 4. Estratégia de Índices e Performance

Para assegurar baixa latência nas consultas mais frequentes da API Go, criamos os seguintes índices:

```javascript
// Coleção: users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1, "mentor_profile.is_online": 1, "mentor_profile.skills": 1 });

// Coleção: requests
db.requests.createIndex({ "status": 1, "created_at": -1 });
db.requests.createIndex({ "client_id": 1 });
db.requests.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 }); // TTL Index para expiração automática!

// Coleção: sessions
db.sessions.createIndex({ "client_id": 1, "created_at": -1 });
db.sessions.createIndex({ "mentor_id": 1, "created_at": -1 });
db.sessions.createIndex({ "status": 1 });

// Coleção: transactions
db.transactions.createIndex({ "user_id": 1, "created_at": -1 });
```

---

## 5. Transações ACID Multi-Documento (Faturamento de Sessão)

Quando uma sessão é encerrada ou interrompida por falta de saldo, o backend Go executa uma **Transação ACID Nativa do MongoDB** para garantir o fechamento financeiro atômico:

```text
                        START MONGO TRANSACTION
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[Update User Wallet]    [Insert Transaction Record]   [Update Session Status]
Dedução do saldo        Registro imutável no          Status = COMPLETED /
do cliente              extrato financeiro            EXHAUSTED
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   │
                        COMMIT MONGO TRANSACTION
```

### Garantia de Consistência
Se qualquer uma das 3 operações falhar (ex: erro de rede ou saldo inconsistente), a transação é **abortada (Rollback)** e o saldo do cliente permanece protegido.

---

## 6. Governança e Boas Práticas de Segurança

1. **Tipos Numéricos para Valores Monetários:** Todos os valores financeiros utilizam `NumberLong` (inteiro de 64 bits) armazenando valores em **centavos** (ex: R$ 10,50 = 1050), evitando problemas de arredondamento de ponto flutuante (*float rounding errors*).
2. **Conexões Seguras:** O driver de Go conecta ao cluster MongoDB Atlas/Self-hosted exigindo **TLS/SSL e autenticação via SCRAM-SHA-256**.
3. **Auditoria Imutável:** A coleção `transactions` não aceita operações de `UPDATE` ou `DELETE` na regra de negócio da aplicação (Write-Once-Read-Many).
