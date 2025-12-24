"use client"

import Link from "next/link"
import { useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { adminBroadcastPush } from "@/lib/api"
import { Bell } from "lucide-react"

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await adminBroadcastPush({ title: title.trim(), body: body.trim() })
      const msg = (res as any)?.message ? String((res as any).message) : "Notificación enviada"
      const count = typeof (res as any)?.count === "number" ? (res as any).count : null
      setMessage(count === null ? msg : `${msg} (dispositivos: ${count})`)
      setTitle("")
      setBody("")
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "No se pudo enviar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/notifications" title="Notificaciones">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">NOTIFICACIONES</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Bell className="h-4 w-4" /> Sistema
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Centro de avisos</h2>
            <p className="mt-2 text-slate-200 text-sm">Enviar broadcast (endpoint <span className="font-semibold">/admin/push/broadcast</span>).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <form className="space-y-4" onSubmit={onSend}>
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="title">Título</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Promo / Aviso"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="body">Mensaje</label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Texto de la notificación"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
            ) : null}
            {message ? (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div>
            ) : null}
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
