"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchWallet } from "@/lib/api"
import { getAuthToken } from "@/lib/session"
import type { WalletMovement } from "@/lib/types"
import { Wallet as WalletIcon } from "lucide-react"

export default function WalletPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [movements, setMovements] = useState<WalletMovement[]>([])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/wallet")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchWallet()
        if (!mounted) return
        const b = (data as any)?.balance
        setBalance(typeof b === "number" ? b : b ? Number(b) : 0)
        const tx = (data as any)?.transactions
        setMovements(Array.isArray(tx) ? (tx as any) : [])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudo cargar la wallet.")
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
            <h1 className="text-2xl font-extrabold text-white">BILLETERA</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
            <WalletIcon className="h-4 w-4" /> Tu saldo
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Controla tu balance.</h2>
          <p className="mt-2 text-slate-200 text-sm">Consulta saldo y movimientos recientes.</p>
        </section>

        {loading ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
              <div className="h-4 w-1/4 rounded bg-slate-800" />
              <div className="mt-3 h-10 w-1/2 rounded bg-slate-800" />
            </div>
            {[1, 2].map((k) => (
              <div key={k} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
                <div className="h-3 w-2/3 rounded bg-slate-800" />
                <div className="mt-2 h-3 w-1/3 rounded bg-slate-800" />
              </div>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
        ) : null}

        {!loading && !error ? (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
              <p className="text-xs text-slate-400">Balance</p>
              <p className="mt-1 text-4xl font-extrabold text-amber-300">{(balance ?? 0).toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-400">(Monto mostrado según el backend)</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white">Movimientos</h3>
              {movements.length ? (
                <div className="grid gap-3">
                  {movements.map((m, idx) => {
                    const id = m.id ?? idx
                    const amount = typeof m.amount === "number" ? m.amount : m.amount ? Number(m.amount) : 0
                    const type = String(m.type ?? "movimiento")
                    const status = String(m.status ?? "")
                    const when = m.createdAt ? new Date(m.createdAt).toLocaleString() : ""
                    return (
                      <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{type}</p>
                            <p className="text-xs text-slate-400 truncate">{m.reference ? `Ref: ${m.reference}` : when}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-amber-300">{amount.toFixed(2)}</p>
                            {status ? <p className="text-xs text-slate-400">{status}</p> : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-slate-200">
                  No hay movimientos para mostrar.
                </div>
              )}
            </section>
          </>
        ) : null}

        <div className="flex gap-3">
          <Link className="rounded-full px-5 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-500 transition" href="/tickets">
            Ver tickets
          </Link>
          <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/perfil">
            Mi perfil
          </Link>
        </div>
      </main>
    </div>
  )
}
