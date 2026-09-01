"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CASE_STUDIES = [
  {
    id: "go-concurrency",
    title: "Deadlock em Goroutines & Canais",
    stack: "Go / Concorrência",
    icon: "🐹",
    category: "Backend & Systems",
    problem: "Worker pool travando indefinidamente quando tarefas excediam o buffer do canal sem select timeout.",
    timeSaved: "3h 40min de debug → Resolvido em 14 min",
    cost: "R$ 35,00",
    mentor: "Sarah C. (Staff Backend Engineer)",
    buggyCode: `// ❌ ANTES (Travava em produção)
func ProcessQueue(jobs chan Job) {
    for job := range jobs {
        // Sem timeout ou context cancelation
        result := worker(job) 
        outChan <- result // 💥 Bloqueia se outChan estiver cheio
    }
}`,
    fixedCode: `// ✅ DEPOIS (Fix aplicado na sessão ao vivo)
func ProcessQueue(ctx context.Context, jobs <-chan Job, out chan<- Result) {
    for {
        select {
        case <-ctx.Done():
            return // Encerramento gracioso
        case job, ok := <-jobs:
            if !ok { return }
            select {
            case out <- worker(job):
            case <-time.After(500 * time.Millisecond):
                log.Warn("Job timeout: worker pool desengargalado")
            }
        }
    }
}`,
  },
  {
    id: "nextjs-hydration",
    title: "Next.js 15 Server Action & Hydration Error",
    stack: "Next.js 15 / React 19",
    icon: "⚛️",
    category: "Frontend & Fullstack",
    problem: "Mismatch catastrófico de renderização e perda de token de autenticação em requisições concorrentes no App Router.",
    timeSaved: "5h de tentativas → Resolvido em 9 min",
    cost: "R$ 22,50",
    mentor: "Pedro V. (Frontend Architect)",
    buggyCode: `// ❌ ANTES (Hydration Mismatch & Session Loss)
export async function ServerComponent() {
    const user = await fetchUserDirectly(); // Falha no SSR
    return <div>{user.token ? <Private /> : <Public />}</div>;
}`,
    fixedCode: `// ✅ DEPOIS (Fix com cookies seguros e AuthGuard)
export async function ServerComponent() {
    const cookieStore = await cookies();
    const token = cookieStore.get("unblock_token")?.value;
    const user = token ? await verifyJwtServer(token) : null;
    
    return <SessionProvider initialUser={user}><PrivateContent /></SessionProvider>;
}`,
  },
  {
    id: "redis-lock",
    title: "Race Condition em Locks Distribuídos",
    stack: "Redis 7.2 / Distributed Systems",
    icon: "⚡",
    category: "Databases & Infra",
    problem: "Dois nós da API aceitavam o mesmo chamado simultaneamente devido a verificação GET + SET não atômica.",
    timeSaved: "1 dia inteiro de incidentes → Resolvido em 16 min",
    cost: "R$ 40,00",
    mentor: "Lucas R. (Distributed Systems Lead)",
    buggyCode: `// ❌ ANTES (Race condition clássica de concorrência)
exists := redis.Get(ctx, lockKey)
if exists == nil {
    // 💥 Janela de milissegundos para outro nó também entrar
    redis.Set(ctx, lockKey, "locked", ttl)
}`,
    fixedCode: `// ✅ DEPOIS (Lock atômico via SETNX com TTL obrigatório)
acquired, err := redis.SetNX(ctx, lockKey, mentorID, 30*time.Second).Result()
if err != nil || !acquired {
    return ErrTicketAlreadyAcquired // Bloqueio imediato 100% atômico
}`,
  },
  {
    id: "k8s-crashloop",
    title: "Kubernetes CrashLoopBackOff & OOMKilled",
    stack: "Kubernetes / Docker",
    icon: "☸️",
    category: "DevOps & Cloud",
    problem: "Pod reiniciava a cada 45 segundos por liveness probe muito agressiva e limite de memória mal dimensionado no Go.",
    timeSaved: "Sprint inteira atrasada → Resolvido em 21 min",
    cost: "R$ 52,50",
    mentor: "Gabriel M. (DevOps & K8s CKA)",
    buggyCode: `// ❌ ANTES (Liveness probe matando a aplicação na subida)
livenessProbe:
  httpGet:
    path: /health
  initialDelaySeconds: 2 # 💥 Aplicação ainda inicializava conexões
  periodSeconds: 3`,
    fixedCode: `// ✅ DEPOIS (Startup probe + dimensionamento de heap GOMEMLIMIT)
startupProbe:
  httpGet:
    path: /health
  failureThreshold: 30
  periodSeconds: 2
resources:
  limits:
    memory: "512Mi"
env:
  - name: GOMEMLIMIT
    value: "450MiB"`,
  },
];

export function BugShowcase() {
  const [selectedCase, setSelectedCase] = useState(CASE_STUDIES[0]);

  return (
    <section id="casos-reais" className="py-20 relative bg-[#090d16]/90">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Casos Reais de Resolução
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            De um bug bloqueador para código rodando em minutos
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Veja exemplos reais de problemas complexos que nossos mentores especialistas resolveram ao vivo com desenvolvedores na plataforma.
          </p>
        </div>

        {/* Case Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {CASE_STUDIES.map((c) => {
            const isSelected = selectedCase.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition duration-200 flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25 glow-primary scale-105"
                    : "bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Case Details Card */}
        <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCase.icon}</span>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  {selectedCase.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">{selectedCase.stack}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedCase.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {selectedCase.problem}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 shrink-0 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Tempo &amp; Custo</span>
                <span className="text-xs font-bold text-emerald-400 font-mono block">
                  {selectedCase.timeSaved}
                </span>
                <span className="text-xs font-mono text-white font-semibold">
                  Custo total: <strong className="text-emerald-400">{selectedCase.cost}</strong>
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-sans">Mentor: {selectedCase.mentor}</span>
            </div>
          </div>

          {/* Diff Grid: Buggy Code vs Fixed Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buggy Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Código Bloqueado (Antes)
                </span>
                <span className="text-[10px] text-red-400/80">3h de debug travado</span>
              </div>
              <pre className="p-4 rounded-2xl bg-black/50 border border-red-500/20 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto min-h-[160px]">
                <code>{selectedCase.buggyCode}</code>
              </pre>
            </div>

            {/* Fixed Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solução do Mentor (Ao Vivo)
                </span>
                <span className="text-[10px] text-emerald-400/80">100% Testado &amp; Validado</span>
              </div>
              <pre className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto min-h-[160px]">
                <code>{selectedCase.fixedCode}</code>
              </pre>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <span className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sessões com gravação e download instantâneo de snippets de código.
            </span>

            <Link
              href="/request"
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 glow-primary"
            >
              <Zap className="w-3.5 h-3.5 fill-white/20" />
              <span>Abrir Chamado SOS Nesta Stack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
