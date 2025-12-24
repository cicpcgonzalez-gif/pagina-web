"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchAdminPayments, reconcilePayment, rejectManualPayment } from "@/lib/api"
import { CheckCircle2, RefreshCw, Shield, XCircle } from "lucide-react"

type AdminPayment = {
  id?: string | number
  raffleId?: string | number
  amount?: number
  reference?: string
  proof?: string | null
  status?: string
  createdAt?: string
  user?: { id?: string | number; name?: string; email?: string }
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminPayment[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAdminPayments()
      setItems(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los pagos.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pending = useMemo(
    () => items.filter((p) => String(p.status || "").toLowerCase() === "pending"),
    [items],
  )

  const onApprove = async (id: string | number | undefined) => {
    if (!id) return
    setError(null)
    try {
      await reconcilePayment(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo aprobar.")
    }
  }

  const onReject = async (id: string | number | undefined) => {
    if (!id) return
    setError(null)
    try {
      await rejectManualPayment(id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo rechazar.")
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/payments" title="Pagos">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">VALIDAR PAGOS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Shield className="h-4 w-4" /> Pagos manuales
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Aprobar o rechazar.</h2>
            <p className="mt-2 text-slate-200 text-sm">Lista de pagos en estado pending.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition"
              >
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
            </div>
          </section>

          {loading ? <p className="text-sm text-slate-300">Cargando…</p> : null}
          {error ? <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}

          {!loading ? (
            pending.length ? (
              <div className="grid gap-3">
                {pending.map((p) => (
                  <div key={String(p.id)} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white">Pago #{String(p.id)}</p>
                        <p className="text-xs text-slate-300 truncate">{p.user?.name || p.user?.email || "Usuario"}</p>
                        <p className="mt-2 text-xs text-slate-300">Referencia: {p.reference || "—"}</p>
                        <p className="text-xs text-slate-300">Monto: {typeof p.amount === "number" ? p.amount : "—"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove(p.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-amber-300 transition"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(p.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/15 transition"
                        >
                          <XCircle className="h-4 w-4" /> Rechazar
                        </button>
                      </div>
                    </div>

                    {p.proof ? (
                      <div className="mt-3">
                        <a
                          href={String(p.proof)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-950/70 transition"
                        >
                          Ver comprobante
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-slate-200">
                No hay pagos pendientes.
              </div>
            )
          ) : null}
        </main>
      </div>
    </RequireRole>
  )
}
