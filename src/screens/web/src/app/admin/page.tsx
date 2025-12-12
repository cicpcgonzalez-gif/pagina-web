"use client";

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

  const actions = useMemo(
    () => [
      {
        title: "Crear rifa",
        detail: "Define premios, precio y stock de boletos.",
      },
      {
        title: "Cargar pagos",
        detail: "Sincroniza pagos manuales o revisa callbacks de la pasarela.",
      },
      {
        title: "Validar boleto",
        detail: "Escanea o ingresa código para marcar como usado.",
      },
      {
        title: "Reportes",
        detail: "Ventas por fecha, estado de sorteos y liquidaciones.",
      },
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

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 bg-night-sky text-white">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/70">Panel admin</p>
        <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">
          Operaciones clave desde el navegador.
        </h1>
        <p className="text-base text-white/80">
          Usa tu rol de administrador para gestionar rifas, pagos y validaciones.
          Conecta estos bloques a tus endpoints internos.
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
        {actions.map((action) => {
          if (action.title === "Crear rifa") {
            return <CreateRaffleModal key={action.title} />;
          }
          return (
            <div
              key={action.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/20"
            >
              <h3 className="text-lg font-semibold text-white">{action.title}</h3>
              <p className="text-sm text-white/80">{action.detail}</p>
              <button className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#22d3ee]/60">
                Configurar
              </button>
            </div>
          );
        })}
      </section>

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
