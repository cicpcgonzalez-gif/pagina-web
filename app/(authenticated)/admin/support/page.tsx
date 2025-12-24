"use client"

import Link from "next/link"
import RequireRole from "../../../_components/RequireRole"
import { Headset } from "lucide-react"

export default function AdminSupportPage() {
  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/support" title="Soporte">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">MI SOPORTE</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Headset className="h-4 w-4" /> Soporte
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Atención y tickets</h2>
            <p className="mt-2 text-slate-200 text-sm">Pendiente de endpoint para crear/listar solicitudes de soporte.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
            </div>
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-slate-200">Próximamente.</div>
        </main>
      </div>
    </RequireRole>
  )
}
