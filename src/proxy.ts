import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_AUTH_MAX = 40;
const rateBucket = new Map<string, { count: number; reset: number }>();

function ensureRequestId(req: NextRequest): [Headers, string] {
  const headers = new Headers(req.headers);
  const current = headers.get("x-request-id") || headers.get("request-id");
  const requestId = current || crypto.randomUUID();
  headers.set("x-request-id", requestId);
  return [headers, requestId];
}

function redirectToLogin(req: NextRequest, requestId: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.redirect(url);
  res.headers.set("x-request-id", requestId);
  return res;
}

function clientKey(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const headerIp = forwarded ? forwarded.split(",")[0].trim() : null;
  const fallbackIp = (req as any).ip || (req as any).socket?.remoteAddress;
  return headerIp || fallbackIp || "unknown";
}

function isAuthPath(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/recuperar") || pathname.startsWith("/api/auth");
}

function applyRateLimit(req: NextRequest, requestId: string): NextResponse | null {
  const key = `${clientKey(req)}|${isAuthPath(req.nextUrl.pathname) ? "auth" : "general"}`;
  const now = Date.now();
  const entry = rateBucket.get(key);
  if (!entry || now > entry.reset) {
    rateBucket.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }
  const limit = isAuthPath(req.nextUrl.pathname) ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_MAX;
  if (entry.count >= limit) {
    const res = NextResponse.json({ error: "Too many requests" }, { status: 429 });
    res.headers.set("x-request-id", requestId);
    res.headers.set("retry-after", Math.ceil((entry.reset - now) / 1000).toString());
    return res;
  }
  entry.count += 1;
  rateBucket.set(key, entry);
  return null;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const [headersWithId, requestId] = ensureRequestId(req);
  const token = req.cookies.get("auth_token")?.value;
  const role = req.cookies.get("user_role")?.value?.toLowerCase();

  const limited = applyRateLimit(req, requestId);
  if (limited) return limited;

  const requiresSuper = pathname.startsWith("/superadmin");
  const requiresAdmin = pathname.startsWith("/admin");

  if (requiresSuper) {
    if (!token || role !== "superadmin") {
      return redirectToLogin(req, requestId);
    }
  } else if (requiresAdmin) {
    if (!token || (role !== "admin" && role !== "superadmin")) {
      return redirectToLogin(req, requestId);
    }
  }

  const res = NextResponse.next({ request: { headers: headersWithId } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/api/:path*", "/login", "/register", "/recuperar"],
};
