"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchMyRaffles } from "@/lib/api"
import { getAuthToken } from "@/lib/session"
import type { MyRaffle } from "@/lib/types"
import { Archive, Ticket as TicketIcon, Trash2 } from "lucide-react"

type TicketLike = {
  id?: string | number
  raffleId?: string
  raffleTitle?: string
  status?: string
  serial?: string
  numbers?: Array<string | number>
}

const ARCHIVED_KEY = "archived_tickets_v1"
const HIDDEN_KEY = "hidden_ticket_raffle_ids_v1"

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default function TicketsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<MyRaffle[]>([])
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [archived, setArchived] = useState<TicketLike[]>([])
  const [hiddenRaffleIds, setHiddenRaffleIds] = useState<string[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    setArchived(safeJsonParse<TicketLike[]>(localStorage.getItem(ARCHIVED_KEY), []))
    setHiddenRaffleIds(safeJsonParse<string[]>(localStorage.getItem(HIDDEN_KEY), []))
  }, [])

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

        // Guardamos "cerrados" localmente para la vista Archivo (similar a la app).
        if (typeof window !== "undefined" && Array.isArray(data)) {
          const mapped: TicketLike[] = (data as any[]).map((t: any) => {
            const raffleId = t?.raffle?.id != null ? String(t.raffle.id) : t?.raffleId != null ? String(t.raffleId) : undefined
            const numbers = Array.isArray(t?.numbers)
              ? (t.numbers as any[]).filter((n) => n !== null && n !== undefined)
              : t?.numbers != null
                ? [t.numbers]
                : []
            return {
              id: t?.id,
              raffleId,
              raffleTitle: t?.raffle?.title,
              status: t?.status,
              serial: t?.serialNumber,
              numbers,
            }
          })

          const closed = mapped.filter((t) => String(t.status || "").toLowerCase() === "closed")
          if (closed.length) {
            const existing = safeJsonParse<TicketLike[]>(localStorage.getItem(ARCHIVED_KEY), [])
            const merged = [...closed, ...existing].slice(0, 200)
            localStorage.setItem(ARCHIVED_KEY, JSON.stringify(merged))
            setArchived(merged)
          }
        }
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

  const normalized = useMemo<TicketLike[]>(() => {
    return items.map((t: any) => {
      const raffleId = t?.raffle?.id != null ? String(t.raffle.id) : t?.raffleId != null ? String(t.raffleId) : undefined
      const raffleTitle = t?.raffle?.title || "Rifa"
      const status = String(t?.status ?? "").trim() || "activo"
      const serial = t?.serialNumber
      const numbers = Array.isArray(t?.numbers)
        ? (t.numbers as any[]).filter((n) => n !== null && n !== undefined)
        : t?.numbers != null
          ? [t.numbers]
          : []
      return {
        id: t?.id,
        raffleId,
        raffleTitle,
        status,
        serial,
        numbers,
      }
    })
  }, [items])

  const visibleItems = useMemo(() => {
    if (!hiddenRaffleIds.length) return normalized
    return normalized.filter((t) => !t.raffleId || !hiddenRaffleIds.includes(String(t.raffleId)))
  }, [hiddenRaffleIds, normalized])

  const canHide = (t: TicketLike) => String(t.status || "").toLowerCase() === "closed" && Boolean(t.raffleId)

  const hideTicket = (t: TicketLike) => {
    if (!t.raffleId || typeof window === "undefined") return
    const next = Array.from(new Set([...hiddenRaffleIds, String(t.raffleId)]))
    setHiddenRaffleIds(next)
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(next))
  }

  const removeArchived = (idx: number) => {
    if (typeof window === "undefined") return
    const next = archived.filter((_, i) => i !== idx)
    setArchived(next)
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(next))
  }

  const clearArchived = () => {
    if (typeof window === "undefined") return
    setArchived([])
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify([]))
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="relative text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">MIS TICKETS</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />

            <button
              type="button"
              onClick={() => setArchivedOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
            >
              <Archive className="h-4 w-4" />
              Cerrados
            </button>
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
            {visibleItems.length ? (
              <div className="grid gap-4">
                {visibleItems.map((t, idx) => {
                  const id = t.id ?? idx + 1
                  const raffleTitle = t.raffleTitle || "Rifa"
                  const status = String(t.status ?? "").trim() || "activo"
                  const serial = t.serial
                  const numbers = (t.numbers || []).map((n) => String(n))
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

                      <div className="mt-4 flex flex-wrap gap-2">
                        {t.raffleId ? (
                          <Link
                            href={`/rifas/${t.raffleId}`}
                            className="inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                          >
                            Ver detalles
                          </Link>
                        ) : null}

                        {canHide(t) ? (
                          <button
                            type="button"
                            onClick={() => hideTicket(t)}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-8 text-center text-slate-200 space-y-3">
                <p>Aún no tienes tickets.</p>
                <Link
                  href="/rifas"
                  className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500"
                >
                  Explorar Rifas
                </Link>
              </div>
            )}
          </section>
        ) : null}
      </main>

      {archivedOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Cerrados</h2>
              <button
                type="button"
                onClick={() => setArchivedOpen(false)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-400">Historial local de tickets cerrados.</p>

            <div className="mt-4 max-h-[60vh] overflow-auto space-y-3">
              {archived.length ? (
                archived.map((t, i) => (
                  <div key={String(t.raffleId ?? i)} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{t.raffleTitle ?? "Rifa"}</p>
                        <p className="text-xs text-slate-400">Estado: {String(t.status ?? "-")}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArchived(i)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                      >
                        <Trash2 className="h-4 w-4" />
                        Quitar
                      </button>
                    </div>
                    {t.numbers?.length ? (
                      <div className="mt-2 text-xs text-slate-300">Números: {t.numbers.map((n) => String(n)).join(", ")}</div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-center text-slate-200">
                  No hay tickets cerrados archivados.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={clearArchived}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                <Trash2 className="h-4 w-4" />
                Borrar todo
              </button>
              <button
                type="button"
                onClick={() => setArchivedOpen(false)}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}