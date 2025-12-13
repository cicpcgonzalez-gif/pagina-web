"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminUsers, fetchModules, updateAdminUser } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

type UserRow = { name: string; email: string; role: "user" | "admin" | "superadmin"; scopes: string[]; locked: boolean };

export default function AdminRolesPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionVariant, setActionVariant] = useState<"success" | "error" | null>(null);
  const [actingEmail, setActingEmail] = useState<string | null>(null);

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

    const loadUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const data = await fetchAdminUsers();
        if (mounted) {
          setRows(
            (data || []).map((u) => ({
              name: u.name || u.email || "Sin nombre",
              email: u.email || String(u.id || Math.random()),
              role: (u.role as UserRow["role"]) || "user",
              scopes: ["all"],
              locked: (u.status || "").toLowerCase() === "bloqueado" || (u as any)?.locked === true,
            })),
          );
        }
      } catch (err) {
        if (mounted) setUsersError(err instanceof Error ? err.message : "No se pudieron cargar usuarios");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const rolesEnabled = useMemo(() => {
    if (!modulesConfig) return isSuper;
    return isSuper && modulesConfig.superadmin?.users !== false;
  }, [modulesConfig, isSuper]);

  const notify = (message: string, variant: "success" | "error") => {
    setActionMessage(message);
    setActionVariant(variant);
    setTimeout(() => {
      setActionMessage(null);
      setActionVariant(null);
    }, 3000);
  };

  const mutateUser = async (email: string, payload: Partial<UserRow>) => {
    const target = rows.find((r) => r.email === email);
    if (!target) return;
    const userId = (target as any)?.id || email;
    setActingEmail(email);
    try {
      await updateAdminUser(userId, {
        role: payload.role,
        status: payload.locked === undefined ? undefined : payload.locked ? "bloqueado" : "activo",
        locked: payload.locked,
      });
      setRows((prev) => prev.map((r) => (r.email === email ? { ...r, ...payload } : r)));
      notify("Cambios guardados", "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "No se pudo actualizar el usuario", "error");
    } finally {
      setActingEmail(null);
    }
  };

  const toggleLock = (email: string) => mutateUser(email, { locked: !rows.find((r) => r.email === email)?.locked });

  const promote = (email: string) => {
    const target = rows.find((r) => r.email === email);
    if (!target) return;
    if (target.role === "user") return mutateUser(email, { role: "admin" });
    if (target.role === "admin") return mutateUser(email, { role: "superadmin" });
  };

  const demote = (email: string) => {
    const target = rows.find((r) => r.email === email);
    if (!target) return;
    if (target.role === "superadmin") return mutateUser(email, { role: "admin" });
    if (target.role === "admin") return mutateUser(email, { role: "user" });
  };

  const scopesText = (scopes: string[]) => (scopes.includes("all") ? "Todo" : scopes.join(", "));

  if (!isSuper) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Solo superadmin.</p>
          <p className="mt-2 text-sm text-white/75">Cambia a una cuenta superadmin para gestionar roles.</p>
        </div>
      </main>
    );
  }

  if (!loadingModules && !rolesEnabled) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de roles/usuarios desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo en configuración.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Roles y permisos</h1>
      <p className="mt-2 text-white/80">Promueve, reduce y bloquea accesos contra la API.</p>
      {loadingModules && <p className="mt-2 text-xs text-white/60">Cargando módulos…</p>}
      {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
      {loadingUsers && <p className="mt-2 text-xs text-white/60">Cargando usuarios…</p>}
      {usersError && <p className="mt-2 text-xs text-red-200">{usersError}</p>}
      {actionMessage && (
        <p className={`mt-2 text-xs ${actionVariant === "success" ? "text-emerald-200" : "text-red-200"}`}>{actionMessage}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Scopes</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.email} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-white/70">{u.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3 text-xs text-white/70">{scopesText(u.scopes)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${u.locked ? "bg-rose-500/15 text-rose-100 border-rose-200/30" : "bg-emerald-500/15 text-emerald-100 border-emerald-200/30"}`}
                  >
                    {u.locked ? "bloqueado" : "activo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelected(u)} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">Ver</button>
                    <button onClick={() => promote(u.email)} className="rounded-md bg-[#3b82f6] px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                      {actingEmail === u.email ? "Guardando…" : "Promover"}
                    </button>
                    <button onClick={() => demote(u.email)} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                      {actingEmail === u.email ? "Guardando…" : "Reducir"}
                    </button>
                    <button onClick={() => toggleLock(u.email)} className="rounded-md border border-amber-300/50 px-2 py-1 text-amber-100 transition hover:border-amber-200/70">
                      {actingEmail === u.email ? "Guardando…" : u.locked ? "Desbloquear" : "Bloquear"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loadingUsers && rows.length === 0 && (
              <tr className="border-t border-white/10">
                <td colSpan={5} className="px-4 py-6 text-center text-white/70">No hay usuarios cargados desde la API.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/85">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Detalle</p>
              <p className="text-lg font-semibold text-white">{selected.name}</p>
              <p className="text-xs text-white/70">{selected.email}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-white/60 hover:text-white">Cerrar</button>
          </div>
          <p className="mt-3 text-xs text-white/70">Rol: {selected.role}</p>
          <p className="text-xs text-white/70">Scopes: {scopesText(selected.scopes)}</p>
          <p className="text-xs text-white/70">Estado: {selected.locked ? "Bloqueado" : "Activo"}</p>
        </div>
      )}
    </main>
  );
}
