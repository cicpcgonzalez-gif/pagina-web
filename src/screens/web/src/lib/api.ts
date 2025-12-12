import { mockRaffles, mockStatus } from "./mock";
import type { Raffle, SystemStatus } from "./types";
import { getAuthToken } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE no configurado");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Error ${response.status}`);
  }

  return response.json();
}

export async function fetchRaffles(): Promise<Raffle[]> {
  try {
    const raw = await safeFetch<any[]>("/raffles");
    return raw.map((item, index) => {
      const total = item.totalTickets ?? item.ticketsTotal ?? 0;
      const sold = item.soldTickets ?? item._count?.tickets ?? 0;
      return {
        id: String(item.id ?? `raffle-${index}`),
        title: item.name ?? item.title ?? "Rifa",
        price: Number(item.ticketPrice ?? item.price ?? 0),
        ticketsAvailable: Math.max(0, total - sold),
        ticketsTotal: total || 1,
        drawDate: item.endDate ?? item.drawDate ?? "Por definir",
        status: (item.status ?? "activa").toLowerCase() === "activa"
          ? "activa"
          : "cerrada",
      } satisfies Raffle;
    });
  } catch {
    return mockRaffles;
  }
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<{ token: string; accessToken?: string; user: { role?: string } }> {
  return safeFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: {
  name?: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ token?: string; accessToken?: string; user?: { role?: string } }> {
  return safeFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSystemStatus(): Promise<SystemStatus[]> {
  try {
    // No existe /status; usamos /health y mockeamos formato
    const health = await safeFetch<{ status: string; db: string }>("/health");
    return [
      {
        service: "API",
        state: health.status === "ok" ? "operativo" : "caido",
        detail: `API ${health.status}, DB ${health.db}`,
      },
    ];
  } catch {
    return mockStatus;
  }
}

export async function purchaseTickets(raffleId: number, quantity: number) {
  return safeFetch(`/raffles/${raffleId}/purchase`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

export async function initiatePayment(payload: {
  raffleId: number;
  quantity: number;
  provider?: string;
}): Promise<{ paymentUrl?: string; status?: string }> {
  return safeFetch(`/payments/initiate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile() {
  return safeFetch("/me");
}

export async function fetchMyTickets() {
  return safeFetch("/me/tickets");
}

export async function requestPasswordReset(payload: { email: string }) {
  return safeFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return safeFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
