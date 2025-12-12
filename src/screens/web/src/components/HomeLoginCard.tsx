"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { login } from "@/lib/api";
import { setAuthToken, setUserRole } from "@/lib/session";

export function HomeLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await login({ email, password });
      const token = (res as any).token || (res as any).accessToken;
      if (!token) {
        setMessage("Inicio de sesión sin token.");
        return;
      }
      setAuthToken(token);
      const role = (res as any).user?.role || "sin-rol";
      setUserRole(role);
      router.push("/rifas");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
      <div className="mb-4 flex items-center justify-between text-sm text-white/70">
        <span className="font-semibold text-white">Acceso rápido</span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Portal</span>
      </div>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.2em] text-white/60">Correo</label>
          <input
            type="email"
            required
            className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
            <span>Contraseña</span>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Mostrar
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-white/70">
          <button
            type="button"
            className={`inline-flex items-center gap-2 text-left text-sm ${remember ? "text-white" : "text-white/70"}`}
            onClick={() => setRemember((v) => !v)}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded border border-white/30 bg-white/5">{remember ? "✓" : ""}</span>
            Mantener la cuenta abierta
          </button>
          <Link href="/register" className="text-[#93c5fd] hover:text-white underline">
            Recuperar / Registrarse
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" /> {loading ? "Verificando..." : "Entrar"}
        </button>
      </form>

      {message && (
        <div className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {message}
        </div>
      )}
    </div>
  );
}
