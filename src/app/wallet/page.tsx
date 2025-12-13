"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyPayments, fetchWallet } from "@/lib/api";
import type { PaymentReceipt, WalletMovement } from "@/lib/types";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState<WalletMovement[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const ingresos = movements
      .filter((m) => (m.type || "").toLowerCase() === "deposit")
      .reduce((acc, m) => acc + Number(m.amount || 0), 0);
    const gastos = movements
      .filter((m) => (m.type || "").toLowerCase() === "purchase")
      .reduce((acc, m) => acc + Number(m.amount || 0), 0);
    const tickets = movements.filter((m) => (m.type || "").toLowerCase() === "purchase").length;
    return { ingresos, gastos, tickets };
  }, [movements]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      const errors: string[] = [];

      try {
        const wallet = await fetchWallet();
        if (mounted) {
          setBalance(Number(wallet?.balance || 0));
          setMovements(Array.isArray(wallet?.transactions) ? (wallet.transactions as WalletMovement[]) : []);
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "No se pudo cargar wallet");
      }

      try {
        const pay = await fetchMyPayments();
        if (mounted) setPayments(Array.isArray(pay) ? (pay as PaymentReceipt[]) : []);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Pagos no disponibles");
      }

      if (mounted) {
        setError(errors.length ? errors.join(" | ") : null);
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-16 pt-14">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Wallet</p>
          <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">Saldo, retiros y movimientos.</h1>
          <p className="text-white/75">Consulta tu balance, movimientos y pagos registrados.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
        )}
        {loading && <p className="text-sm text-white/70">Cargando...</p>}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Saldo disponible</p>
              <p className="text-3xl font-semibold text-white">VES {balance.toFixed(2)}</p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#fbbf24]">Wallet</div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Ingresos</p>
              <p className="text-xl font-semibold text-emerald-200">VES {totals.ingresos.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Gastos</p>
              <p className="text-xl font-semibold text-amber-200">VES {totals.gastos.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Tickets</p>
              <p className="text-xl font-semibold text-white">{totals.tickets}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Actividad reciente</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">Movimientos</span>
          </div>
          <div className="mt-3 space-y-3">
            {movements.length === 0 && !loading && <p className="text-sm text-white/70">No hay movimientos recientes.</p>}
            {movements.map((m) => {
              const isDeposit = (m.type || "").toLowerCase() === "deposit";
              const badge = isDeposit ? "text-emerald-200 bg-emerald-500/15 border-emerald-300/40" : "text-rose-200 bg-rose-500/15 border-rose-300/40";
              const amount = Number(m.amount || 0);
              return (
                <div key={m.id || m.reference} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
                  <div className="space-y-1">
                    <p className="text-white font-semibold">{m.reference || (isDeposit ? "Recarga" : "Compra")}</p>
                    <p className="text-xs text-white/60">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className={`${isDeposit ? "text-emerald-200" : "text-rose-200"} font-semibold`}>
                      {isDeposit ? "+" : "-"}VES {amount.toFixed(2)}
                    </p>
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${badge}`}>
                      {m.status || "pendiente"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Historial de pagos</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">Pagos</span>
          </div>
          <div className="mt-3 space-y-3">
            {payments.length === 0 && !loading && <p className="text-sm text-white/70">No tienes pagos registrados.</p>}
            {payments.map((p) => {
              const amount = p.amount ?? p.total ?? (p.price && p.quantity ? Number(p.price) * Number(p.quantity) : 0);
              return (
                <div key={p.id || p.reference} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold">{p.raffleTitle || p.raffleId || "Pago"}</p>
                      <p className="text-xs text-white/60">Ref: {p.reference || "—"}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/70">{p.status || "pendiente"}</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-amber-200">VES {amount?.toFixed ? amount.toFixed(2) : amount}</p>
                  {p.createdAt && <p className="text-xs text-white/60">{new Date(p.createdAt).toLocaleString()}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
