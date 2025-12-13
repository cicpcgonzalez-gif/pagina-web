"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

type AlertRow = { id: string; user: string; reason: string; score: number; status: "abierto" | "bloqueado" | "resuelto" };

export default function AdminFraudPage() {
  const alerts = useMemo<AlertRow[]>(
    () => [
      { id: "FR-3001", user: "andres@example.com", reason: "Multiples tarjetas", score: 82, status: "bloqueado" },
      { id: "FR-2999", user: "lucia@example.com", reason: "IPs distintas", score: 56, status: "abierto" },
      { id: "FR-2995", user: "carlos@example.com", reason: "Chargeback previo", score: 44, status: "resuelto" },
    ],
    [],
  );

  const [rows, setRows] = useState(alerts);
  const [selected, setSelected] = useState<AlertRow | null>(null);
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

  const fraudEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (isSuper) return modulesConfig.superadmin?.critical !== false;
    return modulesConfig.admin?.security !== false;
  }, [modulesConfig, isSuper]);

  const setStatus = (id: string, status: AlertRow["status"]) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const badge = (status: AlertRow["status"]) => {
    if (status === "bloqueado") return "bg-rose-500/15 text-rose-100 border-rose-200/30";
    if (status === "abierto") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
  };

  if (!loadingModules && !fraudEnabled) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de riesgos/fraude desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo para bloquear o resolver alertas.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Riesgos y fraude</h1>
      <p className="mt-2 text-white/80">Alertas, scoring y bloqueos (mock local).</p>
      {loadingModules && <p className="mt-2 text-xs text-white/60">Cargando módulos…</p>}
      {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{a.id}</td>
                <td className="px-4 py-3">{a.user}</td>
                <td className="px-4 py-3 text-white/75">{a.reason}</td>
                <td className="px-4 py-3">{a.score}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${badge(a.status)}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelected(a)} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">Ver</button>
                    <button onClick={() => setStatus(a.id, "bloqueado")} className="rounded-md bg-rose-500/30 px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                      Bloquear
                    </button>
                    <button onClick={() => setStatus(a.id, "resuelto")} className="rounded-md bg-emerald-500/30 px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                      Resolver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/85">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Alerta</p>
              <p className="text-lg font-semibold text-white">{selected.id}</p>
              <p className="text-xs text-white/70">Usuario {selected.user}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-white/60 hover:text-white">Cerrar</button>
          </div>
          <p className="mt-2 text-xs text-white/70">Motivo: {selected.reason}</p>
          <p className="text-xs text-white/70">Score: {selected.score}</p>
          <p className="text-xs text-white/70">Estado: {selected.status}</p>
        </div>
      )}
    </main>
  );
}
