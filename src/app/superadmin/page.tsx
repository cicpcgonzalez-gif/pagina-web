"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import { fetchModules } from "@/lib/api";
import type { ModuleConfig } from "@/lib/types";

const baseActions = [
  { key: "account", title: "Mi Cuenta", detail: "Datos del admin y sesión.", href: "/perfil" },
  { key: "support", title: "Mi Soporte", detail: "WhatsApp/IG visibles en rifas.", href: "/admin/notifs" },
  { key: "push", title: "Notificaciones", detail: "Mensajes push a compradores.", href: "/admin/notifs" },
  { key: "company", title: "Empresa", detail: "RIF, dirección y contacto público.", href: "/admin/config" },
  { key: "bank", title: "Datos Bancarios", detail: "Cuentas y medios de cobro.", href: "/admin/config" },
  { key: "security", title: "Cód. Seguridad", detail: "Control de fraude y código.", href: "/admin/fraud" },
  { key: "lottery", title: "Sorteo en Vivo", detail: "Validar número ganador.", href: "/admin/tickets" },
  { key: "raffles", title: "Crear/Editar rifas", detail: "Activas, próximas y finalizadas.", href: "/admin/raffles" },
  { key: "dashboard", title: "Dashboard", detail: "Métricas en vivo por rifa y estado.", href: "/admin/reports" },
  { key: "progress", title: "Progreso", detail: "Curva de ventas y cierre de rifas.", href: "/admin/reports" },
  { key: "payments", title: "Pagos", detail: "Sincroniza pagos y verifica comprobantes.", href: "/admin/payments" },
  { key: "winners", title: "Ganadores", detail: "Publica resultados y evidencia.", href: "/admin/ganadores" },
  { key: "tickets", title: "Tickets", detail: "Validar o redimir boletos.", href: "/admin/tickets" },
  { key: "style", title: "Estilo", detail: "Galería, banner y acentos por rifa.", href: "/admin/raffles" },
  { key: "news", title: "Novedades", detail: "Avisos y anuncios para el mural.", href: "/admin/notifs" },
];

export default function SuperAdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);

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
    const load = async () => {
      try {
        const data = await fetchModules();
        if (mounted) setModulesConfig(data || null);
      } catch (err) {
        if (mounted) setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const superActions = useMemo(() => {
    const moduleKey = (key: string) => {
      if (key === "sa_users" || key === "users") return "users";
      if (key === "sa_tech_support" || key === "tech") return "techSupport";
      if (key === "sa_smtp" || key === "smtp") return "smtp";
      if (key === "sa_mail" || key === "mail") return "mailLogs";
      if (key === "sa_actions" || key === "critical") return "criticalActions";
      return key;
    };

    const list = [
      { key: "sa_users", title: "Usuarios", detail: "Altas/bajas, bloqueo y KYC.", href: "/admin/users" },
      { key: "sa_tech_support", title: "Soporte Técnico", detail: "Contactos y escalamiento.", href: "/admin/notifs" },
      { key: "sa_smtp", title: "Correo SMTP", detail: "Remitentes y credenciales.", href: "/admin/notifs" },
      { key: "audit", title: "Auditoría", detail: "Logs de seguridad y acciones críticas.", href: "/admin/audit" },
      { key: "branding", title: "Branding", detail: "Colores, logo, banner y políticas.", href: "/admin/config" },
      { key: "modules", title: "Módulos", detail: "Activar/desactivar features.", href: "/admin/config" },
      { key: "sa_mail", title: "Logs de Correo", detail: "Monitoreo de envíos.", href: "/admin/notifs" },
      { key: "sa_actions", title: "Acciones Críticas", detail: "Eliminar rifa, cierre forzado.", href: "/admin/fraud" },
    ];

    return list.filter((a) => modulesConfig?.superadmin?.[moduleKey(a.key)] !== false);
  }, [modulesConfig]);

  const adminActions = useMemo(
    () => baseActions.filter((a) => modulesConfig?.admin?.[a.key] !== false),
    [modulesConfig],
  );

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
              Controla branding, módulos, SMTP, usuarios, roles, auditoría y acciones críticas.
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
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Flujo superadmin</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80">Checklist</span>
            </div>
            <ol className="space-y-2 text-sm text-white/80">
              <li>1) Ajusta branding, políticas y módulos.</li>
              <li>2) Configura SMTP y soporte técnico.</li>
              <li>3) Administra usuarios/roles y auditoría.</li>
              <li>4) Supervisa pagos críticos y acciones sensibles.</li>
            </ol>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Superadmin</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Gobierno y seguridad</h2>
              <p className="text-sm text-white/80">Branding, módulos, SMTP, usuarios y auditoría.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {superActions.map((action) => (
              <div
                key={action.key}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/20"
              >
                <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                <p className="text-sm text-white/75">{action.detail}</p>
                {action.href ? (
                  <Link
                    href={action.href}
                    className="inline-flex items-center justify-center rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-3 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80"
                  >
                    Ir
                  </Link>
                ) : (
                  <button className="rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-3 py-2 text-sm font-semibold text-[#dff7ff] transition hover:-translate-y-[1px] hover:border-[#22d3ee]/80">
                    Configurar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminActions.map((action) => (
            <div
              key={action.key}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20"
            >
              <h3 className="text-lg font-semibold text-white">{action.title}</h3>
              <p className="text-sm text-white/75">{action.detail}</p>
              {action.href ? (
                <Link
                  href={action.href}
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60"
                >
                  Ir
                </Link>
              ) : (
                <button className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60">
                  Configurar
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
