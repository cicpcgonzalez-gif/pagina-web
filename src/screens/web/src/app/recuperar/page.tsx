"use client";

import { useState } from "react";
import { requestPasswordReset, resetPassword } from "@/lib/api";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await requestPasswordReset({ email });
      setMessage("Código enviado. Revisa tu correo.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo enviar el código.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await resetPassword({ token, password });
      setMessage("Contraseña actualizada. Inicia sesión.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo resetear.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Recuperación</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Recupera tu acceso</h1>
        <p className="text-base text-slate-200/80">Solicita el código y luego ingrésalo junto con tu nueva contraseña.</p>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <form className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5" onSubmit={requestCode}>
          <h2 className="text-lg font-semibold text-white">1. Solicitar código</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-200" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-cyan-300/40 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <form className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5" onSubmit={submitReset}>
          <h2 className="text-lg font-semibold text-white">2. Restablecer</h2>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-200" htmlFor="token">Código / token</label>
            <input
              id="token"
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
              placeholder="Código recibido"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-200" htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-emerald-300/40 disabled:opacity-60"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </section>

      {message && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100">
          {message}
        </div>
      )}
    </main>
  );
}
