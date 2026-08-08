# 🗺️ O que Falta Fazer (Roadmap & Pendências) — Unblock.dev

Este documento detalha o checklist com todas as pendências, integrações e evoluções necessárias para levar o **Unblock.dev** do ambiente atual até a produção.

---

## 1. Conexão do Frontend (`/frontend`) com a API Go (`/backend`)

- [ ] **Configuração do Axios / Client REST**:
  - Ajustar `frontend/src/lib/axios.ts` com a URL base da API (`http://localhost:8080/api`).
  - Implementar interceptor para injetar o header `Authorization: Bearer <token>` extraído da store de autenticação.
- [ ] **Persistência de Sessão & Cookies**:
  - Salvar o JWT retornado no login/registro em Cookies HTTP-Only ou via Zustand Store para viabilizar as rotas protegidas do Next.js App Router (`/dashboard`, `/request`, `/room/[id]`, `/wallet`).
- [ ] **Integração do LiveKit no Frontend**:
  - Consumir o `client_token` e `mentor_token` gerados no aceite do chamado e repassá-los ao `<LiveKitRoom token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}>`.
- [ ] **Servidor de Edição Colaborativa (Yjs WebSockets)**:
  - Subir a instância do `y-websocket` server (porta `1234`) para conectar o `@monaco-editor/react` via CRDT no documento `doc_<request_id>`.
- [ ] **Escuta de Eventos WebSocket**:
  - Conectar o hook `use-websocket.ts` no frontend à rota `ws://localhost:8080/api/ws?token=...` para receber notificações de pings de saldo, alertas de limite e encerramento.

---

## 2. Gateways de Pagamento Reais (Pix & Cartão)

- [ ] **Webhooks de Gateways (Asaas / Stripe / MercadoPago)**:
  - Implementar o handler `POST /api/webhooks/payment` em Go para receber assincronamente a confirmação de pagamentos Pix/Cartão.
  - Chamar `walletSvc.DepositCredits()` automaticamente após validação da assinatura SHA256 do gateway.
- [ ] **Geração de QR Code Pix em Tempo Real**:
  - Adicionar endpoint em Go `POST /api/wallet/pix/charge` que se comunica com a API do gateway para retornar a chave "Pix Copia e Cola" e imagem do QR Code.

---

## 3. Autenticação OAuth 2.0 (GitHub & Google)

- [ ] **Fluxo OAuth 2.0 Completo**:
  - Implementar troca de `code` de autorização pelos dados do perfil no endpoint `POST /api/auth/oauth/github` e `POST /api/auth/oauth/google`.
  - Vincular perfil do GitHub/Google com o modelo `domain.User` no MongoDB.

---

## 4. Avaliações Pós-Sessão (Reviews & Rating)

- [ ] **Handler de Reviews (`POST /api/reviews`)**:
  - Criar controller e rota para permitir que o cliente envie nota (1 a 5 estrelas) e comentário ao finalizar a sessão.
  - Atualizar atomicamente a média `mentor_profile.rating_avg` e contadores `total_ratings` / `total_sessions` no MongoDB.

---

## 5. Endurecimento de Segurança & Produção

- [ ] **Validação de Assinatura nos Webhooks do LiveKit**:
  - Habilitar o `auth.WebhookReceiver` do SDK do LiveKit no `webhook_handler.go` para validar a chave secreta de cada payload recebido do cluster de mídia.
- [ ] **Rate Limiting Distribuído via Redis**:
  - Migrar o middleware de rate limit em memória para Redis `INCRBY` / Sliding Window para suportar múltiplas instâncias da API Go horizontalmente.
- [ ] **Reverse Proxy & SSL/TLS**:
  - Configurar Nginx / Traefik / Cloudflare com suporte a WebSockets (`Upgrade: websocket`) e SSL/TLS HTTPS nas portas 443 e 80.

---

## 6. Deployment & CI/CD

- [ ] **Build Otimizado Multi-Stage no Dockerfile**:
  - Validar build minimalista em Alpine/Scratch para a API Go.
- [ ] **Cluster LiveKit Cloud / Self-hosted**:
  - Provisionar servidor LiveKit SFU (ex: LiveKit Cloud ou instância EC2/DigitalOcean dedicada) e atualizar variáveis `LIVEKIT_HOST`, `LIVEKIT_API_KEY` e `LIVEKIT_API_SECRET`.
