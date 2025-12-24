"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminReports, updateSuperadminReportStatus } from "@/lib/api"
import { Flag, RefreshCw, Save } from "lucide-react"

export default function SuperadminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState("")
  const [take, setTake] = useState(50)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const list = await fetchSuperadminReports({ status: statusFilter || undefined, take })
      setItems(Array.isArray(list) ? (list as any) : [])
      setDraftStatus((prev) => {
        const next = { ...prev }
        for (const r of Array.isArray(list) ? (list as any) : []) {
          const id = (r as any)?.id
          if (id != null && next[String(id)] == null) {
            next[String(id)] = String((r as any)?.status ?? "")
          }
        }
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los reportes.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, take])

  useEffect(() => {
    load()
  }, [load])

  const onSaveStatus = async (reportId: string | number) => {
    setSavingId(reportId)
    setError(null)
    setMessage(null)
    try {
      const next = (draftStatus as any)?.[String(reportId)]
      await updateSuperadminReportStatus(reportId, String(next ?? ""))
      setMessage("Estado actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el estado.")
    } finally {
      setSavingId(null)
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
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/reports</span> (GET) y <span className="font-semibold">/superadmin/reports/:id</span> (PATCH).</p>
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="status">Filtrar por status (opcional)</label>
                <input
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="pending, open, resolved..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="take">Cantidad</label>
                <input
                  id="take"
                  type="number"
                  min={1}
                  max={200}
                  value={take}
                  onChange={(e) => setTake(Number(e.target.value || 50))}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={load}
                  className="w-full rounded-full bg-purple-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-purple-500 transition"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {!loading && !items.length ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">No hay reportes.</div>
            ) : null}

            <div className="mt-4 space-y-3">
              {items.slice(0, 100).map((r, idx) => {
                const id = (r as any)?.id ?? idx
                const status = (r as any)?.status
                const createdAt = (r as any)?.createdAt
                const reporter = (r as any)?.reporter?.email ?? (r as any)?.user?.email
                const reason = (r as any)?.reason ?? (r as any)?.message ?? (r as any)?.details
                return (
                  <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-extrabold text-white">Reporte #{String(id)}</p>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{String(status ?? "-")}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-300">{reporter ? `Por ${String(reporter)}` : ""}{createdAt ? ` · ${new Date(String(createdAt)).toLocaleString()}` : ""}</p>
                    {reason ? <p className="mt-3 text-sm text-slate-100 whitespace-pre-wrap">{String(reason)}</p> : null}

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <input
                        value={(draftStatus as any)?.[String(id)] ?? ""}
                        onChange={(e) => setDraftStatus((prev) => ({ ...prev, [String(id)]: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        placeholder="Nuevo status"
                      />
                      <button
                        type="button"
                        onClick={() => onSaveStatus(id)}
                        disabled={savingId === id}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
                      >
                        <Save className="h-4 w-4" /> {savingId === id ? "Guardando..." : "Guardar"}
                      </button>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-slate-300">Ver JSON</summary>
                      <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify(r, null, 2)}</pre>
                    </details>
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
