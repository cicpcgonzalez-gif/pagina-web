"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

export default function AdminReportsPage() {
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

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

  const reportsEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (role === "superadmin") return modulesConfig.superadmin?.reports !== false;
    return modulesConfig.admin?.reports !== false;
  }, [modulesConfig, role]);

  const summary = useMemo(
    () => [
      { label: "Ventas hoy", value: "$1,240" },
      { label: "Ventas 7d", value: "$8,930" },
      { label: "Boletos validados", value: "1,180" },
      { label: "Pendientes de pago", value: "74" },
    ],
    [],
  );

  const hourly = useMemo(
    () => [
      { label: "08h", sales: 120 },
      { label: "10h", sales: 220 },
      { label: "12h", sales: 340 },
      { label: "14h", sales: 290 },
      { label: "16h", sales: 410 },
      { label: "18h", sales: 380 },
      { label: "20h", sales: 450 },
    ],
    [],
  );

  const daily = useMemo(
    () => [
      { date: "Lun", sales: 820 },
      { date: "Mar", sales: 910 },
      { date: "Mié", sales: 880 },
      { date: "Jue", sales: 1020 },
      { date: "Vie", sales: 1140 },
      { date: "Sáb", sales: 1350 },
      { date: "Dom", sales: 970 },
    ],
    [],
  );

  const byState = useMemo(
    () => [
      { state: "Pagado", count: 3120 },
      { state: "Pendiente", count: 740 },
      { state: "Rechazado", count: 45 },
      { state: "Reembolsado", count: 18 },
    ],
    [],
  );

  const topBuyers = useMemo(
    () => [
      { name: "Mariana R.", amount: 420, tickets: 42 },
      { name: "Carlos D.", amount: 360, tickets: 36 },
      { name: "Lucía M.", amount: 280, tickets: 28 },
      { name: "Andrés P.", amount: 190, tickets: 19 },
    ],
    [],
  );

  const topRaffles = useMemo(
    () => [
      { name: "Camioneta 4x4", sold: 3120, total: 5000, revenue: 31200 },
      { name: "iPhone 16 Pro", sold: 2980, total: 3000, revenue: 23840 },
      { name: "Moto 150cc", sold: 640, total: 2000, revenue: 3200 },
    ],
    [],
  );

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
        <p className="text-white/80">Métricas mock. Conecta aquí GET `/api/admin/reports`.</p>
        {loadingModules && <span className="text-xs text-white/60">Cargando módulos…</span>}
        {modulesError && <span className="text-xs text-red-200">{modulesError}</span>}
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
              const pct = Math.min(100, Math.round((h.sales / 500) * 100));
              return (
                <div key={h.label}>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{h.label}</span>
                    <span>${h.sales}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Ventas por día (7d)</span>
          </div>
          <div className="p-4 space-y-2">
            {daily.map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="w-10 text-xs text-white/70">{d.date}</span>
                <div className="flex-1 rounded-full bg-white/10 h-2">
                  <div className="h-2 rounded-full bg-[#22d3ee]" style={{ width: `${Math.min(100, Math.round((d.sales / 1400) * 100))}%` }} />
                </div>
                <span className="w-14 text-xs text-white/70 text-right">${d.sales}</span>
              </div>
            ))}
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
              const pct = Math.min(100, Math.round((item.count / 3200) * 100));
              return (
                <div key={item.state} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{item.state}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#3b82f6]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
            <span>Top compradores</span>
          </div>
          <div className="p-4 space-y-3">
            {topBuyers.map((buyer) => (
              <div key={buyer.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <div>
                  <p className="font-semibold text-white">{buyer.name}</p>
                  <p className="text-xs text-white/65">{buyer.tickets} boletos</p>
                </div>
                <span className="text-white/85 font-semibold">${buyer.amount}</span>
              </div>
            ))}
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
              const progress = Math.min(100, Math.round((r.sold / r.total) * 100));
              return (
                <tr key={r.name} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{r.name}</td>
                  <td className="px-4 py-3">{r.sold}</td>
                  <td className="px-4 py-3">{r.total}</td>
                  <td className="px-4 py-3">${r.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 rounded-full bg-white/15">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-white/60">{progress}%</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
