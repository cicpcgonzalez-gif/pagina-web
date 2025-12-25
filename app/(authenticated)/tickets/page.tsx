"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchMyRaffles } from "@/lib/api"
import { getAuthToken } from "@/lib/session"
import type { MyRaffle } from "@/lib/types"
import { Ticket as TicketIcon } from "lucide-react"

export default function TicketsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MyRaffle[]>([])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/tickets")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchMyRaffles()
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
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">MIS TICKETS</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
            <TicketIcon className="h-4 w-4" /> Tus boletos
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Aquí están tus participaciones.</h2>
          <p className="mt-2 text-slate-200 text-sm">Revisa el estado y la rifa asociada.</p>
        </section>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div key={k} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-slate-800" />
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
                {items.map((t, idx) => {
                  const id = t.id ?? idx + 1
                  const raffleTitle = (t as any)?.raffle?.title || "Rifa"
                  const status = String((t as any)?.status ?? "").trim() || "activo"
                  const serial = (t as any)?.serialNumber
                  const numbers = Array.isArray((t as any)?.numbers)
                    ? ((t as any).numbers as any[]).filter((n) => n !== null && n !== undefined)
                    : (t as any)?.numbers != null
                      ? [String((t as any).numbers)]
                      : []
                  return (
                    <article key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">Ticket #{String(id)}</p>
                          <p className="text-xs text-slate-300">{String(raffleTitle)}</p>
                        </div>
                        <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                          {status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                          <p className="text-xs text-slate-400">Números</p>
                          <p className="text-xs font-semibold text-slate-100 wrap-break-word">
                            {numbers.length ? numbers.slice(0, 20).join(" ") : "—"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                          <p className="text-xs text-slate-400">Serial</p>
                          <p className="text-xs font-semibold text-slate-100 break-all">{serial ?? "—"}</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-slate-200">
                Aún no tienes tickets.
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  )
}