"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminAuditActions, fetchSuperadminAuditUsers } from "@/lib/api"
import { RefreshCw, Shield } from "lucide-react"

export default function SuperadminAuditPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([])
  const [actions, setActions] = useState<Array<Record<string, unknown>>>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [u, a] = await Promise.all([fetchSuperadminAuditUsers(), fetchSuperadminAuditActions()])
      setUsers(Array.isArray(u) ? (u as any) : [])
      setActions(Array.isArray(a) ? (a as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la auditoría.")
      setUsers([])
      setActions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/audit" title="Auditoría">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">AUDITORÍA</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Shield className="h-4 w-4" /> Logs
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Auditoría</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/audit/users</span> y <span className="font-semibold">/superadmin/audit/actions</span>.</p>
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

          <section className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <h3 className="text-sm font-extrabold text-white">Usuarios auditados</h3>
              <p className="mt-1 text-xs text-slate-300">Total: {users.length}</p>
              {!loading && !users.length ? <p className="mt-4 text-sm text-slate-300">Sin datos.</p> : null}
              {users.length ? (
                <pre className="mt-4 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify(users.slice(0, 50), null, 2)}</pre>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <h3 className="text-sm font-extrabold text-white">Acciones</h3>
              <p className="mt-1 text-xs text-slate-300">Total: {actions.length}</p>
              {!loading && !actions.length ? <p className="mt-4 text-sm text-slate-300">Sin datos.</p> : null}
              {actions.length ? (
                <pre className="mt-4 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify(actions.slice(0, 50), null, 2)}</pre>
              ) : null}
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
