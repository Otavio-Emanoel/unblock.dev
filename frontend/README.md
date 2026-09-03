# 💻 Unblock.dev — Frontend Client Application

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=flat&logo=framer)](https://www.framer.com/motion/)
[![LiveKit](https://img.shields.io/badge/LiveKit_Client-2.22-FF4F00?style=flat&logo=webrtc)](https://livekit.io/)

The **Unblock.dev Frontend** is a modern, high-performance web application built with **Next.js 16 (App Router)** and **React 19**. It provides the complete user interface for on-demand developer mentorship, real-time pair programming, multi-file code editing, WebRTC video/audio streaming, and pay-per-minute billing visualization.

---

## ✨ Key Capabilities & User Flows

### 1. 🌟 Award-Winning Dark Glass Landing Page
- **Hero & Live Radar:** Interactive tech pills, animated headline with gradient text, floating live resolution ticker, and real-time mentor queue statistics.
- **Interactive Workspace Simulator (`RoomPreviewMockup`):** Live simulated Monaco editor, test runner terminal (`$ go test -v -race`), WebRTC audio visualizer with toggleable media controls, and interactive chat feed.
- **Real-World Bug Showcase (`BugShowcase`):** Interactive side-by-side code diffs comparing broken code with live mentor solutions, displaying estimated sprint hours saved.
- **Asymmetrical Bento Grid (`FeaturesGrid`):** Highlighting Redis distributed locks (`SETNX`), LiveKit SFU media, Go TickerEngine, and Yjs CRDTs.
- **Cost & ROI Calculator (`CostCalculator`):** Dynamic duration slider with instant price calculations, traditional contractor comparisons, and `canvas-confetti` celebrations.
- **Credit Packages & Pricing (`PricingPlans`):** Highlighted Pro package, trust guarantees, and instant wallet deposit triggers.
- **Testimonials & FAQ (`Testimonials`, `FaqSection`):** Wall of Love with developer reviews and smooth Framer Motion accordion answering core platform questions.

### 2. ⚡ Live Pair Programming Room (`/room/[id]`)
- **WebRTC HD Media (LiveKit SFU):** High-definition video, audio, and screen sharing with **privacy-first defaults** (camera and microphone start muted with custom activation banners).
- **Multi-File Workspace:** Tab management (`main.go`, `dispatcher.go`, `README.md`), new file creation, and instant active file switching.
- **Collaborative Monaco Editor (CRDT):** Conflict-free synchronization powered by Yjs, live remote cursors, intelligent cloud auto-save (1s debounce), and full hotkeys (`Ctrl+S`, `Ctrl+Z` Undo, `Ctrl+Y` Redo).
- **Sub-Second Billing Ticker:** Displays live elapsed time and accumulated session cost calculated per minute.
- **End Session & ACID Settlement:** Custom modal summary displaying exact minutes used, platform fee breakdown, and a post-session 5-star rating modal.

### 3. 🛡️ Dashboards & Role-Based Workflows
- **Developer Dashboard (`/dashboard`):** Real-time balance summary, SOS ticket management, mentor availability status, and direct room join actions.
- **SOS Request Dispatcher (`/request`):** Open emergency SOS tickets specifying technology stack (Go, React, K8s, Docker, SQL) and maximum BRL/minute rate.
- **Mentor Queue & Live Radar (`/mentor/dashboard`):** Real-time queue of open SOS tickets with instant acceptance protected by distributed concurrency locks.
- **Digital Wallet (`/wallet`):** Instant PIX / Credit Card deposits (Starter R$ 30, Pro R$ 60, Senior R$ 150) and immutable transaction history.

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── app/                          # Next.js App Router (Pages, Layouts & Middleware)
│   │   ├── dashboard/page.tsx        # Developer dashboard (active tickets & stats)
│   │   ├── login/page.tsx            # Secure authentication (JWT credentials & OAuth)
│   │   ├── mentor/
│   │   │   └── dashboard/page.tsx    # Real-time mentor SOS queue & online switch
│   │   ├── register/page.tsx         # User registration (Developer vs Mentor roles)
│   │   ├── request/page.tsx          # SOS request creation & matching radar
│   │   ├── room/[id]/page.tsx        # Main live collaborative pairing workspace
│   │   ├── wallet/page.tsx           # Digital wallet balance & PIX deposit modal
│   │   ├── globals.css               # Design tokens, glassmorphism utilities & keyframes
│   │   ├── layout.tsx                # Root layout (Inter + JetBrains Mono font stacks)
│   │   ├── middleware.ts             # Route authentication & JWT cookie protection
│   │   └── page.tsx                  # Landing page component assembly
│   │
│   ├── components/                   # UI & Domain Components
│   │   ├── landing/                  # Landing page modular sections
│   │   │   ├── BugShowcase.tsx       # Before/After bug diffs & resolution telemetry
│   │   │   ├── CostCalculator.tsx    # Interactive ROI & minute price calculator
│   │   │   ├── CtaSection.tsx        # High-energy call-to-action banner
│   │   │   ├── FaqSection.tsx        # Framer Motion animated FAQ accordion
│   │   │   ├── FeaturesGrid.tsx      # Asymmetrical Bento Grid with system metrics
│   │   │   ├── Hero.tsx              # Hero header with stack badges & live ticker
│   │   │   ├── HowItWorks.tsx        # 4-step visual pairing roadmap
│   │   │   ├── ParticleBackground.tsx # Interactive constellation canvas background
│   │   │   ├── PricingPlans.tsx      # Credit recharge packages & trust guarantees
│   │   │   ├── RoomPreviewMockup.tsx # Interactive workspace & terminal simulator
│   │   │   └── Testimonials.tsx      # Wall of Love developer reviews & ratings
│   │   └── shared/                   # Shared UI primitives
│   │       ├── AuthGuard.tsx         # Client session validator & route protector
│   │       ├── CustomModal.tsx       # Accessible glassmorphism dialog modal
│   │       ├── DashboardHeader.tsx   # Authenticated top navbar with wallet pill
│   │       ├── Footer.tsx            # System operational status & tech badges
│   │       └── Header.tsx            # Floating glass navbar with mobile drawer
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   └── use-websocket.ts          # Resilient WebSocket connection & auto-reconnect
│   │
│   ├── lib/                          # Client API & SDK Wrappers
│   │   └── api.ts                    # Type-safe Fetch API client with JWT interceptors
│   │
│   ├── stores/                       # Global State Management (Zustand)
│   │   └── use-auth-store.ts         # User credentials, JWT session & profile data
│   │
│   └── types/                        # TypeScript Domain Definitions
│       ├── api.ts                    # Standard API envelope responses
│       ├── room.ts                   # Session, file workspace & SOS request interfaces
│       └── user.ts                   # User profile, mentor skills & wallet models
│
├── public/                           # Static assets, fonts & favicon
├── next.config.ts                    # Next.js configuration (Turbopack, image domains)
├── tsconfig.json                     # Strict TypeScript compiler options
└── package.json                      # Project dependencies & npm scripts
```

---

## 🛠️ Technology Stack Breakdown

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) & React 19 | Server & Client Components, fast routing, optimized asset streaming |
| **Language** | TypeScript 5 (Strict Mode) | Type-safe API contracts, DTOs, and event payloads |
| **Styling** | Tailwind CSS v4 & PostCSS | Micro-utilities, glassmorphism tokens, and responsive layout grids |
| **Animation & FX** | Framer Motion & Canvas Confetti | Smooth spring physics, layout transitions, and celebratory rewards |
| **Media (WebRTC)** | `livekit-client` | Ultra-low latency SFU audio/video streams and screen sharing |
| **State** | Zustand | Lightweight client-side session, auth token, and wallet state |
| **Icons** | Lucide React | Clean, scalable modern developer icons |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20+ or v22+
- **npm**, **pnpm**, or **yarn**
- Running instance of the Go Backend (default: `http://localhost:8081`)

### 2. Environment Configuration
Create a `.env.local` file in the `frontend/` directory:

```env
# URL of the Go Chi REST API
NEXT_PUBLIC_API_URL=http://localhost:8081

# LiveKit WebRTC SFU Server
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880

# Yjs Collaborative CRDT Server
NEXT_PUBLIC_YJS_WS_URL=ws://localhost:1234
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev -- -p 3001
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 5. Production Build
```bash
npm run build
npm run start -- -p 3001
```

---

## 🧪 Code Quality & Verification

- **Type Check:**
  ```bash
  npx tsc --noEmit
  ```
- **Linting:**
  ```bash
  npm run lint
  ```

---

## 🛡️ Security & Privacy Architecture

- **Stateless JWT Interception:** Tokens are stored securely and injected via `Authorization: Bearer <token>` in all authenticated API requests.
- **Route Middleware Protection:** `middleware.ts` guards `/dashboard`, `/request`, `/room/*`, and `/wallet` from unauthorized visits.
- **Custom Accessible Modals:** 100% elimination of blocking browser `alert()` or `confirm()` dialogs in favor of accessible, keyboard-trapped `CustomModal` dialogs.
- **Privacy Defaults:** Camera and microphone always start disabled/muted upon joining rooms, requiring deliberate user activation.
