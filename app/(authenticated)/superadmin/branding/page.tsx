"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminSettings, updateSuperadminBranding } from "@/lib/api"
import { Palette, RefreshCw, Save } from "lucide-react"

type Settings = {
  branding?: Record<string, unknown>
}

type BrandingForm = {
  title: string
  tagline: string
  primaryColor: string
}

const normalizeBrandingFromServer = (branding: unknown): BrandingForm => {
  const safe: any = branding && typeof branding === "object" ? branding : {}
  return {
    title: typeof safe.title === "string" ? safe.title : "",
    tagline: typeof safe.tagline === "string" ? safe.tagline : "",
    primaryColor: typeof safe.primaryColor === "string" ? safe.primaryColor : "",
  }
}

export default function SuperadminBrandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  const [form, setForm] = useState<BrandingForm>({ title: "", tagline: "", primaryColor: "" })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const s = await fetchSuperadminSettings()
      setSettings(s)
      setForm(normalizeBrandingFromServer((s as any)?.branding))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar branding.")
      setSettings(null)
      setForm({ title: "", tagline: "", primaryColor: "" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await updateSuperadminBranding({
        title: form.title,
        tagline: form.tagline,
        primaryColor: form.primaryColor,
      })
      setMessage("Branding actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar branding.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/branding" title="Branding">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">BRANDING</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Palette className="h-4 w-4" /> Marca
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Branding</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/settings</span> (leer) y <span className="font-semibold">/superadmin/settings/branding</span> (PATCH).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSave}
                disabled={saving || loading}
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

            <div className="mt-4 grid gap-3">
              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="title">Nombre de la App</label>
                  <input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="tagline">Slogan</label>
                  <input
                    id="tagline"
                    value={form.tagline}
                    onChange={(e) => setForm((s) => ({ ...s, tagline: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="primaryColor">Color Primario</label>
                  <input
                    id="primaryColor"
                    value={form.primaryColor}
                    onChange={(e) => setForm((s) => ({ ...s, primaryColor: e.target.value }))}
                    placeholder="#2563eb"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Vista actual (desde backend)</p>
                <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify((settings as any)?.branding ?? {}, null, 2)}</pre>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
