"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminSettings, updateSuperadminTechSupport } from "@/lib/api"
import { Headset, RefreshCw, Save } from "lucide-react"

type Settings = {
  techSupport?: Record<string, unknown>
}

type TechSupportForm = {
  phone: string
  email: string
}

const normalizeTechSupportFromServer = (techSupport: unknown): TechSupportForm => {
  const safe: any = techSupport && typeof techSupport === "object" ? techSupport : {}
  return {
    phone: typeof safe.phone === "string" ? safe.phone : "",
    email: typeof safe.email === "string" ? safe.email : "",
  }
}

export default function SuperadminSupportPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState<TechSupportForm>({ phone: "", email: "" })
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; email?: string }>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    setFieldErrors({})
    try {
      const s = await fetchSuperadminSettings()
      setSettings(s)
      setForm(normalizeTechSupportFromServer((s as any)?.techSupport))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar soporte técnico.")
      setSettings(null)
      setForm({ phone: "", email: "" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isValid = useMemo(() => {
    const phoneOk = !!form.phone.trim()
    const emailOk = !!form.email.trim()
    return phoneOk && emailOk
  }, [form])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const nextErrors: { phone?: string; email?: string } = {}
      if (!form.phone.trim()) nextErrors.phone = "* Requerido"
      if (!form.email.trim()) nextErrors.email = "* Requerido"
      setFieldErrors(nextErrors)
      if (Object.keys(nextErrors).length) throw new Error("Completa los campos requeridos.")

      await updateSuperadminTechSupport({ phone: form.phone.trim(), email: form.email.trim() })
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
                disabled={saving || loading || !isValid}
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
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="phone">WhatsApp Soporte</label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+58 412 1234567"
                  className={`mt-2 w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 ${
                    fieldErrors.phone ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {fieldErrors.phone ? <p className="mt-2 text-xs text-red-200">{fieldErrors.phone}</p> : null}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="email">Email Soporte</label>
                <input
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="soporte@app.com"
                  className={`mt-2 w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 ${
                    fieldErrors.email ? "border-red-500" : "border-slate-800"
                  }`}
                />
                {fieldErrors.email ? <p className="mt-2 text-xs text-red-200">{fieldErrors.email}</p> : null}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Vista actual (desde backend)</p>
                <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify((settings as any)?.techSupport ?? {}, null, 2)}</pre>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
