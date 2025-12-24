"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchAdminSecurityCode, regenerateAdminSecurityCode } from "@/lib/api"
import { KeyRound } from "lucide-react"

export default function AdminSecurityCodePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [active, setActive] = useState<boolean | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminSecurityCode()
      setCode((res as any)?.code ? String((res as any).code) : null)
      setActive(typeof (res as any)?.active === "boolean" ? (res as any).active : null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el código.")
      setCode(null)
      setActive(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onRegenerate = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await regenerateAdminSecurityCode()
      setCode((res as any)?.code ? String((res as any).code) : null)
      setActive(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo regenerar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/security" title="Código de seguridad">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">CÓD. SEGURIDAD</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <KeyRound className="h-4 w-4" /> Seguridad
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Código de seguridad</h2>
            <p className="mt-2 text-slate-200 text-sm">Endpoint: <span className="font-semibold">/admin/security-code</span></p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
              <button
                type="button"
                onClick={onRegenerate}
                disabled={saving}
                className="rounded-full px-5 py-3 bg-amber-400 hover:bg-amber-300 transition font-extrabold text-slate-900 disabled:opacity-60"
              >
                {saving ? "Regenerando..." : "Regenerar"}
              </button>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          {error ? (
            <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
          ) : null}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Código actual</p>
            <p className="mt-2 text-2xl font-extrabold text-white">{code || "—"}</p>
            <p className="mt-1 text-xs text-slate-300">Estado: {active === null ? "—" : active ? "Activo" : "Inactivo"}</p>
          </div>
        </main>
      </div>
    </RequireRole>
  )
}
