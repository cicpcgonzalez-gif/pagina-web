"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, getUserRole } from "@/lib/session"

export default function SuperadminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/superadmin")}`)
      return
    }

    const role = String(getUserRole() || "").toLowerCase()
    setAuthorized(role === "superadmin")
    setReady(true)
  }, [router])

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
        <p className="text-white/70 mb-6">Tu cuenta no tiene permisos de Superadmin.</p>
        <div className="flex gap-3">
          <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/">
            Ir al inicio
          </Link>
          <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/login">
            Cambiar cuenta
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-3">Panel Superadmin</h1>
      <p className="text-white/70">Acceso correcto. Aquí irá el panel de control.</p>
    </main>
  )
}

