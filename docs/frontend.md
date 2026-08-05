# Documentação de Arquitetura do Frontend — Unblock.dev

Este documento especifica detalhadamente a arquitetura, estrutura de diretórios, mapeamento de telas, gerenciamento de estado, integrações em tempo real e decisões de design da camada Frontend do **Unblock.dev**.

---

## 1. Visão Geral do Produto & Proposta de Valor

O **Unblock.dev** é uma plataforma de pair programming sob demanda ("SOS para Desenvolvedores") focada em desbloquear devs travados em bugs ou desafios técnicos complexos em tempo real.

### Principais Pilares da Experiência
* **Atendimento Imediato (On-Demand):** O cliente cria um pedido de auxílio especificando a stack e o problema, e um mentor qualificado aceita o chamado.
* **Cobrança por Minuto:** O valor da sessão é debitado progressivamente do saldo do cliente em tempo real a cada minuto decorrido.
* **Ambiente Imersivo Colaborativo:** Uma sala (`/room/[id]`) integrada com vídeo/áudio de baixa latência, editor de código colaborativo simultâneo (CRDT) e visualizador de logs/terminal.

---

## 2. Stack Tecnológica & Racional das Dependências

| Categoria | Tecnologia / Lib | Motivo da Escolha & Racional |
| --- | --- | --- |
| **Core Framework** | Next.js 15+ (App Router) | SSR/SSG otimizado para a Landing Page (SEO) e Client Components reativos para a sala interativa. |
| **Linguagem** | TypeScript (Strict Mode) | Tipagem estática rigorosa para contratos de API, eventos WebSocket e estado da aplicação. |
| **Estilização & Design System** | Tailwind CSS + Shadcn/ui (Radix UI) | Utilidades de alta performance com primitivas acessíveis (a11y) e estilização *Dark Native*. |
| **Ícones & Tipografia** | Lucide React, Inter & JetBrains Mono | Ícones vetoriais leves e tipografia otimizada para legibilidade de interface e código. |
| **Comunicação de Mídia** | `@livekit/components-react`, `livekit-client` | Infraestrutura WebRTC SFU escalável para vídeo, áudio e compartilhamento de tela com baixíssima latência. |
| **Edição Colaborativa** | `@monaco-editor/react`, `yjs`, `y-websocket`, `y-monaco` | Monaco (engine do VS Code) sincronizado via Yjs (CRDT), permitindo edição simultânea de texto e cursores remotos sem conflito. |
| **Data Fetching REST** | TanStack Query (React Query v5) | Cache automático, invalidação reativa e gerenciamento de estado assíncrono para a API em Go. |
| **Estado Global Transitório** | Zustand | Estado local minimalista sem overhead de Context API para controle de modais, conexões ativas e saldo local. |
| **Formulários & Validação** | React Hook Form + Zod | Validação de schemas no client e server-side com suporte a inferência automática de tipos TypeScript. |

---

## 3. Estrutura de Diretórios Modular (`src/`)

O projeto adota uma arquitetura baseada em **Features**, agrupando componentes, hooks e tipos por domínio de negócio:

```text
src/
├── app/                          # App Router (Rotas, Layouts e Middlewares)
│   ├── (auth)/                   # Grupo de Autenticação
│   │   ├── login/page.tsx        # Tela de Login (OAuth + Credenciais)
│   │   └── register/page.tsx     # Cadastro de Cliente / Mentor
│   ├── (dashboard)/              # Painel do Desenvolvedor (Cliente)
│   │   ├── dashboard/page.tsx    # Métricas de uso e atalhos
│   │   ├── request/page.tsx      # Formulário de pedido de SOS
│   │   ├── wallet/page.tsx       # Gestão de saldo e recargas (Pix/Cartão)
│   │   └── layout.tsx            # Navigation Bar e Sidebar do Cliente
│   ├── (mentor)/                 # Painel do Mentor
│   │   ├── mentor/dashboard/page.tsx # Fila de chamados em tempo real
│   │   └── mentor/layout.tsx     # Layout exclusivo com toggle Online/Offline
│   ├── room/[id]/page.tsx        # Sala principal de Pair Programming
│   ├── layout.tsx                # Layout Raiz (Providers de Tema, QueryClient)
│   └── page.tsx                  # Landing Page institucional otimizada para conversão
│
├── components/                   # Componentes Genéricos e Reutilizáveis
│   ├── ui/                       # Primitivas Shadcn (Button, Dialog, Sheet, Dropdown)
│   ├── shared/                   # Header, Footer, UserAvatar, ModeToggle
│   └── feedback/                 # EmptyStates, LoadingSpinners, SoundAlerts
│
├── features/                     # Módulos de Negócio Isolados
│   ├── auth/                     # Forms de autenticação, hooks de sessão
│   ├── editor/                   # Monaco Editor, hooks Yjs, toolbar de linguagem
│   ├── livekit/                  # Player de vídeo, controles de mic/cam, tela cheia
│   ├── room/                     # Header com timer de saldo, chat e encerramento
│   └── wallet/                   # Checkout Stripe/Asaas, extrato de consumo
│
├── hooks/                        # Custom Hooks Utilitários Universais
│   ├── use-websocket.ts          # Conexão e auto-reconexão WS com o backend Go
│   └── use-balance-ticker.ts     # Decremento otimista do saldo e sincro via ping
│
├── lib/                          # Configurações de Clientes e SDKs
│   ├── axios.ts                  # Cliente HTTP interceptado para JWT
│   ├── livekit.ts                # Utilities de conexões LiveKit
│   └── yjs.ts                    # Instanciação de Providers Yjs e Websockets
│
├── stores/                       # Lojas Zustand (Estado Client Transitório)
│   ├── use-auth-store.ts         # Dados do usuário logado e token
│   ├── use-room-store.ts         # Estado de layout da sala, áudio/vídeo muted
│   └── use-wallet-store.ts       # Saldo atual em R$ e contagem de segundos
│
└── types/                        # Tipos e Schemas Globais TypeScript
    ├── api.ts                    # Respostas da API Go
    ├── room.ts                   # DTOs de Sessão e Chamados
    └── user.ts                   # Perfil de Usuário e Perfil de Mentor
```

---

## 4. Mapeamento de Telas, Rotas e Fluxos de Usuário

| Rota | Acesso | Descrição e Componentes Chave |
| --- | --- | --- |
| `/` | Público | Landing Page com proposta de valor, vídeo demonstrativo, calculadora de estimativa de custo por minuto e CTAs. |
| `/auth/login` | Público | Autenticação via GitHub/Google OAuth e e-mail/senha com suporte a redirecionamento pós-login. |
| `/auth/register` | Público | Seleção de perfil (Desenvolvedor ou Mentor) com onboarding inicial. |
| `/dashboard` | Cliente | Visão geral do saldo em conta, histórico de atendimentos recentes e botão de disparo rápido de SOS. |
| `/request` | Cliente | Formulário para abertura de chamado: seleção de linguagem/stack (Go, React, Docker, SQL), descrição do bug e oferta R$/minuto. |
| `/wallet` | Cliente | Compras de pacotes de crédito via Pix (geração de QR Code estático/dinâmico) e cartão, mais extrato linha a linha. |
| `/mentor/dashboard` | Mentor | Fila reativa de chamados abertos recebida via WebSocket, aceitação rápida de sessões e resumo de ganhos. |
| `/room/[id]` | Ambos (Protegido) | **Ambiente imersivo de atendimento** (Vídeo WebRTC + Editor Monaco Yjs + Chat + Ticker de Saldo). |

### Fluxos Principais de Uso

1. **Fluxo do Cliente (Pedido de Ajuda):**
   `Dashboard` → `Criar Request (/request)` → *Aguardando Mentor em Fila* → *Mentor Aceita* → `Redirecionamento automático para /room/[id]`.
2. **Fluxo do Mentor (Atendimento):**
   `Dashboard do Mentor` → *Toggle Online* → *Notificação de Novo Chamado* → *Clique em Aceitar* → `Redirecionamento automático para /room/[id]`.

---

## 5. Arquitetura Detalhada da Sala de Atendimento (`/room/[id]`)

A rota `/room/[id]` é a tela central do sistema. Ela utiliza um layout de workspace flexível baseado em painéis redimensionáveis (`react-resizable-panels`):

```text
+-----------------------------------------------------------------------------------+
|  HEADER DA SALA                                                                   |
|  Status Conexão | Usuários On | Saldo Restante: R$ 45,00 (15 min) | [Encerrar]     |
+------------------------------------------+----------------------------------------+
|                                          |                                        |
|  PAINEL ESQUERDO (25% - 35%)             |  PAINEL CENTRAL / DIREITO (65% - 75%)   |
|                                          |                                        |
|  +------------------------------------+  |  +----------------------------------+  |
|  | LiveKit Participant (Vídeo Mentor) |  |  | Monaco Code Editor               |  |
|  +------------------------------------+  |  | (Sincronização em tempo real    |  |
|  | LiveKit Participant (Vídeo Cliente)|  |  |  via Yjs CRDT + Cursores)        |  |
|  +------------------------------------+  |  |                                  |  |
|  | Controles (Mic, Cam, ScreenShare)  |  |  +----------------------------------+  |
|  +------------------------------------+  |  | Session Terminal / Console Output|  |
|  | Chat de Texto & Troca de Snippets  |  |  | (Logs de Execução / Erros)       |  |
|  +------------------------------------+  |  +----------------------------------+  |
|                                          |                                        |
+------------------------------------------+----------------------------------------+
```

### Componentes Internos da Sala

1. **`RoomHeader`**: Exibe indicador de saúde do sinal LiveKit, cronômetro de atendimento, valor restante em saldo e ação de encerramento seguro.
2. **`VideoGrid`**: Renderiza os fluxos de vídeo/áudio dos participantes com controle visual de detecção de fala (*active speaker*).
3. **`CollaborativeEditor`**: Engine Monaco configurada para binding direto no `Y.Text` do Yjs. Permite syntax highlighting, alternância de linguagem (JS, TS, Go, Python, SQL) e marcação de cursores nomeados com cores distintas para cada participante.
4. **`SessionTerminal`**: Componente de leitura/escrita para colar outputs de terminal, rastros de stack trace e comandos bash sugeridos.
5. **`RoomChat`**: Canal de suporte textual para compartilhamento rápido de links e pequenos snippets.

---

## 6. Fluxo de Comunicação e Concorrência em Tempo Real

O frontend orquestra simultaneamente **três canais assíncronos independentes**:

```text
                     +---------------------------+
                     |    Next.js Room Client    |
                     +-----+-------+-------+-----+
                           |       |       |
            LiveKit SDK    |       |WS Go  |Yjs WS Protocol
           (Media Stream)  |       |API    |(CRDT Operations)
                           v       v       v
                      +--------+ +---+ +-------+
                      | LiveKit| |Go | | Yjs   |
                      | Cluster| |API| | Server|
                      +--------+ +---+ +-------+
```

### Detalhamento das 3 Camadas de Tempo Real

1. **Camada de Mídia e Videoconferência (LiveKit SFU):**
   * O cliente obtém um token JWT de sala emitido pela API Go.
   * Conecta diretamente ao servidor LiveKit estabelecendo conexões Peer-to-Server para áudio, vídeo HD e compartilhamento de tela com adaptação dinâmica de bitrate.

2. **Camada de Estado da Sessão & Faturamento (WebSocket API Go):**
   * Canal bi-direcional para transmissão de eventos de controle.
   * **Heartbeat & Ticker Sync:** A API envia pings periódicos confirmando a dedução do saldo.
   * **Notificações de Limite:** Ao atingir 2 minutos de saldo restante, um aviso sonoro e toast alerta o cliente.
   * **Evento `BALANCE_EXHAUSTED`:** Se o saldo zerar, a sala entra em estado de visualização bloqueada e a chamada é finalizada automaticamente pelo backend.

3. **Camada de Edição Colaborativa (Yjs WebSockets):**
   * Canal CRDT para envio de operações delta de texto.
   * Não trafega o código completo a cada digitação; transmite apenas edições atômicas e posições do cursor, garantindo ausência de conflitos em caso de digitação simultânea.

---

## 7. Gerenciamento de Estado & Motor de Saldo (Balance Ticker Engine)

Para evitar dependência exclusiva de delays da rede, o saldo é mantido através de um padrão de **Sincronização Otimista com Correção de Drift**:

```text
[Backend WS Event: Saldo R$ 60,00] ──> [Atualiza Store Zustand]
                                             │
                                             ▼
                                  [Interval Local 1 segundo]
                                  [Decrementa R$ (Custo/60)]
                                             │
                                             ▼
[Novo WS Event do Backend (Ping)] ──> [Ajusta Drift se houver divergência]
```

### Regras do Motor de Saldo
* **Decremento Otimista:** A UI reduz o valor visual a cada segundo para que o cliente tenha consciência exata do custo.
* **Reconciliação:** Sempre que um pacote de heartbeat chega da API em Go, a loja Zustand reajusta o saldo oficial server-side.
* **Segurança:** A decisão de derrubar a sessão por falta de saldo é sempre do backend; a UI apenas executa a renderização do bloqueio.

---

## 8. Identidade Visual e Design System (Dark Native)

A plataforma utiliza um tema escuro profundo (*Dark Native*), projetado para reduzir a fadiga visual dos desenvolvedores durante sessões prolongadas de depuração.

### Tokens de Cores (Variáveis CSS em Tailwind)

```css
@layer base {
  :root {
    /* Superfície Base - Slate Dark */
    --background: 222.2 84% 4.9%;       /* #0F172A */
    --foreground: 210 40% 98%;

    /* Containers e Cards */
    --card: 222.2 84% 6.9%;             /* #111827 */
    --card-foreground: 210 40% 98%;

    /* Cor Primária - Electric Indigo */
    --primary: 239 84% 67%;             /* #6366F1 */
    --primary-foreground: 210 40% 98%;

    /* Destaques de Status */
    --sos-danger: 354 100% 63%;         /* #FF4757 - Alertas de Saldo Zerado e SOS */
    --console-success: 160 84% 39%;     /* #10B981 - Conectado / Terminal OK */
    --warning-gold: 38 92% 50%;         /* #F59E0B - Aviso de Pouco Saldo */
  }
}
```

---

## 9. Práticas de Performance, Segurança e Resiliência

* **Proteção de Rotas via Middleware Next.js:** Interceptação de rotas autenticadas (`/dashboard`, `/room`, `/mentor`) verificando Cookies HTTP-Only contendo o JWT de sessão.
* **Cleanup Estrito de Recursos (Memory Leak Prevention):** No desmonte (`unmount`) da sala `/room/[id]`, todas as tracks de áudio e vídeo do LiveKit são paradas e os providers WebSocket do Yjs são desconectados explicitamente.
* **Code Splitting Dinâmico:** O editor Monaco (`@monaco-editor/react`) é importado assincronamente via `next/dynamic` com SSR desabilitado (`ssr: false`), evitando impactar o tamanho do bundle das páginas iniciais.
* **Resiliência a Desconexões:** O cliente WebSocket implementa reconexão automática com *Exponential Backoff*. Caso o cliente perca internet por instantes durante a sala, a mídia e a sala tentam se reestabelecer sem perda de progresso.
