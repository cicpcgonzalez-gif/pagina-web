"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchModules } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

export default function AdminUsersPage() {
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

  const usersEnabled = useMemo(() => {
    if (!modulesConfig) return isSuper;
    return isSuper && modulesConfig.superadmin?.users !== false;
  }, [modulesConfig, isSuper]);

  const users = useMemo(
    () => [
      { name: "Mariana R.", email: "mariana@example.com", role: "admin", status: "activo" },
      { name: "Carlos D.", email: "carlos@example.com", role: "superadmin", status: "activo" },
      { name: "Lucia M.", email: "lucia@example.com", role: "user", status: "bloqueado" },
      { name: "Andres P.", email: "andres@example.com", role: "user", status: "pendiente" },
    ],
    [],
  );

  const statusClass = (status: string) => {
    if (status === "activo") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "pendiente") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  if (!isSuper) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Solo superadmin.</p>
          <p className="mt-2 text-sm text-white/75">Cambia a una cuenta superadmin para gestionar usuarios.</p>
        </div>
      </main>
    );
  }

  if (!loadingModules && !usersEnabled) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de usuarios desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo en configuración.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Usuarios</h1>
      <p className="mt-2 text-white/80">Mock de gestión. Conecta tu CRUD real.</p>
      {loadingModules && <p className="mt-2 text-xs text-white/60">Cargando módulos…</p>}
      {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(u.status)}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex gap-2">
                    <button className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">Ver</button>
                    <button className="rounded-md bg-[#3b82f6] px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                      Cambiar rol
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
