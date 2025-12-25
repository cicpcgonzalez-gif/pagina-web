"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminMailLogs } from "@/lib/api"
import { MailSearch, RefreshCw } from "lucide-react"

export default function SuperadminMailLogsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchSuperadminMailLogs()
      setItems(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los logs.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => {
      load()
    }, 20_000)
    return () => clearInterval(id)
  }, [load])

  const normalized = useMemo(() => {
    return items
      .filter(Boolean)
      .map((it) => {
        const anyIt: any = it
        return {
          id: anyIt?.id ?? `${anyIt?.timestamp ?? ""}-${anyIt?.to ?? anyIt?.email ?? ""}`,
          to: String(anyIt?.to ?? anyIt?.email ?? anyIt?.recipient ?? "-"),
          subject: String(anyIt?.subject ?? "Correo"),
          status: String(anyIt?.status ?? "-"),
          timestamp: anyIt?.timestamp ? String(anyIt.timestamp) : anyIt?.createdAt ? String(anyIt.createdAt) : "",
          errorText: anyIt?.error ? String(anyIt.error) : anyIt?.errorMessage ? String(anyIt.errorMessage) : "",
        }
      })
  }, [items])

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/mail-logs" title="Logs de correo">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">LOGS DE CORREO</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <MailSearch className="h-4 w-4" /> Correo
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Logs</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/mail/logs</span>.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/15 transition disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" /> {loading ? "Cargando..." : "Actualizar"}
              </button>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
                Volver
              </Link>
            </div>
          </section>

          {error ? <div className="rounded-2xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-sm font-extrabold text-white">Registros</h3>
            <p className="mt-1 text-xs text-slate-300">Total: {normalized.length}</p>

            {!loading && !normalized.length ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">Sin logs.</div>
            ) : null}

            <div className="mt-4 space-y-3">
              {normalized.slice(0, 50).map((it) => {
                const statusOk = String(it.status).toUpperCase() === "SENT"
                return (
                  <div key={String(it.id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-extrabold text-white">{it.subject}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          statusOk ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-200"
                        }`}
                      >
                        {it.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-300">Para: {it.to}{it.timestamp ? ` · ${new Date(it.timestamp).toLocaleString()}` : ""}</p>
                    {it.errorText ? <p className="mt-2 text-xs text-red-200 whitespace-pre-wrap">{it.errorText}</p> : null}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
