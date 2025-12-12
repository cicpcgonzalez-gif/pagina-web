let cachedToken: string | null = null;
let cachedRole: string | null = null;

export function setAuthToken(token: string) {
  cachedToken = token;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("auth_token", token);
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

export function setUserRole(role: string | null) {
  cachedRole = role;
  if (typeof window !== "undefined") {
    try {
      if (role) {
        localStorage.setItem("user_role", role);
      } else {
        localStorage.removeItem("user_role");
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
    } catch {
      // ignore storage errors
    }
  }
}

export function clearAuthToken() {
  cachedToken = null;
  cachedRole = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
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
    } catch {
      // ignore storage errors
    }
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
