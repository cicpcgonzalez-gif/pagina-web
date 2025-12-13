import { mockStatus } from "./mock";
import type { AdminUser, ModuleConfig, Raffle, SystemStatus, UserProfile, UserTicket } from "./types";
import { getAuthToken, getRefreshToken, setAuthToken, setRefreshToken } from "./session";

// Usar siempre la URL del backend si está configurada; si falta, usar la API pública en Render.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backednnuevo.onrender.com";

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
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
};

const mapRemoteRaffles = (raw: RemoteRaffle[]) => {
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
};

export async function fetchRaffles(): Promise<Raffle[]> {
  try {
    const raw = await safeFetch<RemoteRaffle[]>("/raffles");
    return mapRemoteRaffles(raw);
  } catch (err) {
    console.error("raffles error", err);
    return [];
  }
}

export async function fetchRafflesLive(): Promise<Raffle[]> {
  const raw = await safeFetch<RemoteRaffle[]>("/raffles");
  return mapRemoteRaffles(raw);
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
    status: (data.status ?? "activa").toLowerCase() === "activa" ? "activa" : "cerrada",
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
  captchaToken?: string;
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
  captchaToken?: string;
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

const defaultModules: ModuleConfig = {
  user: {
    registration: true,
    manualPayments: true,
    wallet: true,
    raffles: true,
    referrals: true,
    winners: true,
  },
  admin: {
    payments: true,
    manualPayments: true,
    winners: true,
    raffles: true,
    tickets: true,
    users: true,
    wallet: true,
    reports: true,
    sync: true,
  },
  superadmin: {
    audit: true,
    branding: true,
    modules: true,
    company: true,
    security: true,
    payments: true,
    fraud: true,
    smtp: true,
    techSupport: true,
    wallet: true,
    users: true,
    raffles: true,
    tickets: true,
    mailLogs: true,
    criticalActions: true,
  },
};

export async function fetchModules(): Promise<ModuleConfig> {
  // Intentar endpoint principal
  try {
    return await safeFetch<ModuleConfig>("/modules");
  } catch (err) {
    // Si devuelve HTML/404, probamos settings de superadmin
  }

  try {
    const settings = await safeFetch<{ modules?: ModuleConfig }>("/superadmin/settings");
    if (settings?.modules) return settings.modules;
  } catch {
    // ignore y devolvemos defaults
  }

  return defaultModules;
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
  const result = await safeFetch<Record<string, unknown>>(`/raffles/${raffleId}/purchase`, {
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
}): Promise<{ paymentUrl?: string; status?: string; clientRequestId?: string }> {
  const now = Date.now();
  if (lastPaymentAt && now - lastPaymentAt < 1000) {
    throw new Error("Demasiadas solicitudes de pago seguidas. Intenta de nuevo.");
  }
  lastPaymentAt = now;
  const clientRequestId = uuid();
  const result = await safeFetch<{ paymentUrl?: string; status?: string }>(`/payments/initiate`, {
    method: "POST",
    body: JSON.stringify({ ...payload, clientRequestId }),
  });
  return { ...result, clientRequestId };
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

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return safeFetch<AdminUser[]>("/admin/users");
}

export async function updateAdminUser(userId: string | number, payload: Partial<AdminUser> & { role?: string; status?: string; locked?: boolean }) {
  return safeFetch<AdminUser>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminAudit() {
  const candidates = ["/superadmin/audit", "/admin/audit", "/admin/logs/audit"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo cargar auditoría");
}

export async function fetchAdminReports() {
  const candidates = ["/admin/reports", "/admin/dashboard", "/admin/metrics"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Record<string, unknown>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo cargar reportes");
}

export async function fetchFraudAlerts() {
  const candidates = ["/admin/fraud", "/admin/security/alerts", "/superadmin/fraud"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudieron cargar alertas de fraude");
}

export async function validateTicket(code: string) {
  const payload = { code };
  const candidates = ["/admin/tickets/validate", "/tickets/validate", "/admin/tickets/check"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<{ status?: string; message?: string; valid?: boolean; raffle?: unknown; ticket?: unknown }>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo validar el ticket");
}

export async function fetchRecentValidations() {
  const candidates = ["/admin/tickets/recent", "/admin/tickets/history", "/tickets/recent"];
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch {
      // try next
    }
  }
  return [];
}

export async function toggleNotificationTemplate(templateId: string, active: boolean) {
  const candidates = ["/admin/notifications/templates", "/superadmin/mail/templates"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch(`${path}/${templateId}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo actualizar la plantilla");
}

export async function sendNotificationTest(templateId: string) {
  const candidates = ["/admin/notifications/test", "/superadmin/mail/test"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch(path, {
        method: "POST",
        body: JSON.stringify({ templateId }),
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo enviar el test");
}

export async function fetchNotificationTemplates() {
  const candidates = ["/admin/notifications/templates", "/superadmin/mail/templates"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudieron cargar plantillas");
}

export async function requestExport(type: string) {
  const candidates = [
    { path: "/admin/reports/export", method: "POST" },
    { path: `/admin/export?type=${encodeURIComponent(type)}`, method: "GET" },
  ];
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      return await safeFetch<Record<string, unknown>>(
        candidate.path,
        candidate.method === "POST"
          ? { method: "POST", body: JSON.stringify({ type }) }
          : { method: candidate.method },
      );
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo generar el export");
}

export async function fetchSuperadminSettings() {
  return safeFetch<Record<string, unknown>>("/superadmin/settings");
}

export async function updateSuperadminBranding(branding: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/settings/branding", {
    method: "PATCH",
    body: JSON.stringify(branding),
  });
}

export async function updateSuperadminModules(modules: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/settings/modules", {
    method: "PATCH",
    body: JSON.stringify({ modules }),
  });
}

export async function updateSuperadminCompany(company: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/settings/company", {
    method: "PATCH",
    body: JSON.stringify(company),
  });
}

export async function updateSuperadminSMTP(payload: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/settings/smtp", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateSuperadminTechSupport(payload: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/settings/tech-support", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchSuperadminMailLogs() {
  const candidates = ["/superadmin/mail/logs", "/admin/mail/logs"];
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudieron cargar logs de correo");
}

export async function fetchSuperadminAudit(kind: "users" | "actions" = "users") {
  const endpoints: Record<string, string[]> = {
    users: ["/superadmin/audit/users", "/admin/audit/users", "/superadmin/audit"],
    actions: ["/superadmin/audit/actions", "/admin/audit/actions", "/superadmin/audit"],
  };
  const candidates = endpoints[kind] || endpoints.users;
  let lastError: unknown;
  for (const path of candidates) {
    try {
      return await safeFetch<Array<Record<string, unknown>>>(path);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No se pudo cargar auditoría");
}

export async function superadminCreateUser(payload: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>("/superadmin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function superadminUpdateUserStatus(userId: string | number, patch: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>(`/superadmin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function superadminResetTwoFactor(userId: string | number) {
  return safeFetch<Record<string, unknown>>(`/superadmin/users/${userId}/reset-2fa`, {
    method: "POST",
  });
}

export async function superadminRevokeSessions(userId: string | number) {
  return safeFetch<Record<string, unknown>>(`/superadmin/users/${userId}/revoke-sessions`, {
    method: "POST",
  });
}

export async function fetchWinners() {
  return safeFetch<Array<Record<string, unknown>>>("/winners");
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
  totalTickets?: number;
  flyer?: File | null;
  images?: File[] | FileList | null;
}) {
  const hasFiles = !!payload.flyer || (!!payload.images && (payload.images as FileList | File[]).length > 0);

  if (hasFiles) {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    if (payload.price !== undefined) form.append("price", String(payload.price));
    if (payload.status) form.append("status", payload.status);
    if (payload.drawDate) form.append("drawDate", payload.drawDate);
    if (payload.totalTickets !== undefined) form.append("totalTickets", String(payload.totalTickets));
    if (payload.flyer) form.append("flyer", payload.flyer);
    if (payload.images) {
      const imgs = Array.from(payload.images as FileList | File[]);
      imgs.forEach((file) => form.append("images", file));
    }
    return safeFetch("/raffles", {
      method: "POST",
      body: form,
    });
  }

  return safeFetch("/raffles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestPasswordReset(payload: { email: string; captchaToken?: string }) {
  return safeFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; password: string; captchaToken?: string }) {
  return safeFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
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
    return await safeFetch<Array<Record<string, unknown>>>("/admin/payments");
  } catch {
    return [];
  }
}

export async function syncPayments() {
  return safeFetch<{ synced?: number; message?: string }>("/admin/payments/sync", {
    method: "POST",
  });
}

export async function reconcilePayment(paymentId: string | number) {
  return safeFetch<{ status?: string; message?: string }>(`/admin/payments/${paymentId}/reconcile`, {
    method: "POST",
  });
}

export async function fetchAdminWinners() {
  try {
    return await safeFetch<Array<Record<string, unknown>>>("/admin/winners");
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
