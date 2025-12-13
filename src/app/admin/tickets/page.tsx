"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules, fetchRecentValidations, validateTicket } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

export default function AdminTicketsPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

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
    return () => {
      mounted = false;
    };
  }, []);

  const ticketsEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (role === "superadmin") return modulesConfig.superadmin?.tickets !== false;
    return modulesConfig.admin?.tickets !== false;
  }, [modulesConfig, role]);

  const statusClass = (status: string) => {
    if (status === "valido") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "ya usado") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  useEffect(() => {
    let mounted = true;
    setLoadingRecent(true);
    fetchRecentValidations()
      .then((rows) => {
        if (!mounted) return;
        setRecent(rows || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setActionError(err instanceof Error ? err.message : "No se pudieron cargar validaciones recientes");
      })
      .finally(() => {
        if (mounted) setLoadingRecent(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleValidate = async () => {
    setActionError(null);
    if (!code.trim()) {
      setResult("Ingresa un código");
      return;
    }
    const normalized = code.trim();
    try {
      const res = await validateTicket(normalized);
      const status = (res as any)?.status || ((res as any)?.valid ? "valido" : "no valido");
      const detail = (res as any)?.message || (res as any)?.detail;
      setResult(detail || `Estado: ${status}`);
      setCode("");
      const recentRow = {
        code: normalized,
        raffle: (res as any)?.raffle?.title || (res as any)?.ticket?.raffleTitle || "—",
        status,
        at: new Date().toLocaleString(),
      };
      setRecent((prev) => [recentRow, ...prev].slice(0, 20));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo validar el ticket");
    }
  };

  if (!loadingModules && !ticketsEnabled) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de tickets desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Habilita el módulo en configuración para validar boletos.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Validar boletos</h1>
      <p className="mt-2 text-white/80">Escanea o ingresa el código del boleto y valida contra la API.</p>
      {loadingModules && <p className="mt-2 text-xs text-white/60">Cargando módulos…</p>}
      {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
      {actionError && <p className="mt-2 text-xs text-red-200">{actionError}</p>}

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: TK-12001"
            className="w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
          />
          <button
            onClick={handleValidate}
            className="rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]"
          >
            Validar
          </button>
        </div>
        {result && <p className="mt-3 text-sm text-white/85">{result}</p>}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Rifa</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((item, idx) => {
              const codeValue = (item as any)?.code || `TK-${idx}`;
              const raffleValue = (item as any)?.raffle || (item as any)?.raffleTitle || "—";
              const statusValue = String((item as any)?.status || "desconocido").toLowerCase();
              const atValue = (item as any)?.at || (item as any)?.createdAt || new Date().toLocaleString();
              return (
                <tr key={codeValue} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-white">{codeValue}</td>
                  <td className="px-4 py-3">{raffleValue}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(statusValue)}`}>
                      {statusValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/60">{atValue}</td>
                </tr>
              );
            })}
            {!loadingRecent && recent.length === 0 && (
              <tr className="border-t border-white/10">
                <td colSpan={4} className="px-4 py-6 text-center text-white/70">
                  Sin validaciones recientes.
                </td>
              </tr>
            )}
            {loadingRecent && (
              <tr className="border-t border-white/10">
                <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                  Cargando validaciones…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
