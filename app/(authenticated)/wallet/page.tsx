"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchBankDetails, fetchMyPayments, fetchWallet, topupWallet } from "@/lib/api"
import { getAuthToken } from "@/lib/session"
import type { PaymentReceipt, WalletMovement } from "@/lib/types"

type ProviderId = "mobile_payment" | "transfer" | "zelle" | "binance"

const formatMoneyVES = (value: unknown, decimals = 2) => {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return "VES 0.00"
  return `VES ${n.toFixed(decimals)}`
}

export default function WalletPage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [balance, setBalance] = useState(0)
  const [movements, setMovements] = useState<WalletMovement[]>([])
  const [payments, setPayments] = useState<PaymentReceipt[]>([])
  const [receiverDetails, setReceiverDetails] = useState<Record<string, unknown> | null>(null)

  const [showTopup, setShowTopup] = useState(false)
  const [topupAmount, setTopupAmount] = useState("")
  const [topupProvider, setTopupProvider] = useState<ProviderId>("mobile_payment")
  const [toppingUp, setToppingUp] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/wallet")}`)
      return
    }
  }, [router])

  const providerOptions = useMemo(
    () => [
      { id: "mobile_payment" as const, label: "Pago móvil", hint: "Transferencia móvil" },
      { id: "transfer" as const, label: "Transferencia", hint: "Transferencia bancaria" },
      { id: "zelle" as const, label: "Zelle", hint: "Pago internacional" },
      { id: "binance" as const, label: "Binance", hint: "Cripto / Binance" },
    ],
    [],
  )

  const getProviderDetailsRows = useCallback(
    (providerId: ProviderId) => {
      const d = receiverDetails && typeof receiverDetails === "object" ? receiverDetails : {}

      const bank = (d as any).bankName || (d as any).bank || ""
      const phone = (d as any).phone || ""
      const cedula = (d as any).cedula || ""
      const accountNumber = (d as any).accountNumber || (d as any).account || ""
      const accountType = (d as any).accountType || (d as any).type || ""
      const accountName = (d as any).accountName || (d as any).holder || (d as any).name || ""

      const zelleEmail = (d as any).zelleEmail || (d as any).zelle || (d as any).emailZelle || (d as any).email || ""
      const binanceId =
        (d as any).binanceId ||
        (d as any).binancePayId ||
        (d as any).binancePay ||
        (d as any).binance ||
        (d as any).usdtAddress ||
        (d as any).wallet ||
        ""

      if (providerId === "mobile_payment") {
        const rows = [
          bank ? { label: "Banco", value: String(bank) } : null,
          phone ? { label: "Teléfono", value: String(phone) } : null,
          cedula ? { label: "Cédula", value: String(cedula) } : null,
        ].filter(Boolean) as Array<{ label: string; value: string }>
        return rows.length ? rows : [{ label: "Datos", value: "No configurados" }]
      }

      if (providerId === "transfer") {
        const rows = [
          bank ? { label: "Banco", value: String(bank) } : null,
          accountType ? { label: "Tipo", value: String(accountType) } : null,
          accountNumber ? { label: "Cuenta", value: String(accountNumber) } : null,
          accountName ? { label: "Titular", value: String(accountName) } : null,
          cedula ? { label: "Cédula", value: String(cedula) } : null,
        ].filter(Boolean) as Array<{ label: string; value: string }>
        return rows.length ? rows : [{ label: "Datos", value: "No configurados" }]
      }

      if (providerId === "zelle") {
        return zelleEmail ? [{ label: "Email", value: String(zelleEmail) }] : [{ label: "Datos", value: "No configurados" }]
      }

      if (providerId === "binance") {
        return binanceId ? [{ label: "ID/Wallet", value: String(binanceId) }] : [{ label: "Datos", value: "No configurados" }]
      }

      return []
    },
    [receiverDetails],
  )

  const copyValue = useCallback(async (value: string, label = "Dato") => {
    const raw = String(value ?? "").trim()
    if (!raw) return
    try {
      await navigator.clipboard.writeText(raw)
      setMessage(`${label} copiado`)
    } catch {
      setError("No se pudo copiar")
    }
  }, [])

  const loadWallet = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    setMessage(null)
    try {
      const [wallet, bankDetails, myPayments] = await Promise.all([fetchWallet(), fetchBankDetails(), fetchMyPayments()])
      const b = (wallet as any)?.balance
      setBalance(typeof b === "number" ? b : b ? Number(b) : 0)
      setMovements(Array.isArray((wallet as any)?.transactions) ? ((wallet as any).transactions as any) : [])
      setReceiverDetails(bankDetails)
      setPayments(Array.isArray(myPayments) ? (myPayments as any) : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la wallet")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!mounted) return
      await loadWallet()
    })()
    return () => {
      mounted = false
    }
  }, [loadWallet])

  const stats = useMemo(() => {
    const list = Array.isArray(movements) ? movements : []
    const ingresos = list
      .filter((m) => String((m as any)?.type || "").toLowerCase() === "deposit")
      .reduce((acc, m) => acc + (Number((m as any)?.amount) || 0), 0)
    const gastos = list
      .filter((m) => String((m as any)?.type || "").toLowerCase() === "purchase")
      .reduce((acc, m) => acc + (Number((m as any)?.amount) || 0), 0)
    const tickets = list.filter((m) => String((m as any)?.type || "").toLowerCase() === "purchase").length
    return { ingresos, gastos: Math.abs(gastos), tickets }
  }, [movements])

  const onTopup = useCallback(async () => {
    setError(null)
    setMessage(null)
    const amount = Number(String(topupAmount).replace(",", "."))
    if (!topupAmount || Number.isNaN(amount) || amount <= 0) {
      setError("Monto inválido")
      return
    }
    setToppingUp(true)
    try {
      await topupWallet(amount, topupProvider)
      setMessage("Recarga enviada")
      setTopupAmount("")
      setShowTopup(false)
      await loadWallet()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo recargar")
    } finally {
      setToppingUp(false)
    }
  }, [loadWallet, topupAmount, topupProvider])

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">WALLET</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        {error ? (
          <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
        ) : null}
        {message ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div>
        ) : null}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saldo disponible</p>
              <p className="mt-1 text-3xl font-extrabold text-amber-300">{formatMoneyVES(balance)}</p>
            </div>
            <button
              type="button"
              onClick={loadWallet}
              className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition"
            >
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowTopup((s) => !s)}
              className="flex-1 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition"
            >
              {showTopup ? "Cerrar recarga" : "Recargar"}
            </button>
            <button
              type="button"
              onClick={() => setMessage("Próximamente")}
              className="flex-1 rounded-full border border-slate-700 bg-white/5 px-5 py-3 text-sm font-extrabold text-slate-100 hover:bg-white/10 transition"
            >
              Retirar
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Ingresos</p>
              <p className="text-lg font-extrabold text-emerald-200">{formatMoneyVES(stats.ingresos, 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Gastos</p>
              <p className="text-lg font-extrabold text-orange-200">{formatMoneyVES(stats.gastos, 0)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tickets</p>
              <p className="text-lg font-extrabold text-white">{stats.tickets}</p>
            </div>
          </div>
        </section>

        {showTopup ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-white">Recarga</p>
              <p className="text-xs text-slate-300">Selecciona método y monto</p>
            </div>

            <p className="mt-4 text-xs text-slate-400">Método</p>
            <div className="mt-2 space-y-2">
              {providerOptions.map((opt) => {
                const active = topupProvider === opt.id
                const rows = getProviderDetailsRows(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTopupProvider(opt.id)}
                    className={
                      "w-full rounded-2xl border p-4 text-left transition " +
                      (active ? "border-purple-400 bg-purple-900/25" : "border-slate-800 bg-slate-950/30 hover:bg-slate-950/45")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-white">{opt.label}</p>
                        <p className="text-xs text-slate-300">{opt.hint}</p>
                      </div>
                      <span className={"text-xs font-extrabold " + (active ? "text-emerald-300" : "text-slate-400")}>
                        {active ? "Seleccionado" : ""}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {rows.map((row) => {
                        const canCopy = row.value && row.value !== "No configurados"
                        return (
                          <div key={`${opt.id}-${row.label}`} className="flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-200">
                              <span className="text-slate-400">{row.label}:</span> <span className="font-semibold text-white">{row.value}</span>
                            </p>
                            {canCopy ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  copyValue(row.value, row.label)
                                }}
                                className="rounded-xl border border-slate-700 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/10 transition"
                              >
                                Copiar
                              </button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-xs text-slate-400">Monto (Bs.)</p>
            <input
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
            />

            <button
              type="button"
              onClick={onTopup}
              disabled={toppingUp}
              className="mt-3 w-full rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-purple-500 transition disabled:opacity-60"
            >
              {toppingUp ? "Enviando..." : "Confirmar recarga"}
            </button>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
          <p className="text-sm font-extrabold text-white">Movimientos</p>
          {loading ? <p className="mt-2 text-sm text-slate-300">Cargando...</p> : null}
          {!loading && movements.length === 0 ? <p className="mt-2 text-sm text-slate-300">No tienes movimientos registrados.</p> : null}
          <div className="mt-3 space-y-3">
            {movements.map((m, idx) => {
              const id = (m as any)?.id ?? (m as any)?._id ?? idx
              const type = String((m as any)?.type || "movimiento")
              const amount = Number((m as any)?.amount || 0) || 0
              const when = (m as any)?.createdAt ? new Date(String((m as any).createdAt)).toLocaleDateString() : ""
              return (
                <div key={String(id)} className="flex items-start justify-between rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{type === "purchase" ? "Compra" : type === "deposit" ? "Recarga" : "Movimiento"}</p>
                    <p className="text-xs text-slate-400">{when}</p>
                  </div>
                  <p className={"text-sm font-extrabold " + (type === "purchase" ? "text-orange-200" : "text-amber-300")}>
                    {formatMoneyVES(amount)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
          <p className="text-sm font-extrabold text-white">Historial de Pagos</p>
          {!loading && payments.length === 0 ? <p className="mt-2 text-sm text-slate-300">No tienes pagos registrados.</p> : null}
          <div className="mt-3 space-y-3">
            {payments.map((p, idx) => {
              const amount = (p as any).amount ?? (p as any).total ?? ((p as any).price && (p as any).quantity ? Number((p as any).price) * Number((p as any).quantity) : 0)
              const status = String((p as any).status || "pendiente")
              const prov = String((p as any).provider || "").trim().toLowerCase()
              const providerLabel =
                prov === "mobile_payment" ? "Pago móvil" : prov === "transfer" ? "Transferencia" : prov === "zelle" ? "Zelle" : prov === "binance" ? "Binance" : prov
              const key = String((p as any).id ?? (p as any).reference ?? `${idx}`)
              return (
                <div key={key} className="flex items-start justify-between rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{(p as any).raffleTitle || (p as any).raffleId || "Pago"}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {(p as any).createdAt ? new Date(String((p as any).createdAt)).toLocaleDateString() : ""}
                      {providerLabel ? ` · ${providerLabel}` : ""}
                    </p>
                    {(p as any).reference ? <p className="text-xs text-slate-400 truncate">Ref: {(p as any).reference}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-amber-300">{formatMoneyVES(amount)}</p>
                    <p className="text-xs font-semibold text-slate-300">{status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
