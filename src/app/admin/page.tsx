/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import { fetchModules } from "@/lib/api";
import type { ModuleConfig } from "@/lib/types";
import { CreateRaffleModal } from "@/components/admin/CreateRaffleModal";

export default function AdminPage() {
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
    if (!r || (r.toLowerCase() !== "admin" && r.toLowerCase() !== "superadmin")) {
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

  const adminActions = useMemo(
    () => [
      { key: "account", title: "Mi cuenta", detail: "Datos del admin y sesión.", href: "/perfil" },
      { key: "support", title: "Mi soporte", detail: "WhatsApp/IG visibles en rifas.", href: "/admin/notifs" },
      { key: "push", title: "Notificaciones", detail: "Mensajes push a compradores.", href: "/admin/notifs" },
      { key: "company", title: "Empresa", detail: "RIF, dirección y contacto público.", href: "/admin/config" },
      { key: "bank", title: "Datos bancarios", detail: "Cuentas y medios de cobro.", href: "/admin/config" },
      { key: "security", title: "Cód. seguridad", detail: "Control de fraude y código.", href: "/admin/fraud" },
      { key: "lottery", title: "Sorteo en vivo", detail: "Validar número ganador.", href: "/admin/tickets" },
      { key: "raffles", title: "Crear/Editar rifas", detail: "Activas, próximas y finalizadas.", href: "/admin/raffles" },
      { key: "dashboard", title: "Dashboard", detail: "Métricas en vivo por rifa y estado.", href: "/admin/reports" },
      { key: "progress", title: "Progreso", detail: "Curva de ventas y cierre de rifas.", href: "/admin/reports" },
      { key: "payments", title: "Pagos", detail: "Sincroniza pagos y verifica comprobantes.", href: "/admin/payments" },
      { key: "winners", title: "Ganadores", detail: "Publica resultados y evidencia.", href: "/admin/ganadores" },
      { key: "tickets", title: "Tickets", detail: "Validar o redimir boletos.", href: "/admin/tickets" },
      { key: "style", title: "Estilo", detail: "Galería, banner y acentos por rifa.", href: "/admin/raffles" },
      { key: "news", title: "Novedades", detail: "Avisos y anuncios para el mural.", href: "/admin/notifs" },
    ].filter((a) => modulesConfig?.admin?.[a.key] !== false),
    [modulesConfig],
  );

  const superActions = useMemo(
    () => [
      { key: "users", title: "Usuarios", detail: "Altas/bajas, bloqueo y KYC.", href: "/admin/users" },
      { key: "tech", title: "Soporte técnico", detail: "Contactos y escalamiento.", href: "/admin/notifs" },
      { key: "smtp", title: "Correo SMTP", detail: "Remitentes y credenciales.", href: "/admin/notifs" },
      { key: "audit", title: "Auditoría", detail: "Logs de seguridad y acciones críticas.", href: "/admin/audit" },
      { key: "branding", title: "Branding", detail: "Colores, logo, banner y políticas.", href: "/admin/config" },
      { key: "modules", title: "Módulos", detail: "Activar/desactivar features.", href: "/admin/config" },
      { key: "mail", title: "Logs de correo", detail: "Monitoreo de envíos.", href: "/admin/notifs" },
      { key: "critical", title: "Acciones críticas", detail: "Eliminar rifa, cierre forzado.", href: "/admin/fraud" },
    ].filter((a) => modulesConfig?.superadmin?.[a.key] !== false),
    [modulesConfig],
  );

  const metrics = useMemo(
    () => [
      { label: "Rifas activas", value: "12" },
      { label: "Boletos vendidos", value: "3,215" },
      { label: "Pendientes de pago", value: "74" },
      { label: "Reembolsos", value: "3" },
    ],
    [],
  );

  if (denied) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 bg-night-sky text-white">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-md shadow-black/30">
          <p className="text-sm font-semibold">Acceso restringido. Se requiere rol admin.</p>
          <p className="mt-2 text-xs text-white/75">Rol actual: {role ?? "no autenticado"}</p>
          <p className="mt-2 text-xs text-white/75">Inicia sesión con cuenta admin y vuelve a intentar.</p>
        </div>
      </main>
    );
  }

  const isSuper = role?.toLowerCase() === "superadmin";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20 pt-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">{isSuper ? "Panel superadmin" : "Panel admin"}</p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Operaciones clave, versión web.</h1>
            <p className="max-w-2xl text-white/80">
              {isSuper
                ? "Gobierna rifas, pagos, usuarios, branding, auditoría y módulos críticos."
                : "Gestiona rifas, pagos, validaciones, estilo y soporte como en la app."}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <CreateRaffleModal />
              <Link
                href="/rifas"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
              >
                Ver mural de rifas
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
                >
                  <p className="text-sm text-white/70">{item.label}</p>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Flujo admin</span>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80">Checklist</span>
            </div>
            <ol className="space-y-2 text-sm text-white/80">
              <li>1) Configura empresa, bancos y soporte (datos públicos).</li>
              <li>2) Crea/edita rifas, galería y precio.</li>
              <li>3) Sincroniza pagos y valida tickets.</li>
              <li>4) Publica ganadores y monitorea fraude.</li>
            </ol>
            {modulesError && (
              <p className="text-xs text-red-200">Módulos: {modulesError}</p>
            )}
            {modulesConfig && (
              <p className="text-xs text-white/60">Módulos cargados: admin {Object.keys(modulesConfig.admin || {}).length} | superadmin {Object.keys(modulesConfig.superadmin || {}).length}</p>
            )}
            {isSuper && (
              <div className="rounded-2xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 p-4 text-sm text-[#dff7ff]">
                <p className="font-semibold text-white">Superadmin</p>
                <p className="text-white/80">Branding, módulos, SMTP, usuarios y auditoría desde web.</p>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminActions.map((action) => {
            if (action.key === "create") {
              return null; // botón ya en hero
            }
            return (
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
            );
          })}
        </section>

        {isSuper && (
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
        )}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-md shadow-black/20">
          <h2 className="text-xl font-semibold text-white">Integración sugerida</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            <li>• POST `/admin/raffles` crear/actualizar rifas.</li>
            <li>• POST `/admin/payments/sync` reconciliar pagos.</li>
            <li>• POST `/admin/tickets/validate` redimir boletos.</li>
            <li>• GET `/admin/reports` métricas y exportes.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
