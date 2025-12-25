"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminReports, updateSuperadminReportStatus } from "@/lib/api"
import { Flag, RefreshCw } from "lucide-react"

export default function SuperadminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const list = await fetchSuperadminReports({ status: "open", take: 50 })
      setItems(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los reportes.")
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
    }, 15_000)
    return () => clearInterval(id)
  }, [load])

  const setStatus = async (reportId: string | number, status: "reviewed" | "resolved" | "dismissed") => {
    setActingId(reportId)
    setError(null)
    setMessage(null)
    try {
      await updateSuperadminReportStatus(reportId, status)
      setMessage("Estado actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el estado.")
    } finally {
      setActingId(null)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/reports" title="Denuncias y reportes">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">DENUNCIAS Y REPORTES</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Flag className="h-4 w-4" /> Reportes
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Denuncias y reportes</h2>
            <p className="mt-2 text-slate-200 text-sm">Se muestran reportes abiertos (<span className="font-semibold">status=open</span>) como en la app.</p>
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
          {message ? <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            {!loading && !items.length ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">No hay reportes pendientes.</div>
            ) : null}

            <div className="space-y-3">
              {items.slice(0, 80).map((r, idx) => {
                const anyR: any = r
                const id = anyR?.id ?? idx
                const createdAt = anyR?.createdAt
                const reason = anyR?.reason || "Reporte"
                const details = anyR?.details
                const reportedName = anyR?.reported?.name
                const reportedEmail = anyR?.reported?.email
                const reporterName = anyR?.reporter?.name
                const reporterEmail = anyR?.reporter?.email
                const raffleTitle = anyR?.raffle?.title
                return (
                  <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="text-sm font-extrabold text-white">{String(reason)}</p>
                      {createdAt ? <p className="text-xs text-slate-400">{new Date(String(createdAt)).toLocaleString()}</p> : null}
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-300">Reportado: {String(reportedName || "—")} ({String(reportedEmail || "—")})</p>
                      <p className="text-xs text-slate-400">Reportado por: {String(reporterName || "—")} ({String(reporterEmail || "—")})</p>
                      {raffleTitle ? <p className="text-xs text-slate-400">Rifa: {String(raffleTitle)}</p> : null}
                      {details ? <p className="pt-2 text-sm text-slate-100 whitespace-pre-wrap">{String(details)}</p> : null}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setStatus(id, "reviewed")}
                        disabled={actingId === id}
                        className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-3 text-sm font-extrabold text-emerald-100 disabled:opacity-60"
                      >
                        Revisado
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(id, "resolved")}
                        disabled={actingId === id}
                        className="rounded-xl border border-blue-500/35 bg-blue-500/15 px-4 py-3 text-sm font-extrabold text-blue-100 disabled:opacity-60"
                      >
                        Resuelto
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(id, "dismissed")}
                        disabled={actingId === id}
                        className="rounded-xl border border-red-500/35 bg-red-500/15 px-4 py-3 text-sm font-extrabold text-red-100 disabled:opacity-60"
                      >
                        Descartar
                      </button>
                    </div>
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
