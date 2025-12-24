"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../_components/RequireRole"
import { fetchAllUsers, superadminResetPasswordByEmail, superadminUpdateUserStatus } from "@/lib/api"
import { KeyRound, RefreshCw, Users } from "lucide-react"

type UserRow = {
  id?: string | number
  name?: string
  email?: string
  phone?: string
  role?: string
  state?: string
  status?: string
  createdAt?: string
}

export default function UsuariosPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [items, setItems] = useState<UserRow[]>([])
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const list = await fetchAllUsers()
      setItems(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar usuarios.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((u) => {
      const name = String(u.name || "").toLowerCase()
      const email = String(u.email || "").toLowerCase()
      const role = String(u.role || "").toLowerCase()
      return name.includes(q) || email.includes(q) || role.includes(q)
    })
  }, [items, search])

  const setStatus = async (userId: string | number | undefined, status: string) => {
    if (!userId) return
    setError(null)
    setMessage(null)
    try {
      await superadminUpdateUserStatus(userId, status)
      setMessage("Estado actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar el estado.")
    }
  }

  const resetByEmail = async (email: string | undefined) => {
    if (!email) return
    setError(null)
    setMessage(null)
    try {
      const r = await superadminResetPasswordByEmail(email)
      const msg = (r as any)?.message || "Reset enviado"
      setMessage(msg)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo resetear contraseña.")
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/usuarios" title="Usuarios">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">USUARIOS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Users className="h-4 w-4" /> Gestión
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Control de usuarios.</h2>
            <p className="mt-2 text-slate-200 text-sm">Cambiar estado y resetear contraseña.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
                Volver
              </Link>
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 transition"
              >
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-white">Listado</h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o rol..."
                className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>

            {loading ? <p className="mt-4 text-sm text-slate-300">Cargando…</p> : null}
            {error ? <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
            {message ? <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

            {!loading ? (
              visible.length ? (
                <div className="mt-4 grid gap-3">
                  {visible.slice(0, 80).map((u) => {
                    const role = String(u.role || "usuario").toLowerCase()
                    const state = String(u.state || u.status || "").toLowerCase()
                    const email = u.email || ""
                    return (
                      <div key={String(u.id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{u.name || email || "Usuario"}</p>
                            <p className="text-xs text-slate-300 truncate">{email}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-purple-500/15 px-3 py-1 font-semibold text-purple-200">{role}</span>
                              {state ? <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-slate-200">{state}</span> : null}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              type="button"
                              onClick={() => resetByEmail(email)}
                              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition"
                            >
                              <KeyRound className="h-4 w-4" /> Reset pass
                            </button>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setStatus(u.id, "active")}
                                className="rounded-full bg-amber-400 px-3 py-2 text-xs font-extrabold text-slate-900 hover:bg-amber-300 transition"
                              >
                                Activar
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatus(u.id, "suspended")}
                                className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition"
                              >
                                Suspender
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {visible.length > 80 ? (
                    <div className="text-xs text-slate-400">Mostrando 80 de {visible.length}. Refina la búsqueda para ver más.</div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">
                  No hay usuarios para mostrar.
                </div>
              )
            ) : null}
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
