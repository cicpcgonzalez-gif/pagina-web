let cachedToken: string | null = null;
let cachedRole: string | null = null;
let cachedRefresh: string | null = null;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function setCookie(name: string, value: string, options?: { maxAge?: number }) {
  if (typeof document === "undefined") return;
  const maxAge = options?.maxAge ?? COOKIE_MAX_AGE;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function setAuthToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("auth_token", token);
      setCookie("auth_token", token);
    } catch {
      // ignore storage errors
    }
  }
}

export function getAuthToken(): string | null {
  if (cachedToken) return cachedToken;
  if (typeof window !== "undefined") {
    try {
      cachedToken = localStorage.getItem("auth_token");
      return cachedToken;
    } catch {
      return null;
    }
  }
  return null;
}

export function setRefreshToken(token: string | null) {
  cachedRefresh = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem("refresh_token", token);
        setCookie("refresh_token", token);
      } else {
        localStorage.removeItem("refresh_token");
        removeCookie("refresh_token");
      }
    } catch {
      // ignore storage errors
    }
  }
}

export function getRefreshToken(): string | null {
  if (cachedRefresh) return cachedRefresh;
  if (typeof window !== "undefined") {
    try {
      cachedRefresh = localStorage.getItem("refresh_token");
      return cachedRefresh;
    } catch {
      return null;
    }
  }
  return null;
}

export function setUserRole(role: string | null) {
  cachedRole = role;
  if (typeof window !== "undefined") {
    try {
      if (role) {
        localStorage.setItem("user_role", role);
        setCookie("user_role", role);
      } else {
        localStorage.removeItem("user_role");
        removeCookie("user_role");
      }
    } catch {
      // ignore storage errors
    }
  }
}

export function getUserRole(): string | null {
  if (cachedRole) return cachedRole;
  if (typeof window !== "undefined") {
    try {
      cachedRole = localStorage.getItem("user_role");
      return cachedRole;
    } catch {
      return null;
    }
  }
  return null;
}

export function removeUserRole() {
  cachedRole = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user_role");
      removeCookie("user_role");
    } catch {
      // ignore storage errors
    }
  }
}

export function clearAuthToken() {
  cachedToken = null;
  cachedRole = null;
  cachedRefresh = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("refresh_token");
      removeCookie("auth_token");
      removeCookie("user_role");
      removeCookie("refresh_token");
    } catch {
      // ignore
    }
  }
}

export function removeAuthToken() {
  cachedToken = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      removeCookie("auth_token");
    } catch {
      // ignore storage errors
    }
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
