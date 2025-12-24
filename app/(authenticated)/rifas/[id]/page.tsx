"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchRaffle, initiatePayment, purchaseTickets } from "@/lib/api"
import type { Raffle } from "@/lib/types"
import { ArrowLeft, CreditCard, Sparkles, Ticket, Wallet } from "lucide-react"

const currency = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

export default function RifaDetallePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [raffle, setRaffle] = useState<Raffle | null>(null)

  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setMessage(null)

    ;(async () => {
      try {
        if (!id) throw new Error("Rifa inválida")
        const data = await fetchRaffle(id)
        if (!mounted) return
        setRaffle(data as any)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudo cargar la rifa.")
        setRaffle(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id])

  const remaining = useMemo(() => {
    if (!raffle) return null
    const a = (raffle as any)?.ticketsAvailable
    const b = (raffle as any)?.stats?.remaining
    const val = typeof b === "number" ? b : typeof a === "number" ? a : null
    return val
  }, [raffle])

  const onPay = async () => {
    if (!raffle) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const raffleId = Number((raffle as any)?.id)
      if (!Number.isFinite(raffleId)) {
        throw new Error("ID de rifa inválido")
      }

      const result = await initiatePayment({ raffleId, quantity: qty })
      const url = (result as any)?.paymentUrl
      if (url) {
        window.location.href = url
        return
      }

      // Fallback: compra directa
      await purchaseTickets(raffleId, qty)
      setMessage("Compra realizada. Revisa tus tickets.")
      router.push("/tickets")
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar el pago.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/rifas"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-lg font-extrabold text-white">DETALLE</h1>
            </div>
            <div className="w-[92px]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        {loading ? (
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 animate-pulse">
              <div className="h-5 w-1/2 rounded bg-slate-800" />
              <div className="mt-3 h-3 w-2/3 rounded bg-slate-800" />
              <div className="mt-5 h-40 w-full rounded-2xl bg-slate-800" />
            </div>
          </div>
        ) : null}

        {error ? <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {message ? <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

        {!loading && !error && raffle ? (
          <>
            <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
                <Sparkles className="h-4 w-4" /> Rifa
              </div>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">{(raffle as any)?.title || "Rifa"}</h2>
              <p className="mt-2 text-slate-200 text-sm">{(raffle as any)?.description || "Participa y gana con Mega Rifas."}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">Precio por ticket</p>
                  <p className="mt-1 text-lg font-extrabold text-amber-200">{currency.format(Number((raffle as any)?.price || 0))}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">Disponibles</p>
                  <p className="mt-1 text-lg font-extrabold text-white">{remaining ?? "—"}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs text-slate-400">Cierre</p>
                  <p className="mt-1 text-sm font-semibold text-white">{String((raffle as any)?.drawDate || "Por definir")}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <h3 className="text-lg font-bold text-white">Participar</h3>
              <p className="mt-1 text-sm text-slate-200">Elige cantidad y continúa con el pago.</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Cantidad</label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold hover:bg-white/15 transition"
                    >
                      -
                    </button>
                    <input
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(50, Number(e.target.value || 1))))}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(50, q + 1))}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold hover:bg-white/15 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onPay}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-4 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
                >
                  <CreditCard className="h-4 w-4" /> {busy ? "Procesando..." : "Participar ahora"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Ticket className="h-4 w-4" /> Tickets a tu cuenta</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Wallet className="h-4 w-4" /> Pago según proveedor</span>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}
