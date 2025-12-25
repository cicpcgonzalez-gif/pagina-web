"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { fetchSuperadminSettings, updateSuperadminSmtp } from "@/lib/api"
import { Mail, RefreshCw, Save } from "lucide-react"

type Settings = {
  smtp?: Record<string, unknown>
}

type SmtpForm = {
  host: string
  port: string
  user: string
  pass: string
  secure: boolean
  fromName: string
  fromEmail: string
}

const normalizeBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value.toLowerCase() === "true"
  if (typeof value === "number") return value === 1
  return false
}

const normalizeSmtpFromServer = (smtp: unknown): SmtpForm => {
  const safe: any = smtp && typeof smtp === "object" ? smtp : {}
  const portNumber = Number(safe.port)
  return {
    host: typeof safe.host === "string" ? safe.host : "",
    port: Number.isFinite(portNumber) && portNumber > 0 ? String(portNumber) : "587",
    user: typeof safe.user === "string" ? safe.user : "",
    pass: typeof safe.pass === "string" ? safe.pass : "",
    secure: normalizeBoolean(safe.secure),
    fromName: typeof safe.fromName === "string" ? safe.fromName : "",
    fromEmail: typeof safe.fromEmail === "string" ? safe.fromEmail : "",
  }
}

export default function SuperadminSmtpPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  const [form, setForm] = useState<SmtpForm>({ host: "", port: "587", user: "", pass: "", secure: false, fromName: "", fromEmail: "" })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const s = await fetchSuperadminSettings()
      setSettings(s)
      setForm(normalizeSmtpFromServer((s as any)?.smtp))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la configuración SMTP.")
      setSettings(null)
      setForm({ host: "", port: "587", user: "", pass: "", secure: false, fromName: "", fromEmail: "" })
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
      await updateSuperadminSmtp({
        host: form.host,
        port: Number(form.port),
        user: form.user,
        pass: form.pass,
        secure: form.secure,
        fromName: form.fromName,
        fromEmail: form.fromEmail,
      })
      setMessage("SMTP actualizado")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar SMTP.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/smtp" title="Correo SMTP">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">CORREO SMTP</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Mail className="h-4 w-4" /> Config
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Configuración SMTP</h2>
            <p className="mt-2 text-slate-200 text-sm">Conectado a <span className="font-semibold">/superadmin/settings</span> (leer) y <span className="font-semibold">/superadmin/settings/smtp</span> (PATCH).</p>
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="host">Host</label>
                  <input
                    id="host"
                    value={form.host}
                    onChange={(e) => setForm((s) => ({ ...s, host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="port">Puerto</label>
                  <input
                    id="port"
                    inputMode="numeric"
                    value={form.port}
                    onChange={(e) => setForm((s) => ({ ...s, port: e.target.value }))}
                    placeholder="587"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="user">Usuario</label>
                  <input
                    id="user"
                    value={form.user}
                    onChange={(e) => setForm((s) => ({ ...s, user: e.target.value }))}
                    autoCapitalize="none"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="pass">Contraseña</label>
                  <input
                    id="pass"
                    type="password"
                    value={form.pass}
                    onChange={(e) => setForm((s) => ({ ...s, pass: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="fromName">From Name</label>
                  <input
                    id="fromName"
                    value={form.fromName}
                    onChange={(e) => setForm((s) => ({ ...s, fromName: e.target.value }))}
                    placeholder="MegaRifas"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300" htmlFor="fromEmail">From Email</label>
                  <input
                    id="fromEmail"
                    value={form.fromEmail}
                    onChange={(e) => setForm((s) => ({ ...s, fromEmail: e.target.value }))}
                    autoCapitalize="none"
                    placeholder="no-reply@megarifas.com.ve"
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, secure: !s.secure }))}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-white">Conexión Segura (SSL/TLS)</span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    form.secure ? "bg-amber-400/15 text-amber-300" : "bg-white/10 text-slate-300"
                  }`}
                >
                  <Mail className="h-4 w-4" /> {form.secure ? "ON" : "OFF"}
                </span>
              </button>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs font-semibold text-slate-300">Vista actual (desde backend)</p>
                <pre className="mt-2 overflow-auto rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-100">{JSON.stringify((settings as any)?.smtp ?? {}, null, 2)}</pre>
              </div>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
