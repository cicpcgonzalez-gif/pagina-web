"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken, getUserRole } from "@/lib/session"

export default function UsuariosPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/usuarios")}`)
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
        <p className="text-white/70 mb-6">Solo Superadmin puede ver Usuarios.</p>
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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Usuarios</h1>
      <p className="text-white/70 mb-6">Ruta activa (Superadmin). Aquí conectamos el listado real de usuarios si lo necesitas.</p>
      <div className="flex gap-3">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/superadmin">
          Volver a Superadmin
        </Link>
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/rifas">
          Ir a Rifas
        </Link>
      </div>
    </main>
  )
}
