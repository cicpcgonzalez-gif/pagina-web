"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import RequireRole from "../../_components/RequireRole"
import { CreateRaffleModal } from "@/components/admin/CreateRaffleModal"
import { fetchAdminPayments, publishWinner, reconcilePayment, rejectManualPayment } from "@/lib/api"
import {
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  Headset,
  KeyRound,
  Megaphone,
  QrCode,
  Radio,
  RefreshCw,
  Shield,
  Ticket,
  User,
  Wallet2,
  XCircle,
} from "lucide-react"

type AdminPayment = {
  id?: string | number
  raffleId?: string | number
  amount?: number
  reference?: string
  proof?: string | null
  status?: string
  createdAt?: string
  user?: { id?: string | number; name?: string; email?: string }
}

export default function AdminPage() {
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const [payments, setPayments] = useState<AdminPayment[]>([])

  const [raffleId, setRaffleId] = useState("")
  const [ticketNumber, setTicketNumber] = useState("")
  const [drawSlot, setDrawSlot] = useState<"1pm" | "4pm" | "10pm">("1pm")
  const [prize, setPrize] = useState("")
  const [testimonial, setTestimonial] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [publishMsg, setPublishMsg] = useState<string | null>(null)

  const loadPayments = useCallback(async () => {
    setLoadingPayments(true)
    setPaymentsError(null)
    try {
      const list = await fetchAdminPayments()
      setPayments(Array.isArray(list) ? (list as any) : [])
    } catch (e) {
      setPaymentsError(e instanceof Error ? e.message : "No se pudieron cargar los pagos.")
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const pending = useMemo(() => payments.filter((p) => String(p.status || "").toLowerCase() === "pending"), [payments])

  const onApprove = async (id: string | number | undefined) => {
    if (!id) return
    setPaymentsError(null)
    try {
      await reconcilePayment(id)
      await loadPayments()
    } catch (e) {
      setPaymentsError(e instanceof Error ? e.message : "No se pudo aprobar.")
    }
  }

  const onReject = async (id: string | number | undefined) => {
    if (!id) return
    setPaymentsError(null)
    try {
      await rejectManualPayment(id)
      await loadPayments()
    } catch (e) {
      setPaymentsError(e instanceof Error ? e.message : "No se pudo rechazar.")
    }
  }

  const onPublish = async () => {
    setPublishing(true)
    setPublishMsg(null)
    try {
      const payload = {
        raffleId: raffleId.trim(),
        ticketNumber: ticketNumber.trim(),
        drawSlot,
        prize: prize.trim(),
        testimonial: testimonial.trim(),
        photoUrl: photoUrl.trim(),
      }
      const result = await publishWinner(payload as any)
      const msg = (result as any)?.message || "Ganador publicado"
      setPublishMsg(msg)
      setTicketNumber("")
      setPrize("")
      setTestimonial("")
      setPhotoUrl("")
    } catch (e) {
      setPublishMsg(e instanceof Error ? e.message : "No se pudo publicar ganador.")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin" title="Admin">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">PANEL ADMIN</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Menú (como en la app)</p>
            <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3">
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/perfil">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <User className="h-4 w-4 text-purple-200" /> Perfil
                </div>
                <p className="mt-1 text-xs text-slate-300">Datos y sesión</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/raffles">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Ticket className="h-4 w-4 text-purple-200" /> Gestión de Rifas
                </div>
                <p className="mt-1 text-xs text-slate-300">Crear / revisar</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/payments">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <CreditCard className="h-4 w-4 text-purple-200" /> Validar Pagos
                </div>
                <p className="mt-1 text-xs text-slate-300">Aprobar / rechazar</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/tickets">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <QrCode className="h-4 w-4 text-purple-200" /> Verificador
                </div>
                <p className="mt-1 text-xs text-slate-300">Validar serial</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/dashboard">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <BarChart3 className="h-4 w-4 text-purple-200" /> Dashboard
                </div>
                <p className="mt-1 text-xs text-slate-300">Métricas</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/movements">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Wallet2 className="h-4 w-4 text-purple-200" /> Movimientos
                </div>
                <p className="mt-1 text-xs text-slate-300">Historial</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/news">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Megaphone className="h-4 w-4 text-purple-200" /> Novedades
                </div>
                <p className="mt-1 text-xs text-slate-300">Avisos</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/support">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Headset className="h-4 w-4 text-purple-200" /> Mi Soporte
                </div>
                <p className="mt-1 text-xs text-slate-300">Tickets y ayuda</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/notifications">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Bell className="h-4 w-4 text-purple-200" /> Notificaciones
                </div>
                <p className="mt-1 text-xs text-slate-300">Avisos del sistema</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/security">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <KeyRound className="h-4 w-4 text-purple-200" /> Cód. Seguridad
                </div>
                <p className="mt-1 text-xs text-slate-300">Código / verificación</p>
              </Link>
              <Link className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-950/55 transition" href="/admin/live">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Radio className="h-4 w-4 text-purple-200" /> Sorteo en Vivo
                </div>
                <p className="mt-1 text-xs text-slate-300">Transmisión</p>
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Shield className="h-4 w-4" /> Herramientas
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Administra rifas y validaciones.</h2>
            <p className="mt-2 text-slate-200 text-sm">Aprobar pagos manuales y publicar ganadores.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CreateRaffleModal />
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/rifas">
                Ir a Rifas
              </Link>
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin/payments">
                Pagos
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Pagos manuales (pendientes)</h3>
              <button
                type="button"
                onClick={loadPayments}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
              >
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
            </div>

            {paymentsError ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{paymentsError}</div>
            ) : null}

            {loadingPayments ? <p className="mt-4 text-sm text-slate-300">Cargando…</p> : null}

            {!loadingPayments ? (
              pending.length ? (
                <div className="mt-4 grid gap-3">
                  {pending.map((p) => (
                    <div key={String(p.id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">Pago #{String(p.id)}</p>
                          <p className="text-xs text-slate-300 truncate">Usuario: {p.user?.name || p.user?.email || "—"}</p>
                          <p className="text-xs text-slate-400 truncate">Ref: {p.reference || "—"}</p>
                          <p className="text-xs text-slate-400">Rifa: {String(p.raffleId ?? "—")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-300">{Number(p.amount || 0).toFixed(2)}</p>
                          <p className="text-xs text-slate-400">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</p>
                        </div>
                      </div>

                      {p.proof ? (
                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
                          {/* proof puede venir como dataURL */}
                          <img src={p.proof} alt="Comprobante" className="h-48 w-full object-cover" />
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove(p.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(p.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"
                        >
                          <XCircle className="h-4 w-4" /> Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">
                  No hay pagos pendientes.
                </div>
              )
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-lg font-bold text-white">Publicar ganador</h3>
            <p className="text-sm text-slate-300 mt-1">Requiere `raffleId`, `ticketNumber`, `drawSlot` (1pm/4pm/10pm) y `prize`.</p>

            {publishMsg ? (
              <div className="mt-4 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">{publishMsg}</div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={raffleId}
                  onChange={(e) => setRaffleId(e.target.value)}
                  placeholder="Rifa ID (ej: 12)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
                <input
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="Ticket ganador (ej: 123)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={drawSlot}
                  onChange={(e) => setDrawSlot(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="1pm">1pm</option>
                  <option value="4pm">4pm</option>
                  <option value="10pm">10pm</option>
                </select>
                <input
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder='Premio (ej: TV 55")'
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Testimonio (opcional)"
                rows={3}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
              />

              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Foto URL (opcional)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
              />

              <button
                type="button"
                onClick={onPublish}
                disabled={publishing}
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-500 transition disabled:opacity-60"
              >
                {publishing ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
