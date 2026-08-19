import { useAuthStore } from "@/stores/use-auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(
      `Não foi possível conectar ao backend (${API_BASE}). Verifique sua conexão ou se o servidor está ativo.`
    );
  }

  const json: APIResponse<T> = await response.json().catch(() => ({
    success: false,
    error: "Resposta do servidor com formato inválido",
  }));

  if (!response.ok || !json.success) {
    let errMsg = json.error || json.message || "Erro na requisição";
    if (response.status === 401 && path.includes("/login")) {
      errMsg = "E-mail ou senha incorretos. Verifique suas credenciais.";
    } else if (response.status === 401) {
      errMsg = "Sessão expirada. Por favor, faça login novamente.";
    }
    throw new Error(errMsg);
  }

  return json.data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      name: string;
      email: string;
      password: string;
      role: "client" | "mentor";
      bio?: string;
      minute_rate_cents?: number;
      skills?: string[];
      github?: string;
      linkedin?: string;
    }) =>
      apiFetch<{ token: string; user: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => apiFetch<any>("/api/auth/me"),
  },

  requests: {
    create: (data: {
      title: string;
      description: string;
      stack: string[];
      max_minute_rate_cents: number;
    }) =>
      apiFetch<any>("/api/requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    listOpen: (stack?: string) =>
      apiFetch<any[]>(`/api/requests/open${stack ? `?stack=${encodeURIComponent(stack)}` : ""}`),
    listMy: () => apiFetch<any[]>("/api/requests/my"),
    accept: (id: string) =>
      apiFetch<{
        session: any;
        mentor_token: string;
        client_token: string;
        livekit_room: string;
      }>(`/api/requests/${id}/accept`, {
        method: "POST",
      }),
  },

  sessions: {
    get: (id: string) => apiFetch<any>(`/api/sessions/${id}`),
    end: (id: string) =>
      apiFetch<any>(`/api/sessions/${id}/end`, {
        method: "POST",
      }),
    saveCode: (id: string, code: string) =>
      apiFetch<any>(`/api/sessions/${id}/code`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },

  wallet: {
    getBalance: () => apiFetch<{ balance_cents: number }>("/api/wallet/balance"),
    deposit: (amountCents: number, gateway = "PIX") =>
      apiFetch<any>("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount_cents: amountCents, gateway }),
      }),
    listTransactions: () => apiFetch<any[]>("/api/wallet/transactions"),
  },
};
