"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { getAuthToken, getUserRole } from "@/lib/session"

type Props = {
  allow: Array<string>
  nextPath: string
  title?: string
  children: React.ReactNode
}

export default function RequireRole({ allow, nextPath, title, children }: Props) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const allowed = useMemo(() => new Set(allow.map((r) => String(r).toLowerCase())), [allow])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }
    const role = String(getUserRole() || "").toLowerCase()
    setAuthorized(allowed.has(role))
    setReady(true)
  }, [router, nextPath, allowed])

  if (!ready) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-white">Cargando…</h1>
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-3">No autorizado</h1>
        <p className="text-white/70 mb-6">No tienes permisos para ver {title || "esta sección"}.</p>
        <div className="flex gap-3">
          <Link className="rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/rifas">
            Ir a Rifas
          </Link>
          <Link className="rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/login">
            Cambiar cuenta
          </Link>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
