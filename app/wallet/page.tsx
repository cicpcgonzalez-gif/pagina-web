"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchWallet } from "@/lib/api"
import { getAuthToken } from "@/lib/session"

export default function WalletPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
      <p className="text-white/70 mb-6">Balance y movimientos de tu cuenta.</p>

      {loading ? <p className="text-white/70">Cargando…</p> : null}
      {error ? (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }}>
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="rounded-2xl border px-5 py-5" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}>
          <div className="text-white/70 text-sm">Balance</div>
          <div className="text-white text-3xl font-bold">{balance ?? 0}</div>
        </div>
      ) : null}

      <div className="mt-8 flex gap-3">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/tickets">
          Ver Tickets
        </Link>
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/perfil">
          Ir a Perfil
        </Link>
      </div>
    </main>
  )
}
