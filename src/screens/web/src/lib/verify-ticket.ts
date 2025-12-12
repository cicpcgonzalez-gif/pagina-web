import { getAuthToken } from "./session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function safeVerify(serial: string): Promise<string> {
  if (!API_BASE) throw new Error("API_BASE no configurado");

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/verify-ticket/${encodeURIComponent(serial)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }

  const data = await res.json();
  if (data?.status) return `Estado: ${data.status}`;
  return JSON.stringify(data);
}
