import { mockRaffles, mockStatus } from "./mock";
import type { AdminTicket, ModuleConfig, PaymentDetails, Raffle, SystemStatus, UserProfile, UserTicket, Winner } from "./types";
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
  digits?: number | string;
  ticketDigits?: number | string;
  minTickets?: number | string;
  status?: string;
  description?: string;
  stats?: { total?: number; sold?: number; remaining?: number };
  style?: { bannerImage?: string; gallery?: string[]; themeColor?: string };
  isSoldOut?: boolean;
  instantWins?: Array<number | string> | string;
  reactionCounts?: { LIKE?: number; HEART?: number };
  myReaction?: "LIKE" | "HEART" | null;
  user?: {
    id?: string | number;
    name?: string | null;
    fullName?: string | null;
    avatar?: string;
    securityId?: string | null;
    publicId?: string;
    identityVerified?: boolean;
    isBoosted?: boolean;
    boostEndsAt?: string;
  };
};

const normalizeRaffleStatus = (raw?: string): Raffle["status"] => {
  const s = String(raw || "").trim().toLowerCase();
  if (s === "active" || s === "activa") return "activa";
  if (s === "paused" || s === "pausada") return "pausada";
  return "cerrada";
};

const normalizeDigits = (raw: unknown): number | undefined => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  if (i <= 0 || i > 12) return undefined;
  return i;
};

const normalizeMinTickets = (raw: unknown): number | undefined => {
  if (raw === null || raw === undefined) return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  if (i <= 0) return undefined;
  return i;
};

const normalizeInstantWins = (raw: unknown): Array<number | string> | string | undefined => {
  if (Array.isArray(raw)) return raw as Array<number | string>;
  if (typeof raw === "string" && raw.trim()) return raw;
  return undefined;
};

export async function fetchRaffles(): Promise<Raffle[]> {
  try {
    const raw = await safeFetch<RemoteRaffle[]>("/raffles");
    return raw.map((item, index) => {
      const total = item.totalTickets ?? item.ticketsTotal ?? 0;
      const sold = item.soldTickets ?? item._count?.tickets ?? 0;
      const remaining = item.stats?.remaining ?? (total ? Math.max(total - sold, 0) : 0);
      const digits = normalizeDigits(item.digits ?? item.ticketDigits);
      const isSoldOut = Boolean(item.isSoldOut ?? (Number.isFinite(remaining) ? remaining <= 0 : total - sold <= 0));
      return {
        id: String(item.id ?? `raffle-${index}`),
        title: item.name ?? item.title ?? "Rifa",
        price: Number(item.ticketPrice ?? item.price ?? 0),
        ticketsAvailable: Number.isFinite(remaining) ? Math.max(0, remaining) : Math.max(0, total - sold),
        ticketsTotal: total || 1,
        drawDate: item.endDate ?? item.drawDate ?? "Por definir",
        endDate: item.endDate ?? item.drawDate,
        digits,
        minTickets: normalizeMinTickets(item.minTickets),
        status: normalizeRaffleStatus(item.status),
        description: item.description,
        isSoldOut,
        instantWins: normalizeInstantWins(item.instantWins),
        reactionCounts: item.reactionCounts,
        myReaction: item.myReaction,
        stats: item.stats,
        style: item.style,
        user: item.user
          ? {
              id: item.user.id,
              name: item.user.name ?? item.user.fullName ?? null,
              avatar: item.user.avatar,
              securityId: item.user.securityId ?? null,
              publicId: item.user.publicId,
              identityVerified: Boolean(item.user.identityVerified),
              isBoosted: Boolean(item.user.isBoosted),
              boostEndsAt: item.user.boostEndsAt,
            }
          : undefined,
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
  const digits = normalizeDigits(data.digits ?? data.ticketDigits);
  const isSoldOut = Boolean(data.isSoldOut ?? (Number.isFinite(remaining) ? remaining <= 0 : total - sold <= 0));

  return {
    id: String(data.id ?? id),
    title: data.name ?? data.title ?? "Rifa",
    price: Number(data.ticketPrice ?? data.price ?? 0),
    ticketsAvailable: remaining,
    ticketsTotal: total || 1,
    drawDate: data.endDate ?? data.drawDate ?? "Por definir",
    endDate: data.endDate ?? data.drawDate,
    digits,
    minTickets: normalizeMinTickets(data.minTickets),
    status: normalizeRaffleStatus(data.status),
    description: data.description,
    isSoldOut,
    instantWins: normalizeInstantWins(data.instantWins),
    reactionCounts: data.reactionCounts,
    myReaction: data.myReaction,
    stats: data.stats,
    style: data.style,
    user: data.user
      ? {
          id: data.user.id,
          name: data.user.name ?? data.user.fullName ?? null,
          avatar: data.user.avatar,
          securityId: data.user.securityId ?? null,
          publicId: data.user.publicId,
          identityVerified: Boolean(data.user.identityVerified),
          isBoosted: Boolean(data.user.isBoosted),
          boostEndsAt: data.user.boostEndsAt,
        }
      : undefined,
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
  return safeFetch<{ balance?: number; transactions?: Array<Record<string, unknown>> }>('/wallet');
}

export async function fetchMyReferrals() {
  return safeFetch<{ code?: string; referrals?: Array<{ name?: string; createdAt?: string; verified?: boolean }> }>(
    '/me/referrals',
  );
}

export async function fetchUserPublicRaffles(userId: string | number) {
  return safeFetch<{ active?: Array<Record<string, unknown>>; closed?: Array<Record<string, unknown>> }>(
    `/users/public/${userId}/raffles`,
  );
}

export async function fetchBoostMe() {
  return safeFetch<{ isBoosted?: boolean; activeBoosts?: Array<{ id?: string | number; startAt?: string; endAt?: string }>; nextEligibleAt?: string }>(
    '/boosts/me',
  );
}

export async function activateBoost() {
  return safeFetch<{ message?: string; boost?: Record<string, unknown> }>('/boosts/activate', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function submitKyc(payload: { documentType?: string; frontImage: string; backImage?: string | null; selfieImage: string }) {
  return safeFetch<{ message?: string; id?: string | number }>('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function topupWallet(amount: number) {
  return safeFetch<{ message?: string }>("/wallet/topup", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function fetchRafflePaymentDetails(raffleId: string | number) {
  return safeFetch<PaymentDetails>(`/raffles/${raffleId}/payment-details`);
}

export async function reactToRaffle(raffleId: string | number, type: "LIKE" | "HEART") {
  return safeFetch<{ message?: string; active?: boolean }>(`/raffles/${raffleId}/react`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

export async function fetchAdminTickets(params?: {
  q?: string;
  raffleId?: string | number;
  status?: string;
  from?: string;
  to?: string;
  email?: string;
  phone?: string;
  cedula?: string;
  number?: string | number;
  serial?: string;
  take?: number;
  offset?: number;
}): Promise<AdminTicket[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.raffleId != null && params.raffleId !== "") qs.set("raffleId", String(params.raffleId));
  if (params?.status) qs.set("status", params.status);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.email) qs.set("email", params.email);
  if (params?.phone) qs.set("phone", params.phone);
  if (params?.cedula) qs.set("cedula", params.cedula);
  if (params?.number != null && params.number !== "") qs.set("number", String(params.number));
  if (params?.serial) qs.set("serial", params.serial);
  if (params?.take) qs.set("take", String(params.take));
  if (params?.offset) qs.set("offset", String(params.offset));
  const q = qs.toString();
  const list = await safeFetch<AdminTicket[]>(`/admin/tickets${q ? `?${q}` : ""}`);
  return Array.isArray(list) ? list : [];
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

export async function fetchInstantWinsFeed(take = 80): Promise<Array<Record<string, unknown>>> {
  const t = Number.isFinite(take) ? Math.max(1, Math.min(200, Math.trunc(take))) : 80;
  try {
    const list = await safeFetch<Array<Record<string, unknown>>>(`/feed/instant-wins?take=${t}`);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function updateProfile(payload: Partial<UserProfile> & { avatar?: string; avatarUrl?: string }) {
  const normalizeSocials = (socials: UserProfile['socials'] | undefined) => {
    if (!socials) return undefined;
    const clean: Record<string, string> = {};
    const setIf = (key: string, value: unknown) => {
      const v = String(value ?? '').trim();
      if (v) clean[key] = v;
    };

    if ((socials as any).whatsapp != null) {
      const digits = String((socials as any).whatsapp).replace(/\D/g, '');
      if (digits) clean.whatsapp = digits;
    }
    if ((socials as any).instagram != null) setIf('instagram', String((socials as any).instagram).replace(/^@/, ''));
    if ((socials as any).tiktok != null) setIf('tiktok', String((socials as any).tiktok).replace(/^@/, ''));
    if ((socials as any).telegram != null) setIf('telegram', String((socials as any).telegram).replace(/^@/, ''));
    if (Array.isArray((socials as any).links)) (clean as any).links = (socials as any).links;
    return clean as any;
  };

  const body: Record<string, unknown> = {
    name: payload?.name,
    avatar: payload?.avatar ?? payload?.avatarUrl ?? (payload as any)?.avatarUrl,
    bio: payload?.bio,
    socials: normalizeSocials(payload?.socials),
  };

  // El backend puede soportar más campos en algunos entornos; enviamos si vienen definidos.
  if (payload?.phone != null) body.phone = payload.phone;
  if ((payload as any)?.address != null) body.address = (payload as any).address;
  if ((payload as any)?.cedula != null) body.cedula = (payload as any).cedula;

  return safeFetch<UserProfile>("/me", {
    method: "PATCH",
    body: JSON.stringify(body),
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
  // El backend usa `description` o `prize` como premio/descripcion requerida.
  description: string;
  prize?: string;
  ticketPrice?: number;
  price?: number;
  totalTickets?: number;
  style?: Record<string, unknown>;
  lottery?: string;
  terms?: string | null;
  digits?: number;
  startDate?: string;
  endDate?: string;
  securityCode?: string;
  instantWins?: number[];
  minTickets?: number;
  paymentMethods?: string[];
}) {
  return safeFetch("/raffles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminRaffles() {
  return safeFetch<Array<Record<string, unknown>>>("/admin/raffles");
}

export async function adminActivateRaffle(raffleId: string | number) {
  return safeFetch<{ message?: string; raffle?: Record<string, unknown> }>(`/admin/raffles/${raffleId}/activate`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function adminUpdateRaffle(raffleId: string | number, data: Record<string, unknown>) {
  return safeFetch<Record<string, unknown>>(`/admin/raffles/${raffleId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
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
  return safeFetch<{
    branding?: Record<string, unknown>;
    modules?: Record<string, unknown>;
    company?: Record<string, unknown>;
    smtp?: Record<string, unknown>;
    techSupport?: Record<string, unknown>;
  }>("/superadmin/settings");
}

export async function updateSuperadminModules(modules: Record<string, unknown>) {
  return safeFetch("/superadmin/settings/modules", {
    method: "PATCH",
    body: JSON.stringify({ modules }),
  });
}

export async function updateSuperadminBranding(branding: Record<string, unknown>) {
  return safeFetch("/superadmin/settings/branding", {
    method: "PATCH",
    body: JSON.stringify(branding),
  });
}

export async function updateSuperadminSmtp(smtp: Record<string, unknown>) {
  return safeFetch("/superadmin/settings/smtp", {
    method: "PATCH",
    body: JSON.stringify(smtp),
  });
}

export async function updateSuperadminTechSupport(techSupport: Record<string, unknown>) {
  return safeFetch("/superadmin/settings/tech-support", {
    method: "PATCH",
    body: JSON.stringify(techSupport),
  });
}

export async function fetchTechSupportSettings() {
  return safeFetch<Record<string, unknown>>("/settings/tech-support", { method: "GET" }, { skipRefresh: true });
}

export async function fetchAdminSecurityCode() {
  return safeFetch<{ code?: string; active?: boolean }>("/admin/security-code");
}

export async function regenerateAdminSecurityCode() {
  return safeFetch<{ code?: string }>("/admin/security-code/regenerate", { method: "POST" });
}

export async function fetchAdminMetricsSummary() {
  return safeFetch<Record<string, unknown>>("/admin/metrics/summary");
}

export async function fetchAdminMetricsByState() {
  return safeFetch<Array<Record<string, unknown>>>("/admin/metrics/by-state");
}

export async function fetchAdminMetricsTopBuyers() {
  return safeFetch<Array<Record<string, unknown>>>("/admin/metrics/top-buyers");
}

export async function fetchAnnouncements() {
  return safeFetch<Array<Record<string, unknown>>>("/announcements", { method: "GET" }, { skipRefresh: true });
}

export async function adminCreateAnnouncement(payload: { title: string; content: string; imageUrl?: string }) {
  return safeFetch("/admin/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminBroadcastPush(payload: { title: string; body: string }) {
  return safeFetch<{ message?: string; count?: number }>("/admin/push/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSuperadminMailLogs() {
  return safeFetch<Array<Record<string, unknown>>>("/superadmin/mail/logs");
}

export async function fetchSuperadminAuditUsers() {
  return safeFetch<Array<Record<string, unknown>>>("/superadmin/audit/users");
}

export async function fetchSuperadminAuditActions() {
  return safeFetch<Array<Record<string, unknown>>>("/superadmin/audit/actions");
}

export async function fetchSuperadminReports(params?: { status?: string; take?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.take) qs.set("take", String(params.take));
  const q = qs.toString();
  return safeFetch<Array<Record<string, unknown>>>(`/superadmin/reports${q ? `?${q}` : ""}`);
}

export async function updateSuperadminReportStatus(reportId: string | number, status: string) {
  return safeFetch<{ id?: number; status?: string }>(`/superadmin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
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

export async function fetchSuperadminAdminsActiveRaffles(params?: { includeClosed?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.includeClosed) qs.set("includeClosed", "true");
  const q = qs.toString();
  return safeFetch<Array<Record<string, unknown>>>(`/superadmin/admins/active-raffles${q ? `?${q}` : ""}`);
}

export async function superadminSearchRiferos(params: { q: string; take?: number; includeInactive?: boolean; scanTake?: number }) {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.take) qs.set("take", String(params.take));
  if (params.scanTake) qs.set("scanTake", String(params.scanTake));
  if (params.includeInactive) qs.set("includeInactive", "true");
  const q = qs.toString();
  return safeFetch<Array<Record<string, unknown>>>(`/superadmin/riferos/search?${q}`);
}

export async function superadminFetchRiferoRaffles(riferoIdOrPublicId: string | number, params?: { status?: "active" | "draft" | "closed" | "all" }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  return safeFetch<{ user?: Record<string, unknown>; raffles?: Array<Record<string, unknown>> }>(
    `/superadmin/riferos/${riferoIdOrPublicId}/raffles${q ? `?${q}` : ""}`,
  );
}

export async function superadminReportRaffle(raffleId: string | number, payload: { reason: string; details?: string }) {
  return safeFetch<{ message?: string; reportId?: number | null }>(`/superadmin/raffles/${raffleId}/report`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function superadminCloseRaffle(raffleId: string | number, payload: { reason: string; details?: string }) {
  return safeFetch<{ message?: string }>(`/superadmin/raffles/${raffleId}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
