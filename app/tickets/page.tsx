"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchMyTickets } from "@/lib/api"
import { getAuthToken } from "@/lib/session"

export default function TicketsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/tickets")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchMyTickets()
        if (!mounted) return
        setItems(Array.isArray(data) ? (data as any) : [])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudieron cargar tus tickets.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Mis Tickets</h1>
      <p className="text-white/70 mb-6">Tickets asociados a tu cuenta.</p>

      {loading ? <p className="text-white/70">Cargando…</p> : null}
      {error ? (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }}
        >
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-3">
          {items.length ? (
            items.map((t, idx) => (
              <div
                key={String((t as any)?.id ?? idx)}
                className="rounded-xl border px-4 py-4"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}
              >
                <div className="text-white font-semibold">Ticket #{String((t as any)?.id ?? idx + 1)}</div>
                <div className="text-white/70 text-sm">Rifa: {String((t as any)?.raffleTitle ?? (t as any)?.raffle?.title ?? "-")}</div>
                <div className="text-white/70 text-sm">Estado: {String((t as any)?.status ?? "-")}</div>
              </div>
            ))
          ) : (
            <div className="text-white/70">Aún no tienes tickets.</div>
          )}
        </div>
      ) : null}

      <div className="mt-8 flex gap-3">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/rifas">
          Ir a Rifas
        </Link>
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/wallet">
          Ver Wallet
        </Link>
      </div>
    </main>
  )
}