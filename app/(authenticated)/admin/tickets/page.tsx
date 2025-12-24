"use client"

import Link from "next/link"
import { useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { safeVerify } from "@/lib/verify-ticket"
import { BadgeCheck, QrCode } from "lucide-react"

export default function AdminTicketsPage() {
  const [serial, setSerial] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await safeVerify(serial.trim())
      setResult(res)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo verificar."
      setResult(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/tickets" title="Verificador">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">VERIFICADOR</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <QrCode className="h-4 w-4" /> Validación
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Valida un boleto</h2>
            <p className="mt-2 text-slate-200 text-sm">Serial/código del ticket.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="serial">Serial o código</label>
                <input
                  id="serial"
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="ABC-123"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                <BadgeCheck className="h-4 w-4" /> {loading ? "Verificando..." : "Verificar"}
              </button>
            </form>

            {result ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100">
                {result}
              </div>
            ) : null}
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
