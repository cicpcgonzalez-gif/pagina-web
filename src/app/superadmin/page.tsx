"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import { fetchAdminUsers, fetchModules, fetchRafflesLive } from "@/lib/api";
import type { AdminUser, ModuleConfig, Raffle } from "@/lib/types";

export default function SuperAdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [rafflesError, setRafflesError] = useState<string | null>(null);
  const [rafflesLoading, setRafflesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const r = getUserRole();
    setRole(r);
    if (!token) {
      setDenied(true);
      return;
    }
    if (!r || r.toLowerCase() !== "superadmin") {
      setDenied(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadModules = async () => {
      try {
        const data = await fetchModules();
        if (mounted) setModulesConfig(data || null);
      } catch (err) {
        if (mounted) setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
      }
    };

    const loadRaffles = async () => {
      setRafflesLoading(true);
      try {
        const data = await fetchRafflesLive();
        if (mounted) {
          setRaffles(data);
          setRafflesError(null);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (mounted) {
          setRaffles([]);
          setRafflesError(err instanceof Error ? err.message : "No se pudieron cargar rifas en vivo");
        }
      } finally {
        if (mounted) setRafflesLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await fetchAdminUsers();
        if (mounted) {
          setUsers(data || []);
          setUsersError(null);
        }
      } catch (err) {
        if (mounted) setUsersError(err instanceof Error ? err.message : "No se pudieron cargar usuarios");
      } finally {
        if (mounted) setUsersLoading(false);
      }
    };

    loadModules();
    loadRaffles();
    loadUsers();
    const interval = setInterval(loadRaffles, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const totals = useMemo(() => {
    const totalRaffles = raffles.length;
    const totalTickets = raffles.reduce((acc, r) => acc + (r.ticketsTotal ?? 0), 0);
    const soldTickets = raffles.reduce((acc, r) => acc + ((r.ticketsTotal ?? 0) - (r.ticketsAvailable ?? 0)), 0);
    const active = raffles.filter((r) => r.status === "activa").length;
    return { totalRaffles, totalTickets, soldTickets, active };
  }, [raffles]);

  const statusClass = (status: string) => {
    if (status === "activo") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "pendiente") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  if (denied) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 bg-night-sky text-white">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-md shadow-black/30">
          <p className="text-sm font-semibold">Acceso restringido. Se requiere rol superadmin.</p>
          <p className="mt-2 text-xs text-white/75">Rol actual: {role ?? "no autenticado"}</p>
          <p className="mt-2 text-xs text-white/75">Inicia sesión con cuenta superadmin y vuelve a intentar.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Panel superadmin</p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Gobierno total del portal.</h1>
            <p className="max-w-2xl text-white/80">
              Sólo se muestra información real proveniente de las rifas creadas por admins. Datos vivos, sin demos ni mocks.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                href="/rifas"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
              >
                Ver mural de rifas
              </Link>
            </div>
            {modulesError && <p className="text-xs text-red-200">Módulos: {modulesError}</p>}
            {modulesConfig && (
              <p className="text-xs text-white/60">Módulos activos: admin {Object.keys(modulesConfig.admin || {}).length} · superadmin {Object.keys(modulesConfig.superadmin || {}).length}</p>
            )}
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Datos en vivo</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80">15s auto-refresh</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/85 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Rifas</p>
                <p className="text-xl font-semibold text-white">{totals.totalRaffles}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Activas</p>
                <p className="text-xl font-semibold text-white">{totals.active}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Tickets totales</p>
                <p className="text-xl font-semibold text-white">{totals.totalTickets.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Tickets vendidos</p>
                <p className="text-xl font-semibold text-white">{totals.soldTickets.toLocaleString()}</p>
              </div>
            </div>
            {lastUpdated && (
              <p className="text-[11px] text-white/60">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Rifas creadas por admin</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Datos en vivo</h2>
              <p className="text-sm text-white/80">Cada tarjeta refleja el estado real de la rifa.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/raffles"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
              >
                Panel admin
              </Link>
              <Link
                href="/rifas"
                className="rounded-lg border border-[#22d3ee]/50 bg-[#22d3ee]/15 px-4 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
              >
                Ver público
              </Link>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {rafflesLoading && (
              <p className="text-sm text-white/70">Cargando rifas en vivo...</p>
            )}
            {rafflesError && (
              <p className="text-sm text-red-200">{rafflesError}. Conecta el backend y vuelve a intentar.</p>
            )}
            {!rafflesLoading && !rafflesError && raffles.length === 0 && (
              <p className="text-sm text-white/70">No hay rifas creadas por admin aún.</p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {raffles.map((raffle) => {
                const sold = (raffle.ticketsTotal ?? 0) - (raffle.ticketsAvailable ?? 0);
                const progress = raffle.ticketsTotal ? Math.min(100, Math.round((sold / raffle.ticketsTotal) * 100)) : 0;
                return (
                  <div
                    key={raffle.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                        <p className="text-xs text-white/60">ID: {raffle.id}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${raffle.status === "activa" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/15 text-white/80"}`}>
                        {raffle.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-white/80">
                      <p>Precio ticket: ${raffle.price?.toLocaleString()}</p>
                      <p>Venta: {sold.toLocaleString()} / {raffle.ticketsTotal?.toLocaleString()} tickets</p>
                      <p>Disponible: {raffle.ticketsAvailable?.toLocaleString()}</p>
                      <p>Sorteo: {raffle.drawDate}</p>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[#22d3ee]"
                        style={{ width: `${progress}%` }}
                        aria-label={`Progreso ${progress}%`}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      <Link
                        href={`/rifas/${raffle.id}`}
                        className="rounded-lg border border-white/20 px-3 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
                      >
                        Ver rifa
                      </Link>
                      <Link
                        href="/admin/raffles"
                        className="rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-3 py-2 font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
                      >
                        Editar en admin
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Usuarios (superadmin)</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Gestión en vivo</h2>
              <p className="text-sm text-white/80">Los registros provienen de /admin/users con tu token superadmin.</p>
            </div>
            <button
              onClick={() => {
                setUsersLoading(true);
                fetchAdminUsers()
                  .then((data) => {
                    setUsers(data || []);
                    setUsersError(null);
                  })
                  .catch((err) => setUsersError(err instanceof Error ? err.message : "No se pudieron cargar usuarios"))
                  .finally(() => setUsersLoading(false));
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
            >
              Refrescar
            </button>
          </div>

          {usersLoading && <p className="mt-3 text-xs text-white/60">Cargando usuarios…</p>}
          {usersError && <p className="mt-3 text-xs text-red-200">{usersError}</p>}

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-white/10 text-xs uppercase text-white/70">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status = (u.status || "").toLowerCase();
                  const roleLabel = u.role || "usuario";
                  const statusLabel = status || "desconocido";
                  return (
                    <tr key={String(u.id || u.email || Math.random())} className="border-t border-white/10">
                      <td className="px-4 py-3 font-semibold text-white">{u.name || "Sin nombre"}</td>
                      <td className="px-4 py-3">{u.email || "—"}</td>
                      <td className="px-4 py-3">{roleLabel}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(statusLabel)}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/70">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
                {!usersLoading && users.length === 0 && (
                  <tr className="border-t border-white/10">
                    <td colSpan={5} className="px-4 py-6 text-center text-white/70">
                      No hay usuarios cargados desde el backend.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
