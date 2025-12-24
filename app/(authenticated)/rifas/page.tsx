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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rifas</h1>
          <p className="text-gray-600">Explora rifas activas y participa.</p>
        </div>
        <Link
          href="/tickets"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          Mis tickets
        </Link>
      </div>

      {loading ? <p className="text-gray-600">Cargando…</p> : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.length ? (
            items.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{r.title}</div>
                    <div className="text-sm text-gray-500">Sorteo: {new Date(r.drawDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">${Number(r.price || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {r.ticketsAvailable}/{r.ticketsTotal} disponibles
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-white text-sm font-semibold hover:bg-blue-700 transition"
                    href={`/rifas/${r.id}`}
                  >
                    Comprar
                  </Link>
                  <Link
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    href="/ganadores"
                  >
                    Ganadores
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-gray-600">
              No hay rifas para mostrar.
            </div>
          )}
        </div>
      ) : null}
    </main>
  )
}
