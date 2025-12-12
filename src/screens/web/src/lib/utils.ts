import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTicketNumber(value: string | number, digits = 4) {
  return String(value ?? "").padStart(digits, "0");
}

// RNG seguro: usa crypto cuando está disponible para evitar sesgos de Math.random.
export function secureRandomInt(min: number, max: number) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  if (high < low) throw new Error("Rango inválido para RNG");

  const range = high - low + 1;
  const buf = new Uint32Array(1);

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(buf);
    return low + (buf[0] % range);
  }

  return low + Math.floor(Math.random() * range);
}

export function generateTicketCode(digits = 4) {
  const max = 10 ** digits - 1;
  const num = secureRandomInt(0, max);
  return formatTicketNumber(num, digits);
}
