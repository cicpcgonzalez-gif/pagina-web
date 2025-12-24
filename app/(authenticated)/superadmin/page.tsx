"use client"

import Link from "next/link"
import RequireRole from "../../_components/RequireRole"
import { Crown, FileText, Flag, Mail, MailSearch, Palette, Shield, Ticket, Users, Wrench } from "lucide-react"

export default function SuperadminPage() {
  return (
    <RequireRole allow={["superadmin"]} nextPath="/superadmin" title="Superadmin">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">PANEL SUPERADMIN</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Crown className="h-4 w-4" /> Control total
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Configuración y usuarios.</h2>
            <p className="mt-2 text-slate-200 text-sm">Acceso exclusivo para Superadmin.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition" href="/usuarios">
                <Users className="h-4 w-4" /> Usuarios
              </Link>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Ir a Admin
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Menú (como en la app)</p>
            <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3">
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/users">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Users className="h-4 w-4 text-purple-200" /> Usuarios
                </div>
                <p className="mt-1 text-xs text-slate-300">Gestión</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/raffles">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Ticket className="h-4 w-4 text-purple-200" /> Administrar Rifas
                </div>
                <p className="mt-1 text-xs text-slate-300">Crear / revisar</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/support">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Wrench className="h-4 w-4 text-purple-200" /> Soporte Técnico
                </div>
                <p className="mt-1 text-xs text-slate-300">Incidencias</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/smtp">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Mail className="h-4 w-4 text-purple-200" /> Correo SMTP
                </div>
                <p className="mt-1 text-xs text-slate-300">Configuración</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/audit">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Shield className="h-4 w-4 text-purple-200" /> Auditoría
                </div>
                <p className="mt-1 text-xs text-slate-300">Bitácora</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/branding">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Palette className="h-4 w-4 text-purple-200" /> Branding
                </div>
                <p className="mt-1 text-xs text-slate-300">Marca</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/modules">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <FileText className="h-4 w-4 text-purple-200" /> Módulos
                </div>
                <p className="mt-1 text-xs text-slate-300">ON / OFF</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/mail-logs">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <MailSearch className="h-4 w-4 text-purple-200" /> Logs de Correo
                </div>
                <p className="mt-1 text-xs text-slate-300">Envíos/errores</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/superadmin/reports">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Flag className="h-4 w-4 text-purple-200" /> Denuncias y reportes
                </div>
                <p className="mt-1 text-xs text-slate-300">Moderación</p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
