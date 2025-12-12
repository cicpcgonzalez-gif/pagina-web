"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

type LogRow = { id: string; actor: string; action: string; severity: "info" | "warn" | "crit"; at: string };

export default function AdminAuditPage() {
  const logs = useMemo<LogRow[]>(
    () => [
      { id: "LG-7001", actor: "carlos@example.com", action: "Promovió a Mariana a admin", severity: "info", at: "2025-12-12 11:50" },
      { id: "LG-6998", actor: "carlos@example.com", action: "Intento fallido de login de IP 10.0.0.4", severity: "warn", at: "2025-12-12 11:10" },
      { id: "LG-6995", actor: "mariana@example.com", action: "Editó rifa RF-101", severity: "info", at: "2025-12-12 10:40" },
      { id: "LG-6990", actor: "sistema", action: "Bloqueó usuario andres@example.com por fraude", severity: "crit", at: "2025-12-11 19:20" },
    ],
    [],
  );

  const [filter, setFilter] = useState<"all" | "info" | "warn" | "crit">("all");
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

  const role = getUserRole()?.toLowerCase();
  const isSuper = role === "superadmin";

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

  const auditEnabled = useMemo(() => {
    if (!modulesConfig) return isSuper;
    return isSuper && modulesConfig.superadmin?.audit !== false;
  }, [modulesConfig, isSuper]);

  const severityClass = (sev: string) => {
    if (sev === "crit") return "bg-rose-500/15 text-rose-100 border-rose-200/30";
    if (sev === "warn") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
  };

  const filtered = logs.filter((l) => filter === "all" || l.severity === filter);

  if (!isSuper) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Solo superadmin.</p>
          <p className="mt-2 text-sm text-white/75">Cambia a una cuenta superadmin para ver auditoría.</p>
        </div>
      </main>
    );
  }

  if (!loadingModules && !auditEnabled) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de auditoría desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo en configuración.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Auditoría</h1>
        <p className="text-white/80">Logs de seguridad (mock). Filtra por severidad.</p>
        {loadingModules && <p className="text-xs text-white/60">Cargando módulos…</p>}
        {modulesError && <p className="text-xs text-red-200">{modulesError}</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {["all", "info", "warn", "crit"].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev as any)}
            className={`rounded-full border px-3 py-1 font-semibold capitalize transition ${filter === sev ? "border-[#22d3ee] text-[#22d3ee]" : "border-white/20 text-white/70"}`}
          >
            {sev === "all" ? "Todas" : sev}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Severidad</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{log.id}</td>
                <td className="px-4 py-3">{log.actor}</td>
                <td className="px-4 py-3 text-white/80">{log.action}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${severityClass(log.severity)}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{log.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
