"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchModules, fetchAdminPayments, reconcilePayment, syncPayments } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

type PaymentRow = {
  id: string;
  user: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  reference?: string;
  raffleTitle?: string;
};

export default function AdminPaymentsPage() {
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionVariant, setActionVariant] = useState<"success" | "error" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  const role = getUserRole()?.toLowerCase();

  useEffect(() => {
    let mounted = true;
    fetchModules()
      .then((data) => {
        if (!mounted) return;
        setModulesConfig(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
      })
      .finally(() => {
        if (mounted) setLoadingModules(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const reloadPayments = useCallback(async () => {
    setLoadingPayments(true);
    setPaymentsError(null);
    try {
      const remote = await fetchAdminPayments();
      setPayments(
        (remote || []).map((p, index) => ({
          id: String((p as any)?.id ?? (p as any)?.reference ?? `pm-${index}`),
          user: (p as any)?.user?.name ?? (p as any)?.userName ?? (p as any)?.buyer ?? (p as any)?.customer ?? "Sin nombre",
          amount: Number((p as any)?.amount ?? (p as any)?.total ?? (p as any)?.price ?? 0),
          method: (p as any)?.method ?? (p as any)?.channel ?? (p as any)?.provider ?? "N/D",
          status: String((p as any)?.status ?? (p as any)?.state ?? "pendiente").toLowerCase(),
          createdAt: (p as any)?.createdAt ?? (p as any)?.date ?? (p as any)?.updatedAt ?? "",
          reference: (p as any)?.reference ?? (p as any)?.ref,
          raffleTitle: (p as any)?.raffleTitle ?? (p as any)?.raffle?.title,
        })),
      );
    } catch (err) {
      setPaymentsError(err instanceof Error ? err.message : "No se pudieron cargar pagos");
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    reloadPayments();
  }, [reloadPayments]);

  useEffect(() => {
    if (!actionMessage) return;
    const t = setTimeout(() => {
      setActionMessage(null);
      setActionVariant(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [actionMessage]);

  const paymentsEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (role === "superadmin") return modulesConfig.superadmin?.payments !== false;
    return modulesConfig.admin?.payments !== false;
  }, [modulesConfig, role]);

  const statusClass = (status: string) => {
    if (status === "confirmado") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "pendiente" || status === "conciliar") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  const handleSync = async () => {
    setSyncing(true);
    setActionMessage(null);
    setActionVariant(null);
    try {
      const res = await syncPayments();
      setActionMessage(res?.message ?? `Sincronización ejecutada${res?.synced ? ` (${res.synced} pagos)` : ""}.`);
      setActionVariant("success");
      await reloadPayments();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No se pudo sincronizar pagos");
      setActionVariant("error");
    } finally {
      setSyncing(false);
    }
  };

  const handleReconcile = async (paymentId: string) => {
    setReconcilingId(paymentId);
    setActionMessage(null);
    setActionVariant(null);
    try {
      const res = await reconcilePayment(paymentId);
      setActionMessage(res?.message ?? "Pago conciliado y marcado como confirmado.");
      setActionVariant("success");
      await reloadPayments();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "No se pudo conciliar el pago");
      setActionVariant("error");
    } finally {
      setReconcilingId(null);
    }
  };

  if (!loadingModules && !paymentsEnabled) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de pagos desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo en configuración para conciliar y revisar pagos.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      {actionMessage && (
        <div className="fixed right-4 top-4 z-20 flex max-w-md items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-lg shadow-black/40 backdrop-blur">
          <div
            className={`h-2 w-2 rounded-full ${
              actionVariant === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          <span className="text-white/90">{actionMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-white/80">Conciliación y sincronización con el backend admin.</p>
        {loadingModules && <span className="text-xs text-white/60">Cargando módulos…</span>}
        {modulesError && <span className="text-xs text-red-200">{modulesError}</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-[#22c55e] px-3 py-2 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {syncing ? "Sincronizando…" : "Sincronizar pagos"}
        </button>
        {actionMessage && (
          <span
            className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
              actionVariant === "success"
                ? "border-emerald-200/40 bg-emerald-500/15 text-emerald-100"
                : "border-rose-200/40 bg-rose-500/15 text-rose-100"
            }`}
          >
            {actionMessage}
          </span>
        )}
        {paymentsError && <span className="text-xs text-red-200">{paymentsError}</span>}
        {loadingPayments && <span className="text-xs text-white/60">Cargando pagos…</span>}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Rifa</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{p.id}</td>
                <td className="px-4 py-3">{p.user}</td>
                <td className="px-4 py-3">${Number.isFinite(p.amount) ? p.amount.toFixed(2) : "0.00"}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3 text-xs text-white/70">{p.raffleTitle ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{p.createdAt || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs">
                    <button className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">Ver</button>
                    <button
                      onClick={() => handleReconcile(p.id)}
                      disabled={Boolean(reconcilingId) && reconcilingId !== p.id}
                      className="rounded-md bg-[#3b82f6] px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reconcilingId === p.id ? "Conciliando…" : "Conciliar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
