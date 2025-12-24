"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { fetchRaffles } from "@/lib/api"

type Raffle = {
  id: string
  title: string
  price: number
  ticketsAvailable: number
  ticketsTotal: number
  drawDate: string
  status: string
  imageUrl?: string
}

const currency = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

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

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
              <div className="h-40 w-full rounded-lg bg-gray-200" />
              <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
    }

    if (!items.length) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-gray-600 shadow-sm">
          No hay rifas disponibles en este momento.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((r) => {
          const sold = Math.max(0, r.ticketsTotal - r.ticketsAvailable)
          const percent = r.ticketsTotal > 0 ? Math.min(100, Math.round((sold / r.ticketsTotal) * 100)) : 0
          const soldOut = r.ticketsAvailable <= 0 || r.status?.toLowerCase() === "closed"

          return (
            <div key={r.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
                <img
                  src={r.imageUrl || "/images/raffle-placeholder.jpg"}
                  alt={r.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow">
                  {r.status || "Activa"}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                  {currency.format(Number(r.price || 0))}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end p-4">
                  <div className="w-full rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-gray-900">{r.title}</h3>
                      <span className="text-xs text-gray-600">Sorteo: {new Date(r.drawDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{sold} vendidos</span>
                  <span>{r.ticketsAvailable} disponibles</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/rifas/${r.id}`}
                    className={`rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
                      soldOut
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    aria-disabled={soldOut}
                  >
                    {soldOut ? "Agotado" : "Comprar"}
                  </Link>
                  <Link
                    href="/ganadores"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Ganadores
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [loading, error, items])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Rifas</p>
            <h1 className="text-xl font-bold text-gray-900">Explora y participa</h1>
          </div>
          <Link
            href="/tickets"
            className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Mis tickets
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4">{content}</main>
    </div>
  )
}
