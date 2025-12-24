"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminSettings, fetchTechSupportSettings, updateSuperadminTechSupport } from "@/lib/api"
import { Headset, RefreshCw, Save } from "lucide-react"

type Settings = {
  techSupport?: Record<string, unknown>
}

export default function SuperadminSupportPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [publicSettings, setPublicSettings] = useState<Record<string, unknown> | null>(null)
  const [draftText, setDraftText] = useState("{}")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const [s, pub] = await Promise.all([fetchSuperadminSettings(), fetchTechSupportSettings()])
      setSettings(s)
      setPublicSettings(pub)
      const t = (s as any)?.techSupport
      setDraftText(JSON.stringify(t && typeof t === "object" ? t : {}, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar soporte técnico.")
      setSettings(null)
      setPublicSettings(null)
      setDraftText("{}")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const parsedDraft = useMemo(() => {
    try {
      const v = JSON.parse(draftText)
      if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false as const, error: "El JSON debe ser un objeto." }
      return { ok: true as const, value: v as Record<string, unknown> }
    } catch {
      return { ok: false as const, error: "JSON inválido." }
    }
  }, [draftText])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      if (!parsedDraft.ok) throw new Error(parsedDraft.error)
      await updateSuperadminTechSupport(parsedDraft.value)
      setMessage("Soporte técnico actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar soporte técnico.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/support" title="Soporte técnico">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">SOPORTE TÉCNICO</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Headset className="h-4 w-4" /> Superadmin
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Soporte técnico</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/settings/tech-support</span> (PATCH) y <span className="font-semibold">/settings/tech-support</span> (GET público).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={saving || loading || !parsedDraft.ok}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-500 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white hover:bg-white/15 transition disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" /> {loading ? "Cargando..." : "Actualizar"}
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
            {!parsedDraft.ok ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/20 px-4 py-3 text-sm text-red-100">{parsedDraft.error}</div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Tech support (JSON)</p>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={12}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 font-mono text-xs text-white outline-none focus:border-purple-500"
                  spellCheck={false}
                />
                <p className="mt-2 text-xs text-slate-400">Se envía tal cual en el body del PATCH.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Vista actual (superadmin)</p>
                <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify((settings as any)?.techSupport ?? {}, null, 2)}</pre>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Vista pública</p>
                <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify(publicSettings ?? {}, null, 2)}</pre>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
