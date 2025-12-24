"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchProfile } from "@/lib/api"
import { getAuthToken, getUserRole } from "@/lib/session"

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/perfil")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchProfile()
        if (!mounted) return
        setProfile(data as any)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudo cargar tu perfil.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  const role = String(getUserRole() || "").toLowerCase()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Perfil</h1>
      <p className="text-white/70 mb-6">Datos básicos de tu cuenta.</p>

      {loading ? <p className="text-white/70">Cargando…</p> : null}
      {error ? (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }}>
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="rounded-2xl border px-5 py-5" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}>
          <div className="text-white/70 text-sm mb-1">Rol</div>
          <div className="text-white font-semibold">{role || "usuario"}</div>
          <div className="mt-4 text-white/70 text-sm">Perfil (raw)</div>
          <pre className="mt-2 overflow-auto rounded-xl bg-black/20 p-3 text-xs text-white/80">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/rifas">
          Ir a Rifas
        </Link>
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/wallet">
          Wallet
        </Link>
        {role === "superadmin" ? (
          <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/superadmin">
            Superadmin
          </Link>
        ) : null}
        {role === "admin" || role === "organizer" || role === "superadmin" ? (
          <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/admin">
            Admin
          </Link>
        ) : null}
      </div>
    </main>
  )
}
