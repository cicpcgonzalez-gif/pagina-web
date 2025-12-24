"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchAdminMetricsByState, fetchAdminMetricsSummary, fetchAdminMetricsTopBuyers } from "@/lib/api"
import { BarChart3 } from "lucide-react"

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [byState, setByState] = useState<Array<Record<string, unknown>>>([])
  const [topBuyers, setTopBuyers] = useState<Array<Record<string, unknown>>>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, st, top] = await Promise.all([
        fetchAdminMetricsSummary(),
        fetchAdminMetricsByState(),
        fetchAdminMetricsTopBuyers(),
      ])
      setSummary((s as any) ?? null)
      setByState(Array.isArray(st) ? (st as any) : [])
      setTopBuyers(Array.isArray(top) ? (top as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las métricas.")
      setSummary(null)
      setByState([])
      setTopBuyers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stat = (label: string, value: unknown) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-white">{typeof value === "number" ? value.toLocaleString() : String(value ?? "-")}</p>
    </div>
  )

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/dashboard" title="Dashboard">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">DASHBOARD</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <BarChart3 className="h-4 w-4" /> Métricas
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Dashboard</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/admin/metrics</span> (summary, by-state, top-buyers).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
          ) : null}

          <section className="grid gap-3 md:grid-cols-4">
            {stat("Rifas activas", (summary as any)?.activeRaffles)}
            {stat("Tickets vendidos", (summary as any)?.ticketsSold)}
            {stat("Ingresos", (summary as any)?.revenue)}
            {stat("Usuarios", (summary as any)?.users)}
          </section>

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <h3 className="text-sm font-extrabold text-white">Por estado</h3>
              {!byState.length && !loading ? <p className="mt-3 text-sm text-slate-300">Sin datos.</p> : null}
              <div className="mt-4 space-y-2">
                {byState.slice(0, 10).map((row, idx) => (
                  <div key={String((row as any)?.state ?? idx)} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                    <p className="text-sm text-slate-100">{String((row as any)?.state ?? "-")}</p>
                    <p className="text-sm font-bold text-white">{String((row as any)?.count ?? "-")}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <h3 className="text-sm font-extrabold text-white">Top compradores</h3>
              {!topBuyers.length && !loading ? <p className="mt-3 text-sm text-slate-300">Sin datos.</p> : null}
              <div className="mt-4 space-y-2">
                {topBuyers.slice(0, 10).map((row, idx) => (
                  <div key={String((row as any)?.userId ?? idx)} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-white">{String((row as any)?.name ?? (row as any)?.email ?? "Usuario")}</p>
                      <p className="text-sm font-extrabold text-amber-200">{String((row as any)?.amount ?? (row as any)?.total ?? "-")}</p>
                    </div>
                    {(row as any)?.count != null ? (
                      <p className="mt-1 text-xs text-slate-300">Compras: {String((row as any)?.count)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
