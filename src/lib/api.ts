import { mockRaffles, mockStatus } from "./mock";
import type { ModuleConfig, Raffle, SystemStatus, UserProfile, UserTicket, Winner } from "./types";
import { getAuthToken, getRefreshToken, setAuthToken, setRefreshToken } from "./session";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

const uuid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clientHeaders = () => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "server";
  return {
    "X-Client-Platform": "web",
    "X-Request-Id": uuid(),
    "X-Client-Time": new Date().toISOString(),
    "X-User-Agent": ua,
  };
};

async function doFetch<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; raw: string; parsed?: T }>
{
  if (!API_BASE) {
    throw new Error("API_BASE no configurado");
  }

  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...clientHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const raw = await response.text();
  let parsed: T | undefined;
  try {
    parsed = raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    parsed = raw as unknown as T;
  }

  return { ok: response.ok, status: response.status, raw, parsed };
}

async function safeFetch<T>(path: string, init?: RequestInit, options?: { skipRefresh?: boolean }): Promise<T> {
  if (!API_BASE) {
    throw new Error("API_BASE no configurado");
  }

  const first = await doFetch<T>(path, init);
  if (first.ok) return (first.parsed as T) ?? ({} as T);

  // Intentar refresh sólo una vez y sólo si 401/403
  if (!options?.skipRefresh && (first.status === 401 || first.status === 403)) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const retry = await doFetch<T>(path, init);
      if (retry.ok) return (retry.parsed as T) ?? ({} as T);
      throw new Error(retry.raw || `Error ${retry.status}`);
    }
  }

  throw new Error(first.raw || `Error ${first.status}`);
}

type RemoteRaffle = {
  id?: string | number;
  name?: string;
  title?: string;
  ticketPrice?: number;
  price?: number;
  totalTickets?: number;
  ticketsTotal?: number;
  soldTickets?: number;
  _count?: { tickets?: number };
  endDate?: string;
  drawDate?: string;
  status?: string;
  description?: string;
  stats?: { total?: number; sold?: number; remaining?: number };
  style?: { bannerImage?: string; gallery?: string[]; themeColor?: string };
};

const normalizeRaffleStatus = (raw?: string): Raffle["status"] => {
  const s = String(raw || "").trim().toLowerCase();
  if (s === "active" || s === "activa") return "activa";
  if (s === "paused" || s === "pausada") return "pausada";
  return "cerrada";
};

export async function fetchRaffles(): Promise<Raffle[]> {
  try {
    const raw = await safeFetch<RemoteRaffle[]>("/raffles");
    return raw.map((item, index) => {
      const total = item.totalTickets ?? item.ticketsTotal ?? 0;
      const sold = item.soldTickets ?? item._count?.tickets ?? 0;
      const remaining = item.stats?.remaining ?? (total ? Math.max(total - sold, 0) : 0);
      return {
        id: String(item.id ?? `raffle-${index}`),
        title: item.name ?? item.title ?? "Rifa",
        price: Number(item.ticketPrice ?? item.price ?? 0),
        ticketsAvailable: Number.isFinite(remaining) ? Math.max(0, remaining) : Math.max(0, total - sold),
        ticketsTotal: total || 1,
        drawDate: item.endDate ?? item.drawDate ?? "Por definir",
        status: normalizeRaffleStatus(item.status),
        description: item.description,
        stats: item.stats,
        style: item.style,
      } satisfies Raffle;
    });
  } catch {
    return mockRaffles;
  }
}

export async function fetchRaffle(id: string | number) {
  const data = await safeFetch<RemoteRaffle & { description?: string; stats?: { total?: number; sold?: number; remaining?: number }; style?: { bannerImage?: string; gallery?: string[]; themeColor?: string } }>(`/raffles/${id}`);

  const total = data.totalTickets ?? data.ticketsTotal ?? data.stats?.total ?? 0;
  const sold = data.soldTickets ?? data._count?.tickets ?? data.stats?.sold ?? 0;
  const remaining = data.stats?.remaining ?? (total ? Math.max(total - sold, 0) : 0);

  return {
    id: String(data.id ?? id),
    title: data.name ?? data.title ?? "Rifa",
    price: Number(data.ticketPrice ?? data.price ?? 0),
    ticketsAvailable: remaining,
    ticketsTotal: total || 1,
    drawDate: data.endDate ?? data.drawDate ?? "Por definir",
    status: normalizeRaffleStatus(data.status),
    description: data.description,
    stats: data.stats,
    style: data.style,
  } satisfies Raffle & {
    description?: string;
    stats?: { total?: number; sold?: number; remaining?: number };
    style?: { bannerImage?: string; gallery?: string[]; themeColor?: string };
  };
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<{ token: string; accessToken?: string; refreshToken?: string; user: { role?: string } }> {
  const data = await safeFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const token = (data as any)?.token || (data as any)?.accessToken;
  const refresh = (data as any)?.refreshToken;
  if (token) setAuthToken(token);
  if (refresh) setRefreshToken(refresh);
  return data as any;
}

export async function register(payload: {
  name?: string;
  email: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  state?: string;
  address?: string;
  dob?: string;
  cedula?: string;
}): Promise<{ token?: string; accessToken?: string; refreshToken?: string; user?: { role?: string }; require2FA?: boolean }> {
  const data = await safeFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const token = (data as any)?.token || (data as any)?.accessToken;
  const refresh = (data as any)?.refreshToken;
  if (token) setAuthToken(token);
  if (refresh) setRefreshToken(refresh);
  return data as any;
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

export async function fetchModules(): Promise<ModuleConfig> {
  return safeFetch<ModuleConfig>("/modules");
}

export async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const data = await safeFetch<{ token?: string; accessToken?: string; refreshToken?: string }>(
    "/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
    { skipRefresh: true },
  );
  const token = data?.token || data?.accessToken;
  if (token) setAuthToken(token);
  if (data?.refreshToken) setRefreshToken(data.refreshToken);
  return token;
}

let lastPurchaseAt: number | null = null;
export async function purchaseTickets(raffleId: number, quantity: number) {
  const now = Date.now();
  if (lastPurchaseAt && now - lastPurchaseAt < 1000) {
    throw new Error("Demasiadas solicitudes rápidas. Intenta en un segundo.");
  }
  lastPurchaseAt = now;
  const clientRequestId = uuid();
  const result = await safeFetch(`/raffles/${raffleId}/purchase`, {
    method: "POST",
    body: JSON.stringify({ quantity, clientRequestId }),
  });
  return typeof result === "object" && result !== null ? { ...result, clientRequestId } : result;
}

let lastPaymentAt: number | null = null;
export async function initiatePayment(payload: {
  raffleId: number;
  quantity: number;
  provider?: string;
}): Promise<{ paymentUrl?: string; status?: string }> {
  const now = Date.now();
  if (lastPaymentAt && now - lastPaymentAt < 1000) {
    throw new Error("Demasiadas solicitudes de pago seguidas. Intenta de nuevo.");
  }
  lastPaymentAt = now;
  const clientRequestId = uuid();
  const result = await safeFetch(`/payments/initiate`, {
    method: "POST",
    body: JSON.stringify({ ...payload, clientRequestId }),
  });
  return typeof result === "object" && result !== null ? { ...result, clientRequestId } : result;
}

async function tryRefreshToken() {
  try {
    const token = await refreshSession();
    return !!token;
  } catch {
    return false;
  }
}

export async function submitManualPayment(
  raffleId: number,
  payload: { quantity: number; reference?: string; note?: string; proof?: string },
) {
  return safeFetch(`/raffles/${raffleId}/manual-payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProfile(): Promise<UserProfile> {
  return safeFetch<UserProfile>("/me");
}

export async function fetchMyTickets(): Promise<UserTicket[]> {
  return safeFetch<UserTicket[]>("/me/tickets");
}

export async function fetchMyRaffles() {
  return safeFetch<Array<Record<string, unknown>>>("/me/raffles");
}

export async function fetchWallet() {
  return safeFetch<{ balance?: number; transactions?: Array<Record<string, unknown>> }>("/wallet");
}

export async function fetchMyPayments() {
  // Algunos entornos exponen pagos como /payments, otros /me/payments.
  const candidates = ["/payments/my", "/me/payments", "/payments"];

  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch {
      // probamos la siguiente ruta
    }
  }

  return [];
}

export async function fetchWinners(): Promise<Winner[]> {
  try {
    const raw = await safeFetch<
      Array<{
        id?: string | number;
        user?: { name?: string; avatar?: string };
        prize?: string;
        raffle?: { title?: string };
        photoUrl?: string;
        testimonial?: string;
        drawDate?: string;
      }>
    >("/winners");

    return raw.map((w, i) => ({
      id: w.id ?? `winner-${i}`,
      user: w.user,
      prize: w.prize ?? "Premio",
      raffle: w.raffle,
      photoUrl: w.photoUrl,
      testimonial: w.testimonial,
      drawDate: w.drawDate,
    } satisfies Winner));
  } catch {
    return [];
  }
}

export async function updateProfile(payload: Partial<UserProfile> & { avatar?: string }) {
  return safeFetch<{ user: UserProfile }>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  return safeFetch("/me/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount() {
  return safeFetch("/me", {
    method: "DELETE",
  });
}

export async function adminCreateRaffle(payload: {
  title: string;
  description?: string;
  price?: number;
  status?: string;
  drawDate?: string;
}) {
  return safeFetch("/raffles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(payload: { email: string }) {
  return safeFetch("/auth/password/reset/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; password: string } | { token: string; newPassword: string }) {
  const token = (payload as any)?.token;
  const newPassword = (payload as any)?.newPassword ?? (payload as any)?.password;
  return safeFetch("/auth/password/reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function requestPasswordRecovery(payload: { email: string }) {
  return safeFetch("/auth/password/reset/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmailCode(payload: { email: string; code: string }) {
  return safeFetch("/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(payload: { email: string }) {
  return safeFetch("/auth/verify/resend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyTwoFactor(payload: { email: string; code: string }) {
  return safeFetch("/auth/2fa", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminPayments() {
  try {
    return await safeFetch<Array<Record<string, unknown>>>('/admin/manual-payments');
  } catch {
    return [];
  }
}

export async function syncPayments() {
  const list = await safeFetch<Array<Record<string, unknown>>>('/admin/manual-payments');
  return { synced: Array.isArray(list) ? list.length : 0, message: 'Pagos actualizados.' };
}

export async function reconcilePayment(paymentId: string | number) {
  return safeFetch<{ status?: string; message?: string }>(`/admin/manual-payments/${paymentId}/approve`, {
    method: "POST",
  });
}

export async function rejectManualPayment(paymentId: string | number) {
  return safeFetch<{ status?: string; message?: string }>(`/admin/manual-payments/${paymentId}/reject`, {
    method: "POST",
  });
}

export async function fetchAdminWinners() {
  try {
    return await safeFetch<Array<Record<string, unknown>>>('/winners');
  } catch {
    return [];
  }
}

export async function publishWinner(payload: {
  raffleId?: string | number;
  raffleTitle?: string;
  winnerName?: string;
  prize?: string;
  testimonial?: string;
  photoUrl?: string;
  drawDate?: string;
  ticketNumber?: string;
}) {
  return safeFetch("/admin/winners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSuperadminSettings() {
  return safeFetch<{ branding?: Record<string, unknown>; modules?: Record<string, unknown>; company?: Record<string, unknown> }>(
    "/superadmin/settings",
  );
}

export async function updateSuperadminModules(modules: Record<string, unknown>) {
  return safeFetch("/superadmin/settings/modules", {
    method: "PATCH",
    body: JSON.stringify({ modules }),
  });
}

export async function fetchAllUsers() {
  return safeFetch<Array<Record<string, unknown>>>("/users");
}

export async function superadminUpdateUserStatus(userId: string | number, status: string) {
  return safeFetch(`/superadmin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function superadminResetPasswordByEmail(email: string) {
  return safeFetch("/superadmin/users/reset-password-by-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
