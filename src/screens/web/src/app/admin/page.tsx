/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import { CreateRaffleModal } from "@/components/admin/CreateRaffleModal";

export default function AdminPage() {
  const [role, setRole] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

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

  const adminActions = useMemo(
    () => [
      { key: "create", title: "Crear rifa", detail: "Define premios, precio y fecha de sorteo." },
      { key: "raffles", title: "Listado de rifas", detail: "Activas, próximas y finalizadas.", href: "/admin/raffles" },
      { key: "payments", title: "Cargar pagos", detail: "Sincroniza pagos manuales o callbacks.", href: "/admin/payments" },
      { key: "tickets", title: "Validar boleto", detail: "Escanea o ingresa código para redimir.", href: "/admin/tickets" },
      { key: "reports", title: "Reportes", detail: "Ventas, estado de rifas y liquidaciones.", href: "/admin/reports" },
      { key: "exports", title: "Exportes", detail: "Descarga CSV/PDF de ventas y boletos.", href: "/admin/exports" },
    ],
    [],
  );

  const superActions = useMemo(
    () => [
      { key: "users", title: "Gestión de usuarios", detail: "Altas/bajas, bloqueo y verificación KYC.", href: "/admin/users" },
      { key: "roles", title: "Roles y permisos", detail: "Asignar admin/superadmin y límites de acceso.", href: "/admin/roles" },
      { key: "audit", title: "Auditoría", detail: "Revisar logs de seguridad y acciones críticas.", href: "/admin/audit" },
      { key: "config", title: "Parámetros del sistema", detail: "Branding, pasarelas y variables globales.", href: "/admin/config" },
      { key: "fraud", title: "Riesgos y fraude", detail: "Alertas, listas negras y scoring.", href: "/admin/fraud" },
      { key: "notifs", title: "Notificaciones", detail: "Templates de email/push y remitentes.", href: "/admin/notifs" },
    ],
    [],
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
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 bg-night-sky text-white">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/70">
          {isSuper ? "Panel superadmin" : "Panel admin"}
        </p>
        <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">
          Operaciones clave desde el navegador.
        </h1>
        <p className="text-base text-white/80">
          {isSuper
            ? "Gestiona rifas, pagos y además gobierno de usuarios, permisos y auditoría."
            : "Usa tu rol de administrador para gestionar rifas, pagos y validaciones."}
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-black/30"
          >
            <p className="text-sm text-white/75">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminActions.map((action) => {
          if (action.key === "create") {
            return <CreateRaffleModal key={action.key} />;
          }
          return (
            <div
              key={action.key}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/20"
            >
              <h3 className="text-lg font-semibold text-white">{action.title}</h3>
              <p className="text-sm text-white/80">{action.detail}</p>
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
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Superadmin</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Gobierno y seguridad</h2>
              <p className="text-sm text-white/80">Operaciones reservadas para superadmin.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {superActions.map((action) => (
              <div
                key={action.key}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20"
              >
                <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                <p className="text-sm text-white/80">{action.detail}</p>
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

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/20">
        <h2 className="text-xl font-semibold text-white">Integración sugerida</h2>
        <ul className="mt-3 space-y-2 text-sm text-white/85">
          <li>• POST `/admin/raffles` para crear y actualizar.</li>
          <li>• POST `/admin/payments/sync` para reconciliar pagos.</li>
          <li>• POST `/admin/tickets/validate` para redimir boletos.</li>
          <li>• GET `/admin/reports` para métricas y exportes.</li>
        </ul>
      </section>
    </main>
  );
}
