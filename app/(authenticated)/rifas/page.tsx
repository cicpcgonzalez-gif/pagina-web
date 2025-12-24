"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { fetchRaffles } from "@/lib/api"
import { Sparkles, RefreshCw, Search, MoreHorizontal, ThumbsUp, Heart, Send } from "lucide-react"
import WinnersTicker from "../../_components/WinnersTicker"

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
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"todas" | "cierre" | "precio">("todas")

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
    const normalized = query.trim().toLowerCase()
    let filtered = [...items]

    if (normalized) {
      filtered = filtered.filter((r) => r.title?.toLowerCase().includes(normalized))
    }

    if (filter === "cierre") {
      filtered = filtered.sort((a, b) => Number(new Date(a.drawDate)) - Number(new Date(b.drawDate)))
    } else if (filter === "precio") {
      filtered = filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    }

    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-inner shadow-black/20 animate-pulse">
              <div className="h-40 w-full rounded-xl bg-slate-800" />
              <div className="mt-4 h-4 w-3/4 rounded bg-slate-800" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-800" />
              <div className="mt-4 h-10 w-full rounded-lg bg-slate-800" />
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
    }

    if (!filtered.length) {
      return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-8 text-center text-slate-100 shadow-inner shadow-black/20">
          No hay rifas disponibles en este momento.
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {filtered.map((r) => {
          const sold = Math.max(0, r.ticketsTotal - r.ticketsAvailable)
          const percent = r.ticketsTotal > 0 ? Math.min(100, Math.round((sold / r.ticketsTotal) * 100)) : 0
          const soldOut = r.ticketsAvailable <= 0 || r.status?.toLowerCase() === "closed"

          return (
            <div
              key={r.id}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/30 ring-1 ring-slate-800/60"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px] shadow-lg shadow-purple-500/20">
                    <div className="h-full w-full rounded-full bg-slate-900 grid place-items-center text-xs font-bold text-white">
                      MR
                    </div>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-white">Super Admin</p>
                    <p className="text-xs text-slate-300">ID: {r.id}</p>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-slate-300" />
              </div>

              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                <img
                  src={r.imageUrl || "/images/raffle-placeholder.jpg"}
                  alt={r.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/65" />

                <div className="absolute left-4 top-4 rounded-full bg-purple-600/90 px-3 py-1 text-[11px] font-semibold text-white shadow">
                  {r.status || "Activa"}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-900 shadow">
                  {currency.format(Number(r.price || 0))}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end p-4">
                  <div className="w-full rounded-2xl bg-slate-950/85 px-4 py-3 shadow-lg ring-1 ring-white/10 backdrop-blur">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">{r.title}</h3>
                      <span className="text-xs text-slate-300">{new Date(r.drawDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-4 py-4">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{Math.max(sold, 1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                    </div>
                  </div>
                  <Link
                    href={`/rifas/${r.id}`}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow-md shadow-purple-500/20 ${
                      soldOut
                        ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-500"
                    }`}
                    aria-disabled={soldOut}
                  >
                    {soldOut ? "Agotado" : "Participar ahora"}
                  </Link>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="font-semibold text-white">Rifas {r.title || "Activa"}</div>
                  <span className="text-xs text-slate-300">{percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${percent}%` }} />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-200">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-300">Bs.</div>
                    <div className="text-lg font-bold text-amber-300">{Number(r.price || 0).toFixed(2)}</div>
                  </div>
                  <div className="text-right text-xs text-slate-300">
                    Vendidos: {sold}
                    <br /> Disponibles: {r.ticketsAvailable}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [loading, error, items])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pb-24">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">MEGA RIFAS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6">
        {/* Hero card */}
        <section className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Sparkles className="h-4 w-4" /> Sorteos Activos
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-800/80 p-2 text-slate-200 hover:bg-slate-700 transition"
              aria-label="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight text-white">Tu oportunidad de ganar hoy.</h2>
          <p className="mt-2 text-slate-200 text-sm">
            Participa en los sorteos más exclusivos con total seguridad.
          </p>
          <Link href="/ganadores" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-300">
            <span>Cómo participar</span>
          </Link>
        </section>

        {/* Winners ticker */}
        <WinnersTicker />

        {/* Search and filters */}
        <section className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar rifas..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "todas", label: "Todas" },
              { key: "cierre", label: "Próximas a cerrar" },
              { key: "precio", label: "Menor precio" },
            ].map((f) => {
              const active = filter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${
                    active
                      ? "border-purple-400 bg-purple-900/60 text-purple-100 shadow-inner shadow-purple-900/30"
                      : "border-slate-800 bg-slate-900/60 text-slate-200 hover:border-purple-500/60"
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Feed */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-white">Novedades</h3>
          {content}
        </section>

        {/* Motivational message */}
        <section className="rounded-2xl border border-purple-500/30 bg-slate-900/80 px-4 py-4 text-center text-slate-100 shadow-inner shadow-purple-900/20">
          <p className="text-lg font-bold text-white">Cada boleto es una oportunidad</p>
          <p className="text-sm text-slate-300 mt-1">Asegura tus números y participa antes de que cierre el sorteo.</p>
        </section>

        {/* Sponsors */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4 text-slate-200">
          <p className="text-sm font-semibold mb-3 text-purple-200">Patrocinadores</p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-slate-800 px-3 py-1">MegaPlay</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">Seguros Plus</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">PagosFlash</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">TechNova</span>
          </div>
        </section>
      </main>
    </div>
  )
}
