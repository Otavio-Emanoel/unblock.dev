# 🚀 Unblock.dev — Pair Programming & SOS Bug-Fixing Sob Demanda

[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=flat&logo=redis)](https://redis.io/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-FF4F00?style=flat&logo=webrtc)](https://livekit.io/)

O **Unblock.dev** é uma plataforma de pair programming em tempo real no modelo *"SOS para Desenvolvedores"*. O sistema conecta devs travados em problemas técnicos complexos a mentores especialistas de forma instantânea, com salas colaborativas completas (vídeo WebRTC, editor Monaco sincronizado via CRDT e terminal de logs) e cobrança transparente por minuto.

---

## 📸 Visão Geral do Sistema

```text
                               +----------------------------------------+
                               |     CLIENTE FRONTEND (Next.js 15)      |
                               +---+----------------+---------------+---+
                                   |                |               |
                    HTTP / WS REST |    LiveKit SDK |       Yjs WS  |
                                   v                v               v
                        +------------------+  +----------+   +--------------+
                        |  BACKEND GO API  |  | LiveKit  |   | Yjs WS Server|
                        +--------+---------+  | Cluster  |   | (Sync CRDT)  |
                                 |            +----------+   +--------------+
                       +---------+---------+
                       |                   |
                       v                   v
              +-----------------+ +-----------------+
              |  MongoDB 7.0    | |    Redis 7.2    |
              | (Persistência)  | | (Cache/PubSub)  |
              +-----------------+ +-----------------+
```

---

## ✨ Principais Funcionalidades

- ⚡ **Chamados SOS Instantâneos:** Clientes abrem chamados definindo a stack (Go, React, Docker, SQL) e oferta R$/minuto. Mentores online recebem notificações via WebSocket em tempo real.
- 🔒 **Matchmaking sem Race Condition:** Garantia de aceite único por chamado utilizando Locks Distribuídos com Redis (`SETNX`).
- 📹 **Videoconferência HD e Screen Share:** Comunicação fluida via LiveKit WebRTC SFU com adaptação dinâmica de banda.
- 💻 **Editor Colaborativo Simultâneo:** Edição de código em tempo real baseada em Monaco Editor (VS Code Engine) e Yjs (CRDTs), sem risco de sobrescrita de texto ou conflitos.
- ⏱️ **Motor de Saldo em Tempo Real (TickerEngine):** Faturamento transparente debitado em tempo real por minuto. Desconexão graciosa imediata no encerramento de saldo.
- 💳 **Gestão de Carteira:** Adição de créditos via Pix/Cartão e extrato financeiro imutável (*Append-Only Ledger*).

---

## 💳 Planos & Pacotes de Crédito (Pay-Per-Minute)

O **Unblock.dev** adota um modelo transparente de **cobrança por minuto (Pay-Per-Minute)**. O usuário recarrega a carteira digital e os créditos são debitados em tempo real (segundo a segundo via `TickerEngine` em Go) estritamente durante o tempo ativo da chamada de pair programming na sala `/room/[id]`.

### Pacotes de Recarga Disponíveis

| Pacote | Valor | Minutos Estimados | Indicado Para | Diferenciais Chave |
| --- | --- | --- | --- | --- |
| **Pacote Starter** | **R$ 30,00** | ~12 min | Dúvidas pontuais, erros de compilação e syntax bugs | Match direto com mentores, Vídeo HD WebRTC + Monaco Editor CRDT |
| **Pacote Pro** *(Mais Popular)* | **R$ 60,00** | ~24 min | Bugs de concorrência, Redis locks, refatorações complexas | Prioridade na fila de match (&lt; 90s), recargas Pix/Cartão instantâneas, exportação de código |
| **Pacote Senior** | **R$ 150,00** | ~60 min | Arquitetura de sistemas, tuning SQL, Kubernetes, Go microservices | Mentores especialistas Tier-1, prioridade máxima de chamado, sessões estendidas |

---

## 🛠️ Stack Tecnológica

### Frontend (`/frontend`)
- **Core:** Next.js 15 (App Router), React 19, TypeScript.
- **UI & Estilos:** Tailwind CSS, Shadcn/ui (Radix UI), Lucide React.
- **Editor Colaborativo:** `@monaco-editor/react`, `yjs`, `y-websocket`.
- **Mídia:** `@livekit/components-react`, `livekit-client`.
- **Gerenciamento de Estado:** Zustand (Estado local/transitório) e TanStack Query v5 (Cache REST).

### Backend (`/backend`)
- **Linguagem & Framework:** Go 1.22+, Chi Router.
- **Tempo Real & Concorrência:** Goroutines dedicadas por sala, `time.Ticker`, Gorilla WebSockets (Hub Pattern).
- **Integrações:** LiveKit Server SDK Go, Redis Go-Redis v9.
- **Segurança & Auth:** JWT (`golang-jwt/jwt/v5`), bcrypt.

### Banco de Dados & Cache
- **MongoDB 7.0+:** Banco NoSQL principal com suporte a transações ACID multi-documento e índices TTL.
- **Redis 7.2:** Cache de saldo, gerenciamento de Pub/Sub para broadcast de chamados e locks distribuídos.

---

## 📂 Estrutura do Repositório

```text
unblock.dev/
├── docs/                         # Documentações de Arquitetura do Projeto
│   ├── frontend.md               # Detalhamento completo da camada Client
│   ├── backend.md                # Especificação da API Go, TickerEngine e WebSockets
│   └── database.md               # Modelagem de dados BSON, schemas e índices MongoDB
│
├── frontend/                     # Aplicação Next.js (App Router)
│   ├── src/
│   │   ├── app/                  # Rotas e páginas (Dashboard, Request, Room, Wallet)
│   │   ├── components/           # UI Components (Shadcn + Shared)
│   │   ├── features/             # Módulos de domínio (Editor, LiveKit, Room, Wallet)
│   │   ├── hooks/                # Custom hooks (WS, Ticker)
│   │   ├── lib/                  # SDK Clients (LiveKit, Axios, Yjs)
│   │   └── stores/               # Zustand Stores
│   └── package.json
│
├── backend/                      # API Backend em Go
│   ├── cmd/api/                  # Entrypoint main.go
│   ├── internal/
│   │   ├── domain/               # Entidades e Interfaces puras
│   │   ├── handler/              # Controllers HTTP e WebSockets
│   │   ├── service/              # Regras de Negócio e TickerEngine
│   │   ├── repository/           # MongoDB e Redis Repositories
│   │   └── middleware/           # Auth JWT e Rate Limiter
│   └── go.mod
│
├── docker-compose.yml            # Ambiente Local (MongoDB + Redis + LiveKit)
└── README.md
```

---

## 📖 Documentação Detalhada do Projeto

Para conferir todos os detalhes técnicos de implementação, consulte os manuais específicos localizados no diretório [`docs/`](file:///c:/Users/Aluno/Downloads/unblock.dev/docs):

- 📘 **[Documentação de Arquitetura Frontend](file:///c:/Users/Aluno/Downloads/unblock.dev/docs/frontend.md)**: Mapeamento de telas, layouts da sala imersiva, concorrência de tempo real e design system.
- 📙 **[Documentação de Arquitetura Backend](file:///c:/Users/Aluno/Downloads/unblock.dev/docs/backend.md)**: Clean Architecture em Go, algoritmo da `TickerEngine`, WebSocket Hub e prevenção de race condition.
- 🟢 **[Documentação do Banco de Dados (MongoDB)](file:///c:/Users/Aluno/Downloads/unblock.dev/docs/database.md)**: Schemas BSON, índices compostos e TTL, transações ACID e extrato financeiro imutável.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** v20+ e **pnpm** ou **npm**
- **Go** v1.22+
- **Docker** e **Docker Compose**

### 1. Clonar o Repositório e Subir Infraestrutura Local
```bash
# Subir MongoDB e Redis via Docker
docker-compose up -d
```

### 2. Configurar Variáveis de Ambiente
Crie arquivos `.env` na raiz das pastas `backend/` e `frontend/` com base nos exemplos:

**Backend (`backend/.env`):**
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/unblock
REDIS_URI=localhost:6379
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
JWT_SECRET=supersecretjwtkey
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXT_PUBLIC_YJS_WS_URL=ws://localhost:1234
```

### 3. Executar o Backend Go
```bash
cd backend
go run cmd/api/main.go
```

### 4. Executar o Frontend Next.js
```bash
cd frontend
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para interagir com a aplicação.

---

## 🛡️ Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.