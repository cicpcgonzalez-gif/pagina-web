"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchRaffles } from "@/lib/api"
import { CreateRaffleModal } from "@/components/admin/CreateRaffleModal"
import { RefreshCw, Ticket, ExternalLink } from "lucide-react"

type RaffleRow = {
  id?: string | number
  title?: string
  name?: string
  price?: number
  status?: string
  drawDate?: string
}

export default function AdminRafflesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<RaffleRow[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchRaffles()
      setItems(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar rifas.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/raffles" title="Rifas">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">GESTIÓN DE RIFAS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Ticket className="h-4 w-4" /> Admin
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Crear y revisar.</h2>
            <p className="mt-2 text-slate-200 text-sm">Crea rifas y revisa las existentes.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CreateRaffleModal />
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition"
              >
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          {loading ? <p className="text-sm text-slate-300">Cargando…</p> : null}
          {error ? <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}

          {!loading && !error ? (
            items.length ? (
              <div className="grid gap-3">
                {items.slice(0, 50).map((r) => (
                  <div key={String(r.id)} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white truncate">{(r as any)?.title || (r as any)?.name || "Rifa"}</p>
                        <p className="mt-1 text-xs text-slate-300">Estado: {String((r as any)?.status || "—")}</p>
                        <p className="text-xs text-slate-300">Cierre: {String((r as any)?.drawDate || "—")}</p>
                      </div>
                      {r.id ? (
                        <Link
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/15 transition"
                          href={`/rifas/${r.id}`}
                        >
                          <ExternalLink className="h-4 w-4" /> Ver
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
                {items.length > 50 ? <p className="text-xs text-slate-400">Mostrando 50 de {items.length}.</p> : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-slate-200">
                No hay rifas.
              </div>
            )
          ) : null}
        </main>
      </div>
    </RequireRole>
  )
}
