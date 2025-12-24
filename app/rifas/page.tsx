"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchRaffles } from "@/lib/api"

type Raffle = {
  id: string
  title: string
  price: number
  ticketsAvailable: number
  ticketsTotal: number
  drawDate: string
  status: string
}

export default function RifasPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Raffle[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchRaffles()
        if (!mounted) return
        setItems(Array.isArray(data) ? (data as any) : [])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudieron cargar las rifas.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Rifas</h1>
      <p className="text-white/70 mb-6">Explora rifas activas y participa.</p>

      {loading ? <p className="text-white/70">Cargando…</p> : null}
      {error ? (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }}>
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-3">
          {items.length ? (
            items.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border px-4 py-4"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{r.title}</div>
                    <div className="text-white/70 text-sm">Sorteo: {r.drawDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${Number(r.price || 0).toFixed(2)}</div>
                    <div className="text-white/70 text-sm">
                      {r.ticketsAvailable}/{r.ticketsTotal} disponibles
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/login">
                    Comprar (login)
                  </Link>
                  <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/ganadores">
                    Ver ganadores
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/70">No hay rifas para mostrar.</div>
          )}
        </div>
      ) : null}
    </main>
  )
}
