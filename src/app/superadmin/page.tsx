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
  adminCreateRaffle,
} from "@/lib/api";
import type { AdminUser, ModuleConfig, Raffle } from "@/lib/types";

const defaultBranding = { title: "", tagline: "", primaryColor: "#22d3ee", secondaryColor: "#0ea5e9", logoUrl: "", bannerUrl: "", policies: "" };
const defaultCompany = { name: "", address: "", rif: "", phone: "", email: "" };
const defaultSMTP = { host: "", port: "587", user: "", pass: "", secure: false, fromName: "", fromEmail: "" };
const defaultTech = { phone: "", email: "" };
const defaultRaffleForm = { title: "", description: "", price: "" as number | "", totalTickets: "" as number | "", drawDate: "", endDate: "", status: "activa" };

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
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [raffleTab, setRaffleTab] = useState<"list" | "create">("list");
  const [raffleForm, setRaffleForm] = useState(defaultRaffleForm);
  const [raffleFlyer, setRaffleFlyer] = useState<File | null>(null);
  const [raffleImages, setRaffleImages] = useState<File[]>([]);
  const [rafflePreviews, setRafflePreviews] = useState<Array<{ url: string; name: string; sizeKb: number; width?: number; height?: number }>>([]);
  const [raffleError, setRaffleError] = useState<string | null>(null);
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const r = getUserRole();
    setRole(r);
    if (!token || !r) {
      setDenied(true);
      return;
    }
    setDenied(false);
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

  const revokePreviews = useCallback(() => {
    rafflePreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [rafflePreviews]);

  const resizeImageFile = useCallback((file: File) => {
    return new Promise<File>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1280;
        const maxH = 1280;
        const ratio = Math.min(1, maxW / img.width, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type || "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          0.72
        );
      };
      img.onerror = () => resolve(file);
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImagesSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      setRaffleError(null);
      revokePreviews();
      const raw = Array.from(files).slice(0, 3);
      const resized = await Promise.all(raw.map((f) => resizeImageFile(f)));
      const previews = await Promise.all(
        resized.map(
          (file) =>
            new Promise<{ url: string; name: string; sizeKb: number; width?: number; height?: number }>((resolve) => {
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                resolve({ url, name: file.name, sizeKb: Math.round(file.size / 1024), width: img.width, height: img.height });
              };
              img.onerror = () => resolve({ url, name: file.name, sizeKb: Math.round(file.size / 1024) });
              img.src = url;
            })
        )
      );
      setRaffleImages(resized);
      setRafflePreviews(previews);
      if (files.length > 3) setRaffleError("Máximo 3 fotos. Se tomaron las primeras 3.");
    },
    [revokePreviews, resizeImageFile]
  );

  const resetRaffleForm = useCallback(() => {
    revokePreviews();
    setRaffleForm(defaultRaffleForm);
    setRaffleFlyer(null);
    setRaffleImages([]);
    setRafflePreviews([]);
    setRaffleError(null);
  }, [revokePreviews]);

  const submitRaffle = useCallback(async () => {
    setRaffleError(null);
    const token = getAuthToken();
    if (!token) {
      setRaffleError("Sesión expirada. Inicia sesión de admin/superadmin.");
      return;
    }
    if (!raffleForm.title.trim()) {
      setRaffleError("Título es obligatorio.");
      return;
    }
    const price = Number(raffleForm.price);
    if (!Number.isFinite(price) || price <= 0) {
      setRaffleError("Precio debe ser mayor a 0.");
      return;
    }
    const totalTickets = Number(raffleForm.totalTickets);
    if (!Number.isFinite(totalTickets) || totalTickets <= 0) {
      setRaffleError("Total de tickets debe ser mayor a 0.");
      return;
    }
    setRaffleSubmitting(true);
    try {
      await adminCreateRaffle({
        title: raffleForm.title,
        description: raffleForm.description,
        price,
        totalTickets,
        drawDate: raffleForm.drawDate,
        endDate: raffleForm.endDate,
        status: raffleForm.status,
        flyer: raffleFlyer,
        images: raffleImages,
      });
      notify("Rifa creada", "success");
      resetRaffleForm();
      setRaffleTab("list");
      loadRaffles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo crear la rifa";
      if (msg.toLowerCase().includes("token")) {
        setRaffleError("Sesión inválida o expirada. Inicia sesión nuevamente.");
      } else {
        setRaffleError(msg);
      }
    } finally {
      setRaffleSubmitting(false);
    }
  }, [raffleForm, raffleFlyer, raffleImages, resetRaffleForm, loadRaffles]);

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

  const isSuperadmin = role?.toLowerCase() === "superadmin";

  useEffect(() => {
    if (denied) return;
    loadModules();
    loadRaffles();
    loadSettings();
    if (isSuperadmin) {
      loadUsers();
      loadLogs();
      loadAudit();
      loadAnnouncements();
    }
    const interval = setInterval(loadRaffles, 15000);
    return () => clearInterval(interval);
  }, [denied, isSuperadmin, loadModules, loadRaffles, loadUsers, loadSettings, loadLogs, loadAudit, loadAnnouncements]);

  const totals = useMemo(() => {
    const totalRaffles = raffles.length;
    const totalTickets = raffles.reduce((acc, r) => acc + (r.ticketsTotal ?? 0), 0);
    const soldTickets = raffles.reduce((acc, r) => acc + ((r.ticketsTotal ?? 0) - (r.ticketsAvailable ?? 0)), 0);
    const active = raffles.filter((r) => r.status === "activa").length;
    return { totalRaffles, totalTickets, soldTickets, active };
  }, [raffles]);

  const activeRaffles = useMemo(() => raffles.filter((r) => r.status === "activa"), [raffles]);

  const activeStats = useMemo(() => {
    const totalTickets = activeRaffles.reduce((acc, r) => acc + (r.ticketsTotal ?? 0), 0);
    const soldTickets = activeRaffles.reduce((acc, r) => acc + ((r.ticketsTotal ?? 0) - (r.ticketsAvailable ?? 0)), 0);
    const percent = totalTickets ? Math.round((soldTickets / totalTickets) * 100) : 0;
    const upcomingCount = activeRaffles.filter((r) => {
      if (!r.drawDate) return false;
      const draw = new Date(r.drawDate).getTime();
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      return draw - now <= threeDays && draw - now > 0;
    }).length;
    return { count: activeRaffles.length, totalTickets, soldTickets, percent, upcomingCount };
  }, [activeRaffles]);

  const exportActiveCSV = useCallback(() => {
    if (!activeRaffles.length) {
      notify("No hay rifas activas para exportar", "error");
      return;
    }
    const headers = ["id", "titulo", "status", "precio", "ticketsTotales", "ticketsDisponibles", "ticketsVendidos", "porcentaje", "fechaSorteo"];
    const rows = activeRaffles.map((r) => {
      const total = r.ticketsTotal ?? 0;
      const avail = r.ticketsAvailable ?? 0;
      const sold = total - avail;
      const percent = total ? Math.round((sold / total) * 100) : 0;
      return [r.id, r.title, r.status, r.price ?? 0, total, avail, sold, `${percent}%`, r.drawDate ?? ""].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rifas_activas.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("CSV exportado", "success");
  }, [activeRaffles]);

  const quickActions: Array<{ label: string; color: string; panel?: string }> = useMemo(() => {
    const base = [
      { label: "Dashboard", panel: "dashboard", color: "#22c55e" },
      { label: "Progreso", panel: "auditoriaRifas", color: "#2dd4bf" },
      { label: "Estilo", panel: "branding", color: "#c084fc" },
      { label: "Novedades", panel: "novedades", color: "#fb7185" },
      { label: "Rifas", panel: "rifas", color: "#22d3ee" },
    ];

    if (isSuperadmin) {
      base.push(
        { label: "Usuarios", panel: "usuarios", color: "#38bdf8" },
        { label: "Módulos", panel: "modulos", color: "#4ade80" },
        { label: "SMTP", panel: "smtp", color: "#facc15" },
        { label: "Soporte", panel: "soporte", color: "#38bdf8" },
        { label: "Logs de correo", panel: "logs", color: "#f472b6" },
        { label: "Auditoría", panel: "auditoria", color: "#fbbf24" },
        { label: "Auditoría rifas", panel: "auditoriaRifas", color: "#22d3ee" },
        { label: "Acciones críticas", panel: "criticas", color: "#ef4444" },
        { label: "Anuncios", panel: "novedades", color: "#fb7185" }
      );
    }

    return base;
  }, [isSuperadmin]);

  const allowedPanels = useMemo(() => new Set(quickActions.filter((q) => q.panel).map((q) => q.panel as string)), [quickActions]);

  const renderPanel = () => {
    if (activePanel && !allowedPanels.has(activePanel)) return null;
    switch (activePanel) {
      case "dashboard":
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Dashboard</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Estado general</h2>
                <p className="text-sm text-white/80">Totales en vivo del backend.</p>
              </div>
              <button
                onClick={() => {
                  loadRaffles();
                  loadUsers();
                  loadSettings();
                  loadLogs();
                  loadAudit();
                  loadAnnouncements();
                }}
                className="rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/15 px-4 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
              >
                Refrescar todo
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[{ label: "Rifas", value: totals.totalRaffles }, { label: "Activas", value: totals.active }, { label: "Tickets", value: totals.totalTickets.toLocaleString() }, { label: "Vendidos", value: totals.soldTickets.toLocaleString() }].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">{card.label}</p>
                  <p className="text-2xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
            {lastUpdated && <p className="mt-3 text-[11px] text-white/60">Última actualización: {lastUpdated.toLocaleTimeString()}</p>}
          </section>
        );

      case "auditoriaRifas":
        if (!isSuperadmin) return null;
        const sortedActive = [...activeRaffles].sort((a, b) => {
          const atotal = a.ticketsTotal ?? 0;
          const btotal = b.ticketsTotal ?? 0;
          const asold = atotal - (a.ticketsAvailable ?? 0);
          const bsold = btotal - (b.ticketsAvailable ?? 0);
          const aperc = atotal ? asold / atotal : 0;
          const bperc = btotal ? bsold / btotal : 0;
          return bperc - aperc;
        });
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Auditoría de rifas</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Control absoluto (solo superadmin)</h2>
                <p className="text-sm text-white/80">Métricas globales y lista detallada de rifas activas.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportActiveCSV}
                  className="rounded-lg border border-[#22d3ee]/50 bg-[#22d3ee]/20 px-4 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={loadRaffles}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
                >
                  Refrescar
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[{ label: "Rifas activas", value: activeStats.count }, { label: "Tickets vendidos", value: activeStats.soldTickets.toLocaleString() }, { label: "% vendido global", value: `${activeStats.percent}%` }, { label: "Sorteos <3 días", value: activeStats.upcomingCount }].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/60">{card.label}</p>
                  <p className="text-2xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {activeRaffles.length === 0 && <p className="text-sm text-white/70">No hay rifas activas.</p>}
              {sortedActive.map((raffle) => {
                const total = raffle.ticketsTotal ?? 0;
                const avail = raffle.ticketsAvailable ?? 0;
                const sold = total - avail;
                const progress = total ? Math.min(100, Math.round((sold / total) * 100)) : 0;
                const drawTime = raffle.drawDate ? new Date(raffle.drawDate).getTime() : null;
                const daysLeft = drawTime ? Math.ceil((drawTime - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                const risk = (() => {
                  if (daysLeft !== null && daysLeft <= 3 && progress < 20) return "alto";
                  if (daysLeft !== null && daysLeft <= 7 && progress < 50) return "medio";
                  return "bajo";
                })();
                const gallery = ((raffle as any)?.style?.gallery as string[]) || [];
                const banner = (raffle as any)?.style?.bannerImage;
                const visuals = gallery.length ? gallery.slice(0, 3) : banner ? [banner] : [];
                const isExpired = raffle.endDate ? new Date(raffle.endDate).getTime() < Date.now() : false;
                const statusLabel = isExpired ? "cerrada" : raffle.status;
                return (
                  <div key={raffle.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                        <p className="text-xs text-white/60">ID: {raffle.id}</p>
                        <p className="text-xs text-white/60">Sorteo: {raffle.drawDate || "Sin fecha"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusLabel === "activa" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/15 text-white/80"}`}>{statusLabel}</span>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${risk === "alto" ? "bg-red-500/20 text-red-100" : risk === "medio" ? "bg-amber-500/20 text-amber-100" : "bg-white/15 text-white/80"}`}>
                          Riesgo {risk}
                        </span>
                      </div>
                    </div>

                    {visuals.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 text-[0] snap-x snap-mandatory">
                        {visuals.map((src) => (
                          <div key={src} className="min-w-[180px] snap-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={raffle.title} className="h-28 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 grid gap-2 text-sm text-white/80 sm:grid-cols-2 lg:grid-cols-4">
                      <p><span className="text-white/60">Precio:</span> ${raffle.price?.toLocaleString()}</p>
                      <p><span className="text-white/60">Tickets:</span> {sold.toLocaleString()} vendidos / {total.toLocaleString()}</p>
                      <p><span className="text-white/60">Disponibles:</span> {avail.toLocaleString()}</p>
                      <p><span className="text-white/60">% vendido:</span> {progress}%</p>
                    </div>

                    {daysLeft !== null && <p className="mt-1 text-xs text-white/60">Días restantes: {daysLeft}</p>}

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-[#22d3ee]" style={{ width: `${progress}%` }} aria-label={`Progreso ${progress}%`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "branding":
        return (
          <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Branding y estilo</p>
              <div className="grid gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Branding</p>
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Título" value={branding.title} onChange={(e) => setBranding((s) => ({ ...s, title: e.target.value }))} />
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Tagline" value={branding.tagline} onChange={(e) => setBranding((s) => ({ ...s, tagline: e.target.value }))} />
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Color primario" value={branding.primaryColor} onChange={(e) => setBranding((s) => ({ ...s, primaryColor: e.target.value }))} />
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Color secundario" value={branding.secondaryColor} onChange={(e) => setBranding((s) => ({ ...s, secondaryColor: e.target.value }))} />
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Logo URL" value={branding.logoUrl} onChange={(e) => setBranding((s) => ({ ...s, logoUrl: e.target.value }))} />
                  <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Banner URL" value={branding.bannerUrl} onChange={(e) => setBranding((s) => ({ ...s, bannerUrl: e.target.value }))} />
                  <textarea className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Políticas" value={branding.policies} onChange={(e) => setBranding((s) => ({ ...s, policies: e.target.value }))} />
                  <button onClick={saveBranding} className="mt-3 w-full rounded-lg bg-[#22d3ee] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">Guardar branding</button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Empresa</p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Datos legales</p>
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Nombre" value={companyForm.name} onChange={(e) => setCompanyForm((s) => ({ ...s, name: e.target.value }))} />
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Dirección" value={companyForm.address} onChange={(e) => setCompanyForm((s) => ({ ...s, address: e.target.value }))} />
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="RIF" value={companyForm.rif} onChange={(e) => setCompanyForm((s) => ({ ...s, rif: e.target.value }))} />
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Teléfono" value={companyForm.phone} onChange={(e) => setCompanyForm((s) => ({ ...s, phone: e.target.value }))} />
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Email" value={companyForm.email} onChange={(e) => setCompanyForm((s) => ({ ...s, email: e.target.value }))} />
                <button onClick={saveCompany} className="mt-3 w-full rounded-lg bg-[#22c55e] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">Guardar empresa</button>
              </div>
              {settingsLoading && <p className="text-xs text-white/60">Cargando configuración…</p>}
              {settingsError && <p className="text-xs text-red-200">{settingsError}</p>}
            </div>
          </section>
        );

      case "smtp":
        if (!isSuperadmin) return null;
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Correo SMTP</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Credenciales y remitente</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Host" value={smtpForm.host} onChange={(e) => setSmtpForm((s) => ({ ...s, host: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Puerto" value={smtpForm.port} onChange={(e) => setSmtpForm((s) => ({ ...s, port: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Usuario" value={smtpForm.user} onChange={(e) => setSmtpForm((s) => ({ ...s, user: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Contraseña" value={smtpForm.pass} onChange={(e) => setSmtpForm((s) => ({ ...s, pass: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="From name" value={smtpForm.fromName} onChange={(e) => setSmtpForm((s) => ({ ...s, fromName: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="From email" value={smtpForm.fromEmail} onChange={(e) => setSmtpForm((s) => ({ ...s, fromEmail: e.target.value }))} />
            </div>
            <button onClick={saveSMTP} className="mt-4 w-full rounded-lg bg-[#facc15] px-3 py-2 text-sm font-semibold text-night shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">Guardar SMTP</button>
            {settingsLoading && <p className="mt-2 text-xs text-white/60">Cargando configuración…</p>}
            {settingsError && <p className="mt-2 text-xs text-red-200">{settingsError}</p>}
          </section>
        );

      case "soporte":
        if (!isSuperadmin) return null;
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Soporte técnico</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Contacto para clientes</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Teléfono" value={techForm.phone} onChange={(e) => setTechForm((s) => ({ ...s, phone: e.target.value }))} />
              <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Email" value={techForm.email} onChange={(e) => setTechForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <button onClick={saveTech} className="mt-4 w-full rounded-lg bg-[#3b82f6] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">Guardar soporte</button>
            {settingsLoading && <p className="mt-2 text-xs text-white/60">Cargando configuración…</p>}
            {settingsError && <p className="mt-2 text-xs text-red-200">{settingsError}</p>}
          </section>
        );

      case "logs":
        if (!isSuperadmin) return null;
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Logs de correo</p>
                <p className="text-sm text-white/75">Últimos envíos y estado.</p>
              </div>
              <button onClick={loadLogs} className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60">Refrescar</button>
            </div>
            {logsError && <p className="mt-2 text-xs text-red-200">{logsError}</p>}
            <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
              {mailLogs.map((log, idx) => (
                <div key={idx} className="border-b border-white/10 py-2 last:border-none">
                  <p className="font-semibold text-white">{(log as any)?.subject || (log as any)?.title || "Sin asunto"}</p>
                  <p className="text-white/60">Para: {(log as any)?.to || (log as any)?.email || "N/D"}</p>
                  <p className="text-white/60">Estado: {(log as any)?.status || "desconocido"}</p>
                </div>
              ))}
              {!mailLogs.length && <p className="text-white/60">Sin logs cargados.</p>}
            </div>
          </section>
        );

      case "novedades":
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Novedades</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Anuncios publicados</h2>
                <p className="text-sm text-white/80">Lista en vivo; puedes borrar uno por ID.</p>
              </div>
              <button
                onClick={loadAnnouncements}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
              >
                Refrescar
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.4fr]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
                <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 bg-white/10">
                  <span>Listado</span>
                  {announcementsLoading && <span className="text-xs text-white/60">Cargando…</span>}
                  {announcementsError && <span className="text-xs text-red-200">{announcementsError}</span>}
                </div>
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-white/10 text-xs uppercase text-white/70">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Título</th>
                      <th className="px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((a, idx) => (
                      <tr key={String((a as any)?.id ?? idx)} className="border-t border-white/10">
                        <td className="px-4 py-2 font-semibold text-white">{(a as any)?.id ?? idx}</td>
                        <td className="px-4 py-2">{(a as any)?.title || "(sin título)"}</td>
                        <td className="px-4 py-2 text-xs">
                          <button
                            onClick={() => handleDeleteAnnouncement((a as any)?.id)}
                            className="rounded-md border border-white/20 px-2 py-1 text-rose-100 transition hover:border-rose-200/60"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!announcements.length && !announcementsLoading && (
                      <tr className="border-t border-white/10">
                        <td colSpan={3} className="px-4 py-4 text-center text-white/60">Sin anuncios cargados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
                <p className="text-sm font-semibold text-white">Eliminar anuncio por ID</p>
                <input
                  className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white"
                  placeholder="ID del anuncio"
                  value={deleteAnnouncementId}
                  onChange={(e) => setDeleteAnnouncementId(e.target.value)}
                />
                <button
                  onClick={() => handleDeleteAnnouncement()}
                  disabled={deletingAnnouncement}
                  className="mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-night shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:opacity-70"
                >
                  {deletingAnnouncement ? "Eliminando..." : "Eliminar anuncio"}
                </button>
              </div>
            </div>
          </section>
        );

      case "modulos":
        if (!isSuperadmin) return null;
        return (
          <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">Módulos</p>
                  <p className="text-sm text-white/75">Activa/desactiva capacidades para admin y superadmin.</p>
                </div>
                {modulesState && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">{Object.keys(modulesState).length} grupos</span>}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["admin", "superadmin"].map((scope) => (
                  <div key={scope} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{scope === "admin" ? "Admin" : "Superadmin"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {Object.entries((modulesState as any)?.[scope] || {}).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => toggleModule(scope as "admin" | "superadmin", key)}
                          className={`rounded-full border px-3 py-1 font-semibold transition hover:-translate-y-[1px] ${value ? "border-emerald-200/40 bg-emerald-500/15 text-emerald-100" : "border-white/20 bg-white/10 text-white/75"}`}
                        >
                          {key}
                        </button>
                      ))}
                      {!modulesState && <span className="text-white/60">Sin datos de módulos.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Logs de correo</p>
                <button onClick={loadLogs} className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60">Refrescar</button>
              </div>
              {logsError && <p className="text-xs text-red-200">{logsError}</p>}
              <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                {mailLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-white/10 py-2 last:border-none">
                    <p className="font-semibold text-white">{(log as any)?.subject || (log as any)?.title || "Sin asunto"}</p>
                    <p className="text-white/60">Para: {(log as any)?.to || (log as any)?.email || "N/D"}</p>
                    <p className="text-white/60">Estado: {(log as any)?.status || "desconocido"}</p>
                  </div>
                ))}
                {!mailLogs.length && <p className="text-white/60">Sin logs cargados.</p>}
              </div>
            </div>
          </section>
        );

      case "auditoria":
        if (!isSuperadmin) return null;
        return (
          <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20 lg:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Auditoría usuarios</p>
                <button onClick={loadAudit} className="rounded-md border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60">Refrescar</button>
              </div>
              {auditError && <p className="text-xs text-red-200">{auditError}</p>}
              <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                {auditUsers.map((row, idx) => (
                  <div key={idx} className="border-b border-white/10 py-2 last:border-none">
                    <p className="font-semibold text-white">{(row as any)?.action || (row as any)?.event || "Acción"}</p>
                    <p className="text-white/60">Usuario: {(row as any)?.user || (row as any)?.email || "N/D"}</p>
                    <p className="text-white/60">Fecha: {(row as any)?.createdAt || (row as any)?.date || "—"}</p>
                  </div>
                ))}
                {!auditUsers.length && <p className="text-white/60">Sin auditoría de usuarios.</p>}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Auditoría acciones críticas</p>
              <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                {auditActions.map((row, idx) => (
                  <div key={idx} className="border-b border-white/10 py-2 last:border-none">
                    <p className="font-semibold text-white">{(row as any)?.action || (row as any)?.event || "Acción"}</p>
                    <p className="text-white/60">Actor: {(row as any)?.user || (row as any)?.email || "N/D"}</p>
                    <p className="text-white/60">Detalle: {(row as any)?.detail || (row as any)?.description || "—"}</p>
                  </div>
                ))}
                {!auditActions.length && <p className="text-white/60">Sin acciones registradas.</p>}
              </div>
            </div>
          </section>
        );

      case "criticas":
        if (!isSuperadmin) return null;
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Acciones críticas</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Borrar rifas y anuncios</h2>
                <p className="text-sm text-white/80">Mismo set de acciones duras del superadmin móvil. Ejecuta contra backend real.</p>
              </div>
              <button
                onClick={() => {
                  loadAnnouncements();
                  loadRaffles();
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
              >
                Refrescar datos
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Eliminar rifa</p>
                <p className="text-xs text-white/60">ID de rifa exacto (se elimina definitivamente).</p>
                <input
                  className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white"
                  placeholder="ID de la rifa"
                  value={deleteRaffleId}
                  onChange={(e) => setDeleteRaffleId(e.target.value)}
                />
                <button
                  onClick={() => handleDeleteRaffle()}
                  disabled={deletingRaffle}
                  className="mt-3 w-full rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:opacity-70"
                >
                  {deletingRaffle ? "Eliminando..." : "Eliminar rifa"}
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Eliminar anuncio</p>
                <p className="text-xs text-white/60">ID de anuncio (sección novedades).</p>
                <input
                  className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white"
                  placeholder="ID del anuncio"
                  value={deleteAnnouncementId}
                  onChange={(e) => setDeleteAnnouncementId(e.target.value)}
                />
                <button
                  onClick={() => handleDeleteAnnouncement()}
                  disabled={deletingAnnouncement}
                  className="mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-night shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:opacity-70"
                >
                  {deletingAnnouncement ? "Eliminando..." : "Eliminar anuncio"}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Listado de anuncios</p>
                {announcementsLoading && <span className="text-xs text-white/60">Cargando…</span>}
                {announcementsError && <span className="text-xs text-red-200">{announcementsError}</span>}
              </div>
              <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-white/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-white/10 text-xs uppercase text-white/70">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Título</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((a, idx) => (
                      <tr key={String((a as any)?.id ?? idx)} className="border-t border-white/10">
                        <td className="px-3 py-2 font-semibold text-white">{(a as any)?.id ?? idx}</td>
                        <td className="px-3 py-2">{(a as any)?.title || "(sin título)"}</td>
                        <td className="px-3 py-2 text-xs">
                          <button
                            onClick={() => handleDeleteAnnouncement((a as any)?.id)}
                            className="rounded-md border border-white/20 px-2 py-1 text-rose-100 transition hover:border-rose-200/60"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!announcements.length && !announcementsLoading && (
                      <tr className="border-t border-white/10">
                        <td colSpan={3} className="px-3 py-4 text-center text-white/60">Sin anuncios cargados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );

      case "usuarios":
        if (!isSuperadmin) return null;
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Usuarios (superadmin)</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Gestión en vivo</h2>
                <p className="text-sm text-white/80">Crea cuentas y controla estado/seguridad.</p>
              </div>
              <button
                onClick={loadUsers}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
              >
                Refrescar
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Crear usuario</p>
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))} />
                <input className="mt-2 w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Contraseña" value={newUser.password} onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Nombre" value={newUser.firstName} onChange={(e) => setNewUser((s) => ({ ...s, firstName: e.target.value }))} />
                  <input className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white" placeholder="Apellido" value={newUser.lastName} onChange={(e) => setNewUser((s) => ({ ...s, lastName: e.target.value }))} />
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
        );

      case "rifas":
        return (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Progreso de rifas</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Estado en vivo</h2>
                <p className="text-sm text-white/80">Ventas, progreso y accesos a cada rifa.</p>
              </div>
              <div className="flex gap-2 text-sm">
                {[{ id: "list", label: "Rifas activas" }, { id: "create", label: "Crear rifa" }].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRaffleTab(tab.id as typeof raffleTab)}
                    className={`rounded-lg border px-4 py-2 font-semibold transition ${
                      raffleTab === tab.id ? "border-[#22d3ee]/70 bg-[#22d3ee]/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {raffleTab === "list" && (
              <div className="mt-6 space-y-4">
                {rafflesLoading && <p className="text-sm text-white/70">Cargando rifas en vivo...</p>}
                {rafflesError && <p className="text-sm text-red-200">{rafflesError}. Conecta el backend y vuelve a intentar.</p>}
                {!rafflesLoading && !rafflesError && raffles.length === 0 && <p className="text-sm text-white/70">No hay rifas creadas por admin aún.</p>}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {raffles.map((raffle) => {
                    const sold = (raffle.ticketsTotal ?? 0) - (raffle.ticketsAvailable ?? 0);
                    const progress = raffle.ticketsTotal ? Math.min(100, Math.round((sold / raffle.ticketsTotal) * 100)) : 0;
                    const gallery = ((raffle as any)?.style?.gallery as string[]) || [];
                    const banner = (raffle as any)?.style?.bannerImage;
                    const visuals = gallery.length ? gallery.slice(0, 3) : banner ? [banner] : [];
                    const isExpired = raffle.endDate ? new Date(raffle.endDate).getTime() < Date.now() : false;
                    const statusLabel = isExpired ? "cerrada" : raffle.status;

                    return (
                      <div key={raffle.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                            <p className="text-xs text-white/60">ID: {raffle.id}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusLabel === "activa" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/15 text-white/80"}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {visuals.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 text-[0] snap-x snap-mandatory">
                            {visuals.map((src) => (
                              <div key={src} className="min-w-[180px] snap-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt={raffle.title} className="h-28 w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1 text-sm text-white/80">
                          <p>Precio ticket: ${raffle.price?.toLocaleString()}</p>
                          <p>Venta: {sold.toLocaleString()} / {raffle.ticketsTotal?.toLocaleString()} tickets</p>
                          <p>Disponible: {raffle.ticketsAvailable?.toLocaleString()}</p>
                          <p>Inicio: {raffle.drawDate || ""}</p>
                          <p>Fin: {raffle.endDate || ""}</p>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-[#22d3ee]" style={{ width: `${progress}%` }} aria-label={`Progreso ${progress}%`} />
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
            )}

            {raffleTab === "create" && (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="space-y-1 text-sm text-white/80">
                      <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Título *</span>
                      <input
                        value={raffleForm.title}
                        onChange={(e) => setRaffleForm((s) => ({ ...s, title: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        placeholder="Rifa especial"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-white/80">
                      <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Descripción</span>
                      <textarea
                        value={raffleForm.description}
                        onChange={(e) => setRaffleForm((s) => ({ ...s, description: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        rows={4}
                        placeholder="Detalles, premios, condiciones"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-sm text-white/80">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Precio *</span>
                        <input
                          type="number"
                          min={0}
                          value={raffleForm.price === "" ? "" : raffleForm.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRaffleForm((s) => ({ ...s, price: val === "" ? "" : Number(val) }));
                          }}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-white/80">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Tickets *</span>
                        <input
                          type="number"
                          min={1}
                          value={raffleForm.totalTickets === "" ? "" : raffleForm.totalTickets}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRaffleForm((s) => ({ ...s, totalTickets: val === "" ? "" : Number(val) }));
                          }}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="space-y-1 text-sm text-white/80">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Fecha inicio</span>
                        <input
                          type="datetime-local"
                          value={raffleForm.drawDate}
                          onChange={(e) => setRaffleForm((s) => ({ ...s, drawDate: e.target.value }))}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-white/80">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Fecha fin</span>
                        <input
                          type="datetime-local"
                          value={raffleForm.endDate}
                          onChange={(e) => setRaffleForm((s) => ({ ...s, endDate: e.target.value }))}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-white/80">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Estado</span>
                        <select
                          value={raffleForm.status}
                          onChange={(e) => setRaffleForm((s) => ({ ...s, status: e.target.value }))}
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none bg-transparent"
                        >
                          <option value="activa" className="bg-[#0b1224]">Activa</option>
                          <option value="borrador" className="bg-[#0b1224]">Borrador</option>
                          <option value="pausada" className="bg-[#0b1224]">Pausada</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="space-y-1 text-sm text-white/80">
                      <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Flyer (se optimiza automáticamente)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null;
                          if (!file) {
                            setRaffleFlyer(null);
                            return;
                          }
                          const resized = await resizeImageFile(file);
                          setRaffleFlyer(resized);
                        }}
                        className="w-full text-xs text-white/70"
                      />
                    </label>

                    <label className="space-y-1 text-sm text-white/80">
                      <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Galería (máximo 3 fotos, 2MB c/u)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImagesSelect(e.target.files)}
                        className="w-full text-xs text-white/70"
                      />
                    </label>

                    {rafflePreviews.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 text-[0] snap-x snap-mandatory">
                        {rafflePreviews.map((img) => (
                          <div key={img.url} className="min-w-[140px] snap-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 text-left text-xs text-white/70">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt={img.name} className="h-24 w-full rounded-lg object-cover" />
                            <p className="mt-1 truncate">{img.name}</p>
                            <p>{img.sizeKb} KB {img.width && img.height ? `(${img.width}x${img.height})` : ""}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {raffleError && <p className="text-sm text-red-200">{raffleError}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={submitRaffle}
                    disabled={raffleSubmitting}
                    className="rounded-lg border border-[#22d3ee]/50 bg-[#22d3ee]/20 px-4 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80 disabled:opacity-50"
                  >
                    {raffleSubmitting ? "Creando..." : "Crear rifa"}
                  </button>
                  <button
                    type="button"
                    onClick={resetRaffleForm}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

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

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20 lg:sticky lg:top-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Menú principal</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Accesos rápidos</h2>
            <p className="text-sm text-white/75">Elige un módulo; el contenido se muestra a la derecha sin bajar al final.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickActions.map((qa) => {
                const labelRole = isSuperadmin ? "Superadmin" : "Admin";
                const disabled = !!qa.panel && !allowedPanels.has(qa.panel);

                return (
                  <button
                    key={qa.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (qa.panel && allowedPanels.has(qa.panel)) {
                        setActiveAction(qa.label);
                        setActivePanel(qa.panel || null);
                      }
                    }}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-white transition hover:-translate-y-[1px] ${activeAction === qa.label ? "border-[#22d3ee]/70 bg-[#22d3ee]/15" : "border-white/10 bg-white/5 hover:border-white/30"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div>
                      <p className="text-xs text-white/60">{labelRole}</p>
                      <p className="text-sm font-semibold text-white">{qa.label}</p>
                    </div>
                    <span className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: qa.color, opacity: 0.3 }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
            {renderPanel() || (
              <div className="text-sm text-white/75">
                <p className="font-semibold text-white">Selecciona un módulo del panel izquierdo.</p>
                <p className="mt-1 text-white/60">Aquí se mostrarán las opciones sin tener que desplazarte al final.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
