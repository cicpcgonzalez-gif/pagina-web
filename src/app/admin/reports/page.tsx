"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminReports, fetchModules, fetchRafflesLive, fetchWinners } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig, Raffle } from "@/lib/types";

type HourlyMetric = { label?: string; sales?: number };
type DailyMetric = { date?: string; sales?: number };
type StateMetric = { state?: string; count?: number };
type BuyerMetric = { name?: string; tickets?: number; amount?: number };
type RaffleMetric = { name?: string; sold?: number; sales?: number; total?: number; tickets?: number; revenue?: number };

export default function AdminReportsPage() {
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [reports, setReports] = useState<Record<string, unknown> | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [winners, setWinners] = useState<Array<Record<string, any>>>([]);
  const [loadingRaffles, setLoadingRaffles] = useState(true);
  const [loadingWinners, setLoadingWinners] = useState(true);

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
    const loadRaffles = async () => {
      setLoadingRaffles(true);
      try {
        const data = await fetchRafflesLive();
        if (mounted) setRaffles(data || []);
      } catch (err) {
        if (mounted) setRaffles([]);
      } finally {
        if (mounted) setLoadingRaffles(false);
      }
    };

    const loadWinners = async () => {
      setLoadingWinners(true);
      try {
        const data = await fetchWinners();
        if (mounted) setWinners(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch {
        if (mounted) setWinners([]);
      } finally {
        if (mounted) setLoadingWinners(false);
      }
    };

    loadRaffles();
    loadWinners();
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

  const hourly = useMemo<HourlyMetric[]>(() => (Array.isArray((reports as any)?.hourly) ? ((reports as any)?.hourly as HourlyMetric[]) : []), [reports]);

  const daily = useMemo<DailyMetric[]>(() => (Array.isArray((reports as any)?.daily) ? ((reports as any)?.daily as DailyMetric[]) : []), [reports]);

  const byState = useMemo<StateMetric[]>(() => (Array.isArray((reports as any)?.byState) ? ((reports as any)?.byState as StateMetric[]) : []), [reports]);

  const topBuyers = useMemo<BuyerMetric[]>(() => (Array.isArray((reports as any)?.topBuyers) ? ((reports as any)?.topBuyers as BuyerMetric[]) : []), [reports]);

  const topRaffles = useMemo<RaffleMetric[]>(() => (Array.isArray((reports as any)?.topRaffles) ? ((reports as any)?.topRaffles as RaffleMetric[]) : []), [reports]);

  const raffleStats = useMemo(() => {
    if (!raffles.length) return { total: 0, active: 0, sold: 0, tickets: 0, revenue: 0 };
    let total = raffles.length;
    let active = 0;
    let sold = 0;
    let tickets = 0;
    let revenue = 0;
    raffles.forEach((r) => {
      const t = r.ticketsTotal ?? 0;
      const avail = r.ticketsAvailable ?? 0;
      const s = Math.max(0, t - avail);
      tickets += t;
      sold += s;
      if ((r.status || "").toLowerCase() === "activa") active += 1;
      revenue += s * Number(r.price ?? 0);
    });
    return { total, active, sold, tickets, revenue };
  }, [raffles]);

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
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] px-4 pb-16 pt-10 text-white">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/80">Vista unificada como la app: rifas activas, progreso y métricas en vivo.</p>
        <div className="flex flex-wrap gap-3 text-xs text-white/70">
          {loadingModules && <span>Módulos…</span>}
          {modulesError && <span className="text-red-200">{modulesError}</span>}
          {loadingReports && <span>Reportes…</span>}
          {reportsError && <span className="text-red-200">{reportsError}</span>}
          {loadingRaffles && <span>Rifas…</span>}
          {loadingWinners && <span>Ganadores…</span>}
        </div>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Estado actual</span>
            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80">Rifas en vivo</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Tu oportunidad de ganar hoy.</h2>
          <p className="text-white/75">Se muestran las mismas tarjetas y progreso que en la app.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ label: "Rifas", value: raffleStats.total }, { label: "Activas", value: raffleStats.active }, { label: "Tickets vendidos", value: raffleStats.sold.toLocaleString() }, { label: "Revenue estimado", value: `$${raffleStats.revenue.toLocaleString()}` }].map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/30">
                <p className="text-xs text-white/60">{card.label}</p>
                <p className="text-xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>Ganadores recientes</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">Top 6</span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {winners.length === 0 && <p className="text-xs text-white/70">Sin ganadores cargados.</p>}
            {winners.map((w) => (
              <div key={(w as any)?.id || (w as any)?.ticketNumber || Math.random()} className="flex items-center gap-3 rounded-2xl border border-amber-200/20 bg-amber-500/10 p-3 text-sm text-white/85">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white">{String((w as any)?.winnerName || "G").slice(0, 2).toUpperCase()}</div>
                <div className="flex-1">
                  <p className="font-semibold">{(w as any)?.winnerName || "Ganador"}</p>
                  <p className="text-xs text-white/70">Ticket #{String((w as any)?.ticketNumber ?? "").padStart(4, "0")}</p>
                </div>
                <span className="text-amber-200 font-semibold">{(w as any)?.prize || "Premio"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-black/30">
            <p className="text-sm text-white/70">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Rifas activas</p>
            <h2 className="text-xl font-semibold text-white">Tarjetas como en la app</h2>
            <p className="text-sm text-white/70">Progreso, precio y cierre de cada rifa.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoadingRaffles(true);
              fetchRafflesLive()
                .then((data) => setRaffles(data || []))
                .finally(() => setLoadingRaffles(false));
            }}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
          >
            Refrescar rifas
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {loadingRaffles && <p className="text-sm text-white/70">Cargando rifas...</p>}
          {!loadingRaffles && raffles.length === 0 && <p className="text-sm text-white/70">No hay rifas activas.</p>}
          {raffles.map((item) => {
            const total = item.ticketsTotal ?? 0;
            const sold = total - (item.ticketsAvailable ?? 0);
            const remaining = Math.max(0, item.ticketsAvailable ?? 0);
            const percent = total ? Math.min(100, Math.round((sold / total) * 100)) : 0;
            const gallery = ((item as any)?.style?.gallery as string[]) || [];
            const banner = (item as any)?.style?.bannerImage;
            const image = gallery[0] || banner || "";
            const lowStock = total && percent >= 90;
            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-white/60">ID: {item.id}</p>
                  </div>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold text-white/80">
                    {(item.status || "").toLowerCase() === "activa" ? "Activa" : item.status || "Estado"}
                  </span>
                </div>
                {image ? (
                  <div className="h-52 w-full overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center bg-white/5 text-white/50">Sin imagen</div>
                )}
                <div className="space-y-3 px-4 py-4 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Precio</span>
                    <span className="font-semibold text-amber-200">VES {item.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Disponibles</span>
                    <span>{remaining} / {total || "∞"} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#3b82f6]" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Fin: {item.endDate || "Pronto"}</span>
                    {lowStock && <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-100">Quedan pocos</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
