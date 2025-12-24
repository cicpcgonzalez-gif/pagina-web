"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminSettings, updateSuperadminModules } from "@/lib/api"
import { Crown, Save, Settings2 } from "lucide-react"

type Settings = {
  branding?: Record<string, unknown>
  modules?: Record<string, unknown>
  company?: Record<string, unknown>
}

export default function SuperadminModulesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [modulesDraft, setModulesDraft] = useState<Record<string, unknown>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const s = await fetchSuperadminSettings()
      setSettings(s)
      const mods = (s as any)?.modules
      setModulesDraft(mods && typeof mods === "object" ? { ...(mods as any) } : {})
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los ajustes.")
      setSettings(null)
      setModulesDraft({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const moduleKeys = useMemo(() => {
    const keys = Object.keys(modulesDraft || {})
    keys.sort((a, b) => a.localeCompare(b))
    return keys
  }, [modulesDraft])

  const toggle = (key: string) => {
    setModulesDraft((prev) => {
      const cur = !!(prev as any)?.[key]
      return { ...prev, [key]: !cur }
    })
  }

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await updateSuperadminModules(modulesDraft)
      setMessage("Módulos actualizados")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los módulos.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/modules" title="Módulos">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">MÓDULOS</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Crown className="h-4 w-4" /> Superadmin
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Activar/ocultar módulos</h2>
            <p className="mt-2 text-slate-200 text-sm">Controla lo que ve cada rol en la app y la web.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-500 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}
              </button>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
                Volver
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            {loading ? <p className="text-sm text-slate-300">Cargando…</p> : null}
            {error ? <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
            {message ? <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

            {!loading ? (
              moduleKeys.length ? (
                <div className="grid gap-2">
                  {moduleKeys.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggle(k)}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-white">{k}</span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          (modulesDraft as any)?.[k] ? "bg-amber-400/15 text-amber-300" : "bg-white/10 text-slate-300"
                        }`}
                      >
                        <Settings2 className="h-4 w-4" /> {(modulesDraft as any)?.[k] ? "ON" : "OFF"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">No hay módulos configurados.</div>
              )
            ) : null}
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
