"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchWinners } from "@/lib/api"
import type { Winner } from "@/lib/types"
import WinnersTicker from "../../_components/WinnersTicker"
import { Trophy } from "lucide-react"

export default function GanadoresPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Winner[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchWinners()
        if (!mounted) return
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudieron cargar los ganadores.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">GANADORES</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
            <Trophy className="h-4 w-4" /> Historias reales
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Ellos ya ganaron.</h2>
          <p className="mt-2 text-slate-200 text-sm">Mira ganadores recientes y sus premios.</p>
        </section>

        <WinnersTicker />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div key={k} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
                <div className="h-4 w-1/2 rounded bg-slate-800" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-800" />
                <div className="mt-4 h-10 w-full rounded-xl bg-slate-800" />
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
        ) : null}

        {!loading && !error ? (
          <section className="space-y-3">
            {items.length ? (
              <div className="grid gap-4">
                {items.map((w, idx) => (
                  <article
                    key={String(w.id ?? idx)}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 p-0.5">
                        <div className="h-full w-full rounded-full bg-slate-950 grid place-items-center text-sm font-bold text-white">
                          {w.user?.name?.charAt(0)?.toUpperCase() ?? "G"}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{w.user?.name ?? "Ganador"}</p>
                        <p className="text-xs text-slate-300 truncate">{w.raffle?.title ?? "Rifa"}</p>
                        <p className="mt-1 inline-flex rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                          {w.prize ?? "Premio"}
                        </p>
                      </div>
                      <div className="ml-auto text-right text-xs text-slate-400">
                        {w.drawDate ? new Date(w.drawDate).toLocaleDateString() : null}
                      </div>
                    </div>

                    {w.testimonial ? (
                      <p className="mt-3 text-sm text-slate-200">“{w.testimonial}”</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-slate-200">
                Aún no hay ganadores para mostrar.
              </div>
            )}
          </section>
        ) : null}

        <div className="flex gap-3">
          <Link className="rounded-full px-5 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-500 transition" href="/rifas">
            Ver rifas
          </Link>
          <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/perfil">
            Mi perfil
          </Link>
        </div>
      </main>
    </div>
  )
}
