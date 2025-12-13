"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminReports, fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

export default function AdminReportsPage() {
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [reports, setReports] = useState<Record<string, unknown> | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

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

    const loadReports = async () => {
      setLoadingReports(true);
      setReportsError(null);
      try {
        const data = await fetchAdminReports();
        if (mounted) setReports(data || {});
      } catch (err) {
        if (mounted) setReportsError(err instanceof Error ? err.message : "No se pudieron cargar reportes");
      } finally {
        if (mounted) setLoadingReports(false);
      }
    };

    loadReports();
    return () => {
        mounted = false;
    };
  }, []);

  const reportsEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (role === "superadmin") return modulesConfig.superadmin?.reports !== false;
    return modulesConfig.admin?.reports !== false;
  }, [modulesConfig, role]);

  const summary = useMemo(() => {
    const data = reports as any;
    const money = (value: unknown) => {
      const n = Number(value ?? 0);
      return Number.isFinite(n) ? `$${n.toLocaleString()}` : "—";
    };
    return [
      { label: "Ventas hoy", value: money(data?.salesToday ?? data?.today ?? data?.ventasHoy) },
      { label: "Ventas 7d", value: money(data?.sales7d ?? data?.week ?? data?.ventasSemana) },
      { label: "Boletos validados", value: (data?.ticketsValidated ?? data?.validated ?? data?.tickets) ?? "—" },
      { label: "Pendientes de pago", value: (data?.pendingPayments ?? data?.pending ?? data?.pendientes) ?? "—" },
    ];
  }, [reports]);

  const hourly = useMemo(() => (Array.isArray((reports as any)?.hourly) ? (reports as any)?.hourly : []), [reports]);

  const daily = useMemo(() => (Array.isArray((reports as any)?.daily) ? (reports as any)?.daily : []), [reports]);

  const byState = useMemo(() => (Array.isArray((reports as any)?.byState) ? (reports as any)?.byState : []), [reports]);

  const topBuyers = useMemo(() => (Array.isArray((reports as any)?.topBuyers) ? (reports as any)?.topBuyers : []), [reports]);

  const topRaffles = useMemo(() => (Array.isArray((reports as any)?.topRaffles) ? (reports as any)?.topRaffles : []), [reports]);

  if (!loadingModules && !reportsEnabled) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de reportes desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo para ver métricas y exportes.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-white/80">Métricas en vivo desde el backend.</p>
        {loadingModules && <span className="text-xs text-white/60">Cargando módulos…</span>}
        {modulesError && <span className="text-xs text-red-200">{modulesError}</span>}
        {loadingReports && <span className="text-xs text-white/60">Cargando reportes…</span>}
        {reportsError && <span className="text-xs text-red-200">{reportsError}</span>}
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-black/30">
            <p className="text-sm text-white/70">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Ventas por hora</span>
          </div>
          <div className="p-4 space-y-3">
            {hourly.map((h) => {
              const sales = Number((h as any)?.sales ?? 0);
              const pct = Math.min(100, Math.max(0, Math.round((sales / 500) * 100)));
              return (
                <div key={(h as any)?.label || Math.random()}>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{(h as any)?.label || ""}</span>
                    <span>${sales}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!hourly.length && <p className="text-xs text-white/70">Sin datos horarios.</p>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Ventas por día (7d)</span>
          </div>
          <div className="p-4 space-y-2">
            {daily.map((d) => (
              <div key={(d as any)?.date || Math.random()} className="flex items-center gap-3">
                <span className="w-10 text-xs text-white/70">{(d as any)?.date}</span>
                <div className="flex-1 rounded-full bg-white/10 h-2">
                  <div className="h-2 rounded-full bg-[#22d3ee]" style={{ width: `${Math.min(100, Math.round((Number((d as any)?.sales ?? 0) / 1400) * 100))}%` }} />
                </div>
                <span className="w-14 text-xs text-white/70 text-right">${Number((d as any)?.sales ?? 0)}</span>
              </div>
            ))}
            {!daily.length && <p className="text-xs text-white/70">Sin datos diarios.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Estado de pagos</span>
          </div>
          <div className="p-4 space-y-3">
            {byState.map((item) => {
              const count = Number((item as any)?.count ?? 0);
              const state = (item as any)?.state || "Estado";
              const pct = Math.min(100, Math.max(0, Math.round((count / 3200) * 100)));
              return (
                <div key={state} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{state}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#3b82f6]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {!byState.length && <p className="text-xs text-white/70">Sin datos de pagos.</p>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Top compradores</span>
          </div>
          <div className="p-4 space-y-3">
            {topBuyers.map((buyer) => (
              <div key={(buyer as any)?.name || Math.random()} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <div>
                  <p className="font-semibold text-white">{(buyer as any)?.name}</p>
                  <p className="text-xs text-white/65">{(buyer as any)?.tickets ?? 0} boletos</p>
                </div>
                <span className="text-white/85 font-semibold">${Number((buyer as any)?.amount ?? 0)}</span>
              </div>
            ))}
            {!topBuyers.length && <p className="text-xs text-white/70">Sin compradores destacados.</p>}
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
          <span>Top rifas por revenue</span>
          <button className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40">Exportar CSV</button>
        </div>
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Rifa</th>
              <th className="px-4 py-3">Vendidos</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Ingresos</th>
              <th className="px-4 py-3">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {topRaffles.map((r) => {
              const sold = Number((r as any)?.sold ?? (r as any)?.sales ?? 0);
              const total = Number((r as any)?.total ?? (r as any)?.tickets ?? 1);
              const revenue = Number((r as any)?.revenue ?? 0);
              const progress = total ? Math.min(100, Math.max(0, Math.round((sold / total) * 100))) : 0;
              return (
                <tr key={(r as any)?.name || Math.random()} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{(r as any)?.name}</td>
                  <td className="px-4 py-3">{sold}</td>
                  <td className="px-4 py-3">{total}</td>
                  <td className="px-4 py-3">${revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 rounded-full bg-white/15">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-white/60">{progress}%</p>
                  </td>
                </tr>
              );
            })}
            {!topRaffles.length && (
              <tr className="border-t border-white/10">
                <td colSpan={5} className="px-4 py-6 text-center text-white/70">Sin rifas con métricas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
