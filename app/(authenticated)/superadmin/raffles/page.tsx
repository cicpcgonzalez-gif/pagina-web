"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import {
  fetchSuperadminAdminsActiveRaffles,
  superadminCloseRaffle,
  superadminFetchRiferoRaffles,
  superadminReportRaffle,
  superadminSearchRiferos,
} from "@/lib/api"
import { Flag, RefreshCw, Search, Ticket, XCircle } from "lucide-react"

export default function SuperadminRafflesPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [activeAdmins, setActiveAdmins] = useState<Array<Record<string, unknown>>>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)

  const [q, setQ] = useState("")
  const [results, setResults] = useState<Array<Record<string, unknown>>>([])
  const [loadingSearch, setLoadingSearch] = useState(false)

  const [selectedRiferoId, setSelectedRiferoId] = useState<string | number | null>(null)
  const [selectedRiferoLabel, setSelectedRiferoLabel] = useState<string | null>(null)
  const [status, setStatus] = useState<"active" | "draft" | "closed" | "all">("active")
  const [riferoData, setRiferoData] = useState<{ user?: Record<string, unknown>; raffles?: Array<Record<string, unknown>> } | null>(null)

  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")

  const loadActiveAdmins = useCallback(async () => {
    setLoadingAdmins(true)
    setError(null)
    try {
      const list = await fetchSuperadminAdminsActiveRaffles()
      setActiveAdmins(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setActiveAdmins([])
      setError(e instanceof Error ? e.message : "No se pudieron cargar admins activos.")
    } finally {
      setLoadingAdmins(false)
    }
  }, [])

  useEffect(() => {
    loadActiveAdmins()
  }, [loadActiveAdmins])

  const onSearch = async () => {
    const query = q.trim()
    if (!query) return
    setLoadingSearch(true)
    setError(null)
    setMessage(null)
    try {
      const list = await superadminSearchRiferos({ q: query, take: 20 })
      setResults(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setResults([])
      setError(e instanceof Error ? e.message : "No se pudo buscar.")
    } finally {
      setLoadingSearch(false)
    }
  }

  const loadRiferoRaffles = useCallback(
    async (id: string | number, label?: string) => {
      setLoading(true)
      setError(null)
      setMessage(null)
      try {
        const data = await superadminFetchRiferoRaffles(id, { status })
        setSelectedRiferoId(id)
        setSelectedRiferoLabel(label || null)
        setRiferoData(data)
      } catch (e) {
        setRiferoData(null)
        setError(e instanceof Error ? e.message : "No se pudieron cargar rifas del rifero.")
      } finally {
        setLoading(false)
      }
    },
    [status],
  )

  useEffect(() => {
    if (selectedRiferoId == null) return
    loadRiferoRaffles(selectedRiferoId, selectedRiferoLabel || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const raffles = useMemo(() => {
    const list = riferoData?.raffles
    return Array.isArray(list) ? list : []
  }, [riferoData])

  const onClose = async (raffleId: string | number) => {
    const r = reason.trim()
    if (!r) {
      setError("Motivo requerido para cerrar la rifa.")
      return
    }
    if (!confirm(`¿Cerrar la rifa #${String(raffleId)}?`)) return
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await superadminCloseRaffle(raffleId, { reason: r, details: details.trim() || undefined })
      setMessage((res as any)?.message || "Rifa cerrada")
      if (selectedRiferoId != null) await loadRiferoRaffles(selectedRiferoId, selectedRiferoLabel || undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cerrar la rifa.")
    } finally {
      setLoading(false)
    }
  }

  const onReport = async (raffleId: string | number) => {
    const r = reason.trim()
    if (!r) {
      setError("Motivo requerido para reportar la rifa.")
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await superadminReportRaffle(raffleId, { reason: r, details: details.trim() || undefined })
      setMessage((res as any)?.message || "Reporte creado")
      if (selectedRiferoId != null) await loadRiferoRaffles(selectedRiferoId, selectedRiferoLabel || undefined)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reportar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/raffles" title="Administrar rifas">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">ADMINISTRAR RIFAS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Ticket className="h-4 w-4" /> Superadmin
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Panel de rifas</h2>
            <p className="mt-2 text-slate-200 text-sm">Buscar rifero y moderar rifas (endpoints superadmin).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadActiveAdmins}
                disabled={loadingAdmins}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" /> {loadingAdmins ? "Cargando..." : "Actualizar"}
              </button>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
                Volver
              </Link>
            </div>
          </section>

          {error ? <div className="rounded-2xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          {message ? <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-lg font-bold text-white">Admins con rifas activas</h3>
            {!loadingAdmins && !activeAdmins.length ? <p className="mt-3 text-sm text-slate-300">Sin datos.</p> : null}

            <div className="mt-4 grid gap-3">
              {activeAdmins.slice(0, 12).map((a, idx) => {
                const id = (a as any)?.id ?? idx
                const email = (a as any)?.email
                const name = (a as any)?.name
                const count = Array.isArray((a as any)?.activeRaffles) ? (a as any).activeRaffles.length : 0
                const label = String(name || email || "Admin")
                return (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => loadRiferoRaffles(id, label)}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left hover:bg-slate-950/55 transition"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white truncate">{label}</p>
                        <p className="text-xs text-slate-300 truncate">{email ? String(email) : ""}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">Activas: {count}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-lg font-bold text-white">Buscar rifero</h3>
            <p className="mt-1 text-xs text-slate-300">Por email, publicId o securityId.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="q">Búsqueda</label>
                <input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ej: admin@email.com"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={onSearch}
                disabled={loadingSearch || !q.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                <Search className="h-4 w-4" /> {loadingSearch ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {!loadingSearch && q.trim() && !results.length ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">Sin resultados.</div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {results.slice(0, 20).map((u, idx) => {
                const id = (u as any)?.id ?? idx
                const email = (u as any)?.email
                const name = (u as any)?.name
                const publicId = (u as any)?.publicId
                const label = String(name || email || publicId || "Rifero")
                return (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => loadRiferoRaffles(id, label)}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left hover:bg-slate-950/55 transition"
                  >
                    <p className="text-sm font-extrabold text-white truncate">{label}</p>
                    <p className="mt-1 text-xs text-slate-300 truncate">{email ? String(email) : ""}</p>
                    <p className="text-xs text-slate-400 truncate">publicId: {publicId ? String(publicId) : "—"}</p>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Rifas del rifero</h3>
                <p className="mt-1 text-xs text-slate-300">Seleccionado: {selectedRiferoLabel || (selectedRiferoId != null ? String(selectedRiferoId) : "—")}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                  >
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="closed">closed</option>
                    <option value="all">all</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="reason">Motivo</label>
                  <input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo (requerido)"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="details">Detalles</label>
                  <input
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Detalles (opcional)"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {loading ? <p className="mt-4 text-sm text-slate-300">Cargando…</p> : null}

            {!loading && selectedRiferoId == null ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">
                Selecciona un rifero para ver sus rifas.
              </div>
            ) : null}

            {!loading && selectedRiferoId != null && !raffles.length ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">
                No hay rifas en este filtro.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {raffles.slice(0, 60).map((r, idx) => {
                const id = (r as any)?.id ?? idx
                const title = (r as any)?.title ?? "Rifa"
                const st = (r as any)?.status
                const createdAt = (r as any)?.createdAt
                const sold = (r as any)?.soldTickets

                return (
                  <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white truncate">#{String(id)} · {String(title)}</p>
                        <p className="mt-1 text-xs text-slate-300">Status: {String(st ?? "-")}{typeof sold === "number" ? ` · Vendidos: ${sold}` : ""}</p>
                        {createdAt ? <p className="text-xs text-slate-400">{new Date(String(createdAt)).toLocaleString()}</p> : null}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => onReport(id)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition disabled:opacity-60"
                        >
                          <Flag className="h-4 w-4" /> Reportar
                        </button>
                        <button
                          type="button"
                          onClick={() => onClose(id)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" /> Cerrar
                        </button>
                      </div>
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
