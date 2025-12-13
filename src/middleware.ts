import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/recuperar", "/verificar", "/api"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return false;
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }
  if (pathname.startsWith("/_next") || pathname.startsWith("/assets")) {
    return true;
  }
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return true;
  }
  if (pathname.includes(".")) {
    return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname || "/");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)",
  ],
};
