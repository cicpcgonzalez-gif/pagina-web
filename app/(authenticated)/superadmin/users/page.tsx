"use client"

import Link from "next/link"
import RequireRole from "../../../_components/RequireRole"
import { Users } from "lucide-react"

export default function SuperadminUsersPage() {
  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin/users" title="Usuarios">
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
              <Users className="h-4 w-4" /> Superadmin
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Gestión de usuarios</h2>
            <p className="mt-2 text-slate-200 text-sm">Este módulo ya existe en la ruta /usuarios.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition" href="/usuarios">
                Abrir /usuarios
              </Link>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
                Volver
              </Link>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
