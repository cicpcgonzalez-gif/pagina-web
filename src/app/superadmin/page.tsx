"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import {
  fetchAdminUsers,
  fetchModules,
  fetchRafflesLive,
  fetchSuperadminAudit,
  fetchSuperadminMailLogs,
  fetchSuperadminSettings,
  superadminCreateUser,
  superadminRevokeSessions,
  superadminResetTwoFactor,
  superadminUpdateUserStatus,
  fetchAnnouncements,
  deleteAnnouncement,
  deleteRaffle,
  updateSuperadminBranding,
  updateSuperadminCompany,
  updateSuperadminModules,
  updateSuperadminSMTP,
  updateSuperadminTechSupport,
} from "@/lib/api";
import type { AdminUser, ModuleConfig, Raffle } from "@/lib/types";

const defaultBranding = { title: "", tagline: "", primaryColor: "#22d3ee", secondaryColor: "#0ea5e9", logoUrl: "", bannerUrl: "", policies: "" };
const defaultCompany = { name: "", address: "", rif: "", phone: "", email: "" };
const defaultSMTP = { host: "", port: "587", user: "", pass: "", secure: false, fromName: "", fromEmail: "" };
const defaultTech = { phone: "", email: "" };

export default function SuperAdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [modulesState, setModulesState] = useState<Record<string, unknown> | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [rafflesError, setRafflesError] = useState<string | null>(null);
  const [rafflesLoading, setRafflesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [branding, setBranding] = useState(defaultBranding);
  const [companyForm, setCompanyForm] = useState(defaultCompany);
  const [smtpForm, setSmtpForm] = useState(defaultSMTP);
  const [techForm, setTechForm] = useState(defaultTech);
  const [mailLogs, setMailLogs] = useState<Array<Record<string, unknown>>>([]);
  const [auditUsers, setAuditUsers] = useState<Array<Record<string, unknown>>>([]);
  const [auditActions, setAuditActions] = useState<Array<Record<string, unknown>>>([]);
  const [announcements, setAnnouncements] = useState<Array<Record<string, unknown>>>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "user", firstName: "", lastName: "" });
  const [actingUser, setActingUser] = useState<string | number | null>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState("");
  const [deleteRaffleId, setDeleteRaffleId] = useState("");
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(false);
  const [deletingRaffle, setDeletingRaffle] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const r = getUserRole();
    setRole(r);
    if (!token || !r || r.toLowerCase() !== "superadmin") {
      setDenied(true);
    }
  }, []);

  const loadModules = useCallback(async () => {
    try {
      const data = await fetchModules();
      setModulesConfig(data || null);
      setModulesState(data || null);
    } catch (err) {
      setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
    }
  }, []);

  const loadRaffles = useCallback(async () => {
    setRafflesLoading(true);
    try {
      const data = await fetchRafflesLive();
      setRaffles(data);
      setRafflesError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setRaffles([]);
      setRafflesError(err instanceof Error ? err.message : "No se pudieron cargar rifas en vivo");
    } finally {
      setRafflesLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data || []);
      setUsersError(null);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "No se pudieron cargar usuarios");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const data = await fetchSuperadminSettings();
      setBranding({ ...defaultBranding, ...(data as any)?.branding });
      setCompanyForm({ ...defaultCompany, ...(data as any)?.company });
      setSmtpForm({ ...defaultSMTP, ...(data as any)?.smtp });
      setTechForm({ ...defaultTech, ...(data as any)?.techSupport });
      if ((data as any)?.modules) setModulesState((data as any)?.modules);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "No se pudieron cargar settings superadmin");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsError(null);
    try {
      const logs = await fetchSuperadminMailLogs();
      setMailLogs(logs || []);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : "No se pudieron cargar logs de correo");
    }
  }, []);

  const loadAudit = useCallback(async () => {
    setAuditError(null);
    try {
      const [usersLog, actionsLog] = await Promise.all([
        fetchSuperadminAudit("users"),
        fetchSuperadminAudit("actions"),
      ]);
      setAuditUsers(usersLog || []);
      setAuditActions(actionsLog || []);
    } catch (err) {
      setAuditError(err instanceof Error ? err.message : "No se pudo cargar auditoría");
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError(null);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      setAnnouncementsError(err instanceof Error ? err.message : "No se pudieron cargar anuncios");
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (denied) return;
    loadModules();
    loadRaffles();
    loadUsers();
    loadSettings();
    loadLogs();
    loadAudit();
    loadAnnouncements();
    const interval = setInterval(loadRaffles, 15000);
    return () => clearInterval(interval);
  }, [denied, loadModules, loadRaffles, loadUsers, loadSettings, loadLogs, loadAudit, loadAnnouncements]);

  const totals = useMemo(() => {
    const totalRaffles = raffles.length;
    const totalTickets = raffles.reduce((acc, r) => acc + (r.ticketsTotal ?? 0), 0);
    const soldTickets = raffles.reduce((acc, r) => acc + ((r.ticketsTotal ?? 0) - (r.ticketsAvailable ?? 0)), 0);
    const active = raffles.filter((r) => r.status === "activa").length;
    return { totalRaffles, totalTickets, soldTickets, active };
  }, [raffles]);

  const quickActions = [
    { label: "Dashboard", href: "/superadmin", color: "#22c55e" },
    { label: "Progreso", href: "/admin/raffles", color: "#2dd4bf" },
    { label: "Sorteo en Vivo", href: "/rifas", color: "#38bdf8" },
    { label: "Pagos", href: "/admin/payments", color: "#f59e0b" },
    { label: "Tickets", href: "/admin/reports", color: "#6366f1" },
    { label: "Estilo", href: "/superadmin", color: "#c084fc" },
    { label: "Novedades", href: "/superadmin", color: "#fb7185" },
    { label: "Rifas", href: "/rifas", color: "#22d3ee" },
    { label: "Métricas", href: "/admin/reports", color: "#22c55e" },
    { label: "Usuarios", href: "/admin", color: "#38bdf8" },
    { label: "Módulos", href: "/superadmin", color: "#4ade80" },
    { label: "Branding", href: "/superadmin", color: "#c084fc" },
    { label: "SMTP", href: "/superadmin", color: "#facc15" },
    { label: "Soporte", href: "/superadmin", color: "#38bdf8" },
    { label: "Logs de correo", href: "/superadmin", color: "#f472b6" },
    { label: "Auditoría", href: "/superadmin", color: "#fbbf24" },
    { label: "Acciones críticas", href: "/superadmin", color: "#ef4444" },
    { label: "Anuncios", href: "/superadmin", color: "#fb7185" },
  ];

  const statusClass = (status: string) => {
    if (status === "activo" || status === "active") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "pendiente" || status === "pending") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  const notify = (message: string, variant: "success" | "error") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleModule = async (scope: "admin" | "superadmin", key: string) => {
    const next = { ...(modulesState || {}) } as Record<string, any>;
    next[scope] = { ...(next[scope] || {}), [key]: !next[scope]?.[key] };
    setModulesState(next);
    try {
      await updateSuperadminModules(next);
      notify("Módulos actualizados", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudieron guardar módulos", "error");
    }
  };

  const saveBranding = async () => {
    try {
      await updateSuperadminBranding(branding);
      notify("Branding guardado", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo guardar branding", "error");
    }
  };

  const saveCompany = async () => {
    try {
      await updateSuperadminCompany(companyForm);
      notify("Empresa guardada", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo guardar empresa", "error");
    }
  };

  const saveSMTP = async () => {
    try {
      await updateSuperadminSMTP(smtpForm);
      notify("SMTP guardado", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo guardar SMTP", "error");
    }
  };

  const saveTech = async () => {
    try {
      await updateSuperadminTechSupport(techForm);
      notify("Soporte técnico guardado", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo guardar soporte", "error");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return notify("Email y contraseña son requeridos", "error");
    setCreatingUser(true);
    try {
      await superadminCreateUser(newUser);
      notify("Usuario creado", "success");
      setNewUser({ email: "", password: "", role: "user", firstName: "", lastName: "" });
      loadUsers();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo crear usuario", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  const patchUser = async (id: string | number, patch: Record<string, unknown>, success: string) => {
    setActingUser(id);
    try {
      await superadminUpdateUserStatus(id, patch);
      notify(success, "success");
      loadUsers();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Acción no aplicada", "error");
    } finally {
      setActingUser(null);
    }
  };

  const handleDeleteAnnouncement = async (idOverride?: string | number) => {
    const targetId = idOverride ?? deleteAnnouncementId;
    if (!targetId) return notify("Ingresa el ID del anuncio", "error");
    setDeletingAnnouncement(true);
    try {
      await deleteAnnouncement(targetId);
      notify("Anuncio eliminado", "success");
      setDeleteAnnouncementId("");
      loadAnnouncements();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo eliminar el anuncio", "error");
    } finally {
      setDeletingAnnouncement(false);
    }
  };

  const handleDeleteRaffle = async (idOverride?: string | number) => {
    const targetId = idOverride ?? deleteRaffleId;
    if (!targetId) return notify("Ingresa el ID de la rifa", "error");
    setDeletingRaffle(true);
    try {
      await deleteRaffle(targetId);
      notify("Rifa eliminada", "success");
      setDeleteRaffleId("");
      loadRaffles();
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo eliminar la rifa", "error");
    } finally {
      setDeletingRaffle(false);
    }
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
      {toast && (
        <div className="fixed right-4 top-4 z-30 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-lg shadow-black/40 backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${toast.variant === "success" ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span>{toast.message}</span>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Panel superadmin</p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Gobierno total del portal.</h1>
            <p className="max-w-2xl text-white/80">Sin mocks: datos vivos de rifas, usuarios y configuración crítica.</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                href="/rifas"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
              >
                Ver mural de rifas
              </Link>
              <button
                onClick={() => {
                  loadRaffles();
                  loadUsers();
                  loadSettings();
                  loadLogs();
                  loadAudit();
                }}
                className="rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/15 px-4 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
              >
                Refrescar todo
              </button>
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
              {[{ label: "Rifas", value: totals.totalRaffles }, { label: "Activas", value: totals.active }, { label: "Tickets", value: totals.totalTickets.toLocaleString() }, { label: "Vendidos", value: totals.soldTickets.toLocaleString() }].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">{card.label}</p>
                  <p className="text-xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
            {lastUpdated && <p className="text-[11px] text-white/60">Última actualización: {lastUpdated.toLocaleTimeString()}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Menú principal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Accesos rápidos</h2>
            <p className="text-sm text-white/75">Solo botones, sin vistas de prueba.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((qa) => (
                <Link
                  key={qa.label}
                  href={qa.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white transition hover:-translate-y-[1px] hover:border-white/30"
                >
                  <div>
                    <p className="text-xs text-white/60">Superadmin</p>
                    <p className="text-sm font-semibold text-white">{qa.label}</p>
                  </div>
                  <span className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: qa.color, opacity: 0.3 }} />
                </Link>
              ))}
            </div>
          </section>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {["user", "admin", "superadmin"].map((r) => (
                  <button key={r} onClick={() => setNewUser((s) => ({ ...s, role: r }))} className={`flex-1 rounded-md border px-2 py-2 font-semibold transition ${newUser.role === r ? "border-[#22d3ee] bg-[#22d3ee]/20" : "border-white/20 bg-white/5 text-white/80"}`}>
                    {r}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="mt-3 w-full rounded-lg bg-[#22d3ee] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:opacity-70"
              >
                {creatingUser ? "Creando..." : "Crear usuario"}
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
              {usersLoading && <p className="px-4 py-3 text-xs text-white/60">Cargando usuarios…</p>}
              {usersError && <p className="px-4 py-3 text-xs text-red-200">{usersError}</p>}
              <table className="w-full text-left text-sm text-white/80">
                <thead className="bg-white/10 text-xs uppercase text-white/70">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const status = (u.status || "").toLowerCase();
                    return (
                      <tr key={String(u.id || u.email)} className="border-t border-white/10">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{u.name || u.email || "Sin nombre"}</p>
                          <p className="text-xs text-white/60">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{u.role || "usuario"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(status)}`}>{status || "desconocido"}</span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => patchUser(u.id || u.email || "", { active: status !== "activo" && status !== "active" ? true : false }, status !== "activo" && status !== "active" ? "Usuario activado" : "Usuario desactivado")} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                              {actingUser === u.id ? "..." : status !== "activo" && status !== "active" ? "Activar" : "Desactivar"}
                            </button>
                            <button onClick={() => patchUser(u.id || u.email || "", { verified: !(u as any)?.verified }, (u as any)?.verified ? "Verificación removida" : "Usuario verificado")} className="rounded-md border border-amber-300/50 px-2 py-1 text-amber-100 transition hover:border-amber-200/70">
                              {actingUser === u.id ? "..." : (u as any)?.verified ? "Desverificar" : "Verificar"}
                            </button>
                            <button onClick={() => patchUser(u.id || u.email || "", { role: "admin" }, "Rol actualizado") } className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                              {actingUser === u.id ? "..." : "Set admin"}
                            </button>
                            <button onClick={() => superadminResetTwoFactor(u.id || "").then(() => notify("2FA reseteado", "success"))} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                              Reset 2FA
                            </button>
                            <button onClick={() => superadminRevokeSessions(u.id || "").then(() => notify("Sesiones revocadas", "success"))} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                              Revocar sesiones
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!usersLoading && users.length === 0 && (
                    <tr className="border-t border-white/10">
                      <td colSpan={4} className="px-4 py-6 text-center text-white/70">No hay usuarios cargados desde el backend.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
