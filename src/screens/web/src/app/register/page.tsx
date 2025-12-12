"use client";

import { useState } from "react";
import { register } from "@/lib/api";
import { setAuthToken, setUserRole } from "@/lib/session";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await register({ name, email, phone, password });
      const token = res?.token ?? res?.accessToken;
      if (token) {
        setAuthToken(token);
        const role = res.user?.role || "sin-rol";
        setUserRole(role);
        setMessage("Registro exitoso. Sesión iniciada.");
      } else {
        setMessage("Registro exitoso. Inicia sesión para continuar.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo registrar.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-night-sky text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-20 pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Registro</p>
          <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">
            Crea tu cuenta para vender o comprar.
          </h1>
          <p className="text-base text-white/80">
            Usa los mismos datos que en la app. Tras registrarte, verifica tu correo si tu backend lo requiere.
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            <li>• Endpoint: POST /register (email, phone, password, name opcional).</li>
            <li>• Si tu backend envía token, iniciamos sesión automáticamente.</li>
            <li>• Ajusta campos requeridos según tus reglas de validación.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3">
                <span aria-hidden className="text-lg">🧑</span>
                <input
                  id="name"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3">
                <span aria-hidden className="text-lg">📱</span>
                <input
                  id="phone"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  placeholder="0412-0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3">
              <span aria-hidden className="text-lg">✉️</span>
              <input
                id="email"
                type="email"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3">
              <span aria-hidden className="text-lg">🔒</span>
              <input
                id="password"
                type="password"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
              {message}
            </div>
          )}

          <div className="mt-6 space-y-2 text-xs text-white/75">
            <p className="font-semibold text-white">Notas</p>
            <p>
              Si tu backend requiere verificación por código, agrega el flujo de verificación y reenvío.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
