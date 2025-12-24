"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchWinners } from "@/lib/api"

export default function GanadoresPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Ganadores</h1>
      <p className="text-white/70 mb-6">Listado público de ganadores.</p>

      {loading ? <p className="text-white/70">Cargando…</p> : null}
      {error ? (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }}>
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-3">
          {items.length ? (
            items.map((w, idx) => (
              <div key={String((w as any)?.id ?? idx)} className="rounded-xl border px-4 py-4" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}>
                <div className="text-white font-semibold">{String((w as any)?.name ?? (w as any)?.winnerName ?? "Ganador")}</div>
                <div className="text-white/70 text-sm">
                  Premio: {String((w as any)?.prize ?? (w as any)?.reward ?? (w as any)?.raffleTitle ?? "-")}
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/70">Aún no hay ganadores para mostrar.</div>
          )}
        </div>
      ) : null}

      <div className="mt-8">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/rifas">
          Ir a Rifas
        </Link>
      </div>
    </main>
  )
}
