"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { resetPassword } from "@/lib/api"
import { KeyRound, Save } from "lucide-react"

export default function RecuperarConfirmPage() {
  const router = useRouter()

  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const qs = typeof window !== "undefined" ? window.location.search : ""
      const params = new URLSearchParams(qs)
      const t = params.get("token")
      if (t) setToken(t)
    } catch {
      // ignore
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      await resetPassword({ token: token.trim(), password })
      setMessage("Contraseña actualizada. Inicia sesión.")
      setTimeout(() => router.push("/login"), 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">NUEVA CLAVE</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6 pb-24">
        <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
            <KeyRound className="h-4 w-4" /> Seguridad
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Restablecer contraseña</h2>
          <p className="mt-2 text-slate-200 text-sm">Pega el token recibido y define una nueva contraseña.</p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="token">Token</label>
              <input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                placeholder="Pega el token aquí"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300" htmlFor="password">Nueva contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {loading ? "Guardando..." : "Guardar"}
            </button>
          </form>

          {error ? <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          {message ? <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/recuperar">
              Volver
            </Link>
            <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/login">
              Ir a Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
