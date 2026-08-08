# 🧪 Guia de Teste Passo a Passo dos Endpoints da API (cURL) — Unblock.dev

Este guia fornece uma sequência completa e em ordem cronológica de execução para testar todos os fluxos do backend Go do **Unblock.dev**, desde a verificação de saúde até a abertura de chamado SOS, trava distribuída no Redis, WebSockets e liquidação financeira.

---

## 🛠️ Pré-requisitos para Execução dos Testes

1. Infraestrutura local ativa (MongoDB + Redis):
   ```bash
   docker-compose up -d
   ```

2. Servidor Go executando:
   ```bash
   cd backend
   go run cmd/api/main.go
   ```
   *A API estará escutando na porta `http://localhost:8080`.*

---

## 📋 Sequência de Testes (Passo a Passo)

### 1. Verificação de Saúde (Healthcheck)

Garante que o servidor está rodando e aceitando conexões HTTP.

```bash
curl -i http://localhost:8080/health
```

- **Status Esperado:** `200 OK`
- **Exemplo de Resposta:**
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "time": "2026-08-08T17:36:22-03:00"
    }
  }
  ```

---

### 2. Cadastro de Usuários (Autenticação)

Faremos o cadastro de 2 contas: um **Cliente (Dev)** e um **Mentor**.

#### 2.1. Criar Conta do Cliente
```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dev Cliente",
    "email": "cliente@unblock.dev",
    "password": "password123",
    "role": "client"
  }'
```

- **Status Esperado:** `201 Created`
- **Guarde o Token do Cliente e o ID do Cliente retornados no JSON!**

#### 2.2. Criar Conta do Mentor
```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mentor Master Go",
    "email": "mentor@unblock.dev",
    "password": "password123",
    "role": "mentor",
    "bio": "Especialista em Go, Concorrência e Docker",
    "minute_rate_cents": 350,
    "skills": ["Go", "Docker", "Redis"]
  }'
```

- **Status Esperado:** `201 Created`
- **Guarde o Token do Mentor e o ID do Mentor!**

---

### 3. Login de Usuário

Testa a autenticação com geração de token JWT.

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@unblock.dev",
    "password": "password123"
  }'
```

- **Status Esperado:** `200 OK`

---

### 4. Obter Dados do Perfil Autenticado (`/me`)

Testa o middleware de autorização JWT.

```bash
# Substitua <CLIENT_TOKEN> pelo token retornado no login/registro do cliente
curl -i http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <CLIENT_TOKEN>"
```

- **Status Esperado:** `200 OK`

---

### 5. Recarga de Carteira (Depósito de Créditos)

Deposita R$ 50,00 (5000 centavos) na carteira do cliente.

```bash
curl -i -X POST http://localhost:8080/api/wallet/deposit \
  -H "Authorization: Bearer <CLIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_cents": 5000,
    "gateway": "PIX"
  }'
```

- **Status Esperado:** `200 OK`
- **Exemplo de Resposta:**
  ```json
  {
    "success": true,
    "data": {
      "id": "6a77934f3e87fe9040a348eb",
      "amount_cents": 5000,
      "balance_after_cents": 5000,
      "type": "DEPOSIT",
      "status": "SUCCESS"
    }
  }
  ```

---

### 6. Abertura de Chamado SOS (Cliente)

Cria um pedido de socorro técnico com taxa máxima de R$ 4,00/min.

```bash
curl -i -X POST http://localhost:8080/api/requests \
  -H "Authorization: Bearer <CLIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deadlock em Goroutine com Channel sem Buffer",
    "description": "Estou recebendo fatal error: all goroutines are asleep - deadlock!",
    "stack": ["Go", "Concurrency"],
    "max_minute_rate_cents": 400
  }'
```

- **Status Esperado:** `201 Created`
- **Guarde o `id` do chamado retornado (ex: `6a7793523e87fe9040a348ec`)!**

---

### 7. Listagem de Chamados Abertos (Mentor)

O mentor visualiza os chamados disponíveis na fila.

```bash
curl -i "http://localhost:8080/api/requests/open?stack=Go" \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

- **Status Esperado:** `200 OK`

---

### 8. Aceite de Chamado SOS pelo Mentor (Com Trava `SETNX`)

O mentor aceita o chamado. O backend adquire a trava no Redis (`SETNX`), cria a sessão e gera os tokens WebRTC do LiveKit.

```bash
# Substitua <REQUEST_ID> pelo ID retornado no passo 6
curl -i -X POST http://localhost:8080/api/requests/<REQUEST_ID>/accept \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

- **Status Esperado:** `200 OK`
- **Exemplo de Resposta:** Contém o objeto `session`, `mentor_token`, `client_token` e `livekit_room`.

---

### 9. Teste da Trava Distribuída (Prevenção de Aceite Duplo)

Tente executar a mesma chamada do Passo 8 novamente para simular um segundo mentor clicando no mesmo milissegundo.

```bash
curl -i -X POST http://localhost:8080/api/requests/<REQUEST_ID>/accept \
  -H "Authorization: Bearer <MENTOR_TOKEN>"
```

- **Status Esperado:** `409 Conflict`
- **Exemplo de Resposta:**
  ```json
  {
    "success": false,
    "error": "chamado já aceito por outro mentor"
  }
  ```

---

### 10. Simulação de Webhook do LiveKit (`participant_joined`)

Simula a entrada do participante na sala WebRTC, ativando a goroutine da `TickerEngine` (cobrança em tempo real).

```bash
curl -i -X POST http://localhost:8080/api/webhooks/livekit \
  -H "Content-Type: application/json" \
  -d '{
    "event": "participant_joined",
    "room": {
      "name": "room_<REQUEST_ID>"
    },
    "participant": {
      "identity": "<CLIENT_USER_ID>",
      "name": "Dev Cliente"
    }
  }'
```

- **Status Esperado:** `200 OK`

---

### 11. Salvar Snapshot de Código da Sala

Registra o código final produzido durante o atendimento.

```bash
# Substitua <SESSION_ID> pelo ID da sessão criada no Passo 8
curl -i -X PUT http://localhost:8080/api/sessions/<SESSION_ID>/code \
  -H "Authorization: Bearer <CLIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tch := make(chan int, 1)\n\tch <- 42\n\tfmt.Println(<-ch)\n}"
  }'
```

- **Status Esperado:** `200 OK`

---

### 12. Encerramento da Sessão e Liquidação Financeira

Finaliza a chamada, para o `TickerEngine` e executa a transação ACID no MongoDB.

```bash
curl -i -X POST http://localhost:8080/api/sessions/<SESSION_ID>/end \
  -H "Authorization: Bearer <CLIENT_TOKEN>"
```

- **Status Esperado:** `200 OK`
- **Exemplo de Resposta:**
  ```json
  {
    "success": true,
    "data": {
      "id": "<SESSION_ID>",
      "status": "COMPLETED",
      "financial_summary": {
        "total_charged_cents": 350,
        "mentor_earnings_cents": 280,
        "platform_fee_cents": 70
      }
    }
  }
  ```

---

### 13. Auditoria do Extrato Financeiro Imutável

Consulta o histórico completo de transações da carteira do Cliente.

```bash
curl -i http://localhost:8080/api/wallet/transactions \
  -H "Authorization: Bearer <CLIENT_TOKEN>"
```

- **Status Esperado:** `200 OK`
- Deve listar o débito do atendimento (`SESSION_DEBIT`) e o depósito inicial (`DEPOSIT`).

---

### 14. Teste de Conexão WebSocket (Notificações em Tempo Real)

Você pode testar a conexão do WebSocket Hub usando utilitários como `wscat`:

```bash
# Instalar wscat (se necessário): npm install -g wscat
wscat -c "ws://localhost:8080/api/ws?token=<MENTOR_TOKEN>"
```

Quando um novo chamado SOS for aberto por qualquer cliente, o servidor transmitirá automaticamente o chamado em JSON via WebSocket para este mentor conectado!
