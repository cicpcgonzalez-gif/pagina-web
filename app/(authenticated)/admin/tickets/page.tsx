"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { safeVerify } from "@/lib/verify-ticket"
import { fetchAdminTickets } from "@/lib/api"
import type { AdminTicket } from "@/lib/types"
import { BadgeCheck, QrCode } from "lucide-react"

export default function AdminTicketsPage() {
  const [serial, setSerial] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [items, setItems] = useState<AdminTicket[]>([])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await safeVerify(serial.trim())
      setResult(res)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo verificar."
      setResult(msg)
    } finally {
      setLoading(false)
    }
  }

  const load = async () => {
    setListLoading(true)
    setListError(null)
    try {
      const data = await fetchAdminTickets({ q: q.trim() || undefined, take: 200 })
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudieron cargar los tickets."
      setListError(msg)
      setItems([])
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/tickets" title="Verificador">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">VERIFICADOR</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <QrCode className="h-4 w-4" /> Validación
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Valida un boleto</h2>
            <p className="mt-2 text-slate-200 text-sm">Serial/código del ticket.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="serial">Serial o código</label>
                <input
                  id="serial"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="ABC-123"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                <BadgeCheck className="h-4 w-4" /> {loading ? "Verificando..." : "Verificar"}
              </button>
            </form>

            {result ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100">
                {result}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="q">Buscar tickets</label>
                <input
                  id="q"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Email, número, serial, nombre, teléfono, cédula..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={load}
                disabled={listLoading}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                {listLoading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {listError ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{listError}</div>
            ) : null}

            {!listLoading && !listError ? (
              items.length ? (
                <div className="mt-4 grid gap-3">
                  {items.map((t, idx) => {
                    const id = t.id ?? idx
                    const title = t.raffleTitle || (t as any)?.raffle?.title || "Rifa"
                    const buyer = t.user?.name || t.user?.email || "Comprador"
                    return (
                      <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-white">Ticket #{String(t.number ?? "—")}</p>
                            <p className="text-xs text-slate-300 truncate">{String(title)}</p>
                            <p className="mt-2 text-xs text-slate-300 truncate">{buyer}</p>
                            <p className="text-xs text-slate-400 break-all">Serial: {t.serialNumber ?? "—"}</p>
                          </div>
                          <div className="text-right">
                            {t.status ? (
                              <span className="inline-flex rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                                {String(t.status)}
                              </span>
                            ) : null}
                            {t.createdAt ? (
                              <p className="mt-2 text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">
                  No hay resultados.
                </div>
              )
            ) : null}
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
