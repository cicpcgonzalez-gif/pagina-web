"use client";

import { useMemo, useState } from "react";

type UserRow = { name: string; email: string; role: "user" | "admin" | "superadmin"; scopes: string[]; locked: boolean };

export default function AdminRolesPage() {
  const initial = useMemo<UserRow[]>(
    () => [
      { name: "Mariana R.", email: "mariana@example.com", role: "admin", scopes: ["raffles", "payments", "tickets"], locked: false },
      { name: "Carlos D.", email: "carlos@example.com", role: "superadmin", scopes: ["all"], locked: false },
      { name: "Lucia M.", email: "lucia@example.com", role: "user", scopes: ["buy"], locked: false },
      { name: "Andres P.", email: "andres@example.com", role: "user", scopes: ["buy"], locked: true },
    ],
    [],
  );

  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const toggleLock = (email: string) => {
    setRows((prev) => prev.map((r) => (r.email === email ? { ...r, locked: !r.locked } : r)));
  };

  const promote = (email: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.email !== email) return r;
        if (r.role === "user") return { ...r, role: "admin", scopes: ["raffles", "payments", "tickets"] };
        if (r.role === "admin") return { ...r, role: "superadmin", scopes: ["all"] };
        return r;
      }),
    );
  };

  const demote = (email: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.email !== email) return r;
        if (r.role === "superadmin") return { ...r, role: "admin", scopes: ["raffles", "payments", "tickets"] };
        if (r.role === "admin") return { ...r, role: "user", scopes: ["buy"] };
        return r;
      }),
    );
  };

  const scopesText = (scopes: string[]) => (scopes.includes("all") ? "Todo" : scopes.join(", "));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Roles y permisos</h1>
      <p className="mt-2 text-white/80">Promueve, reduce y bloquea accesos (mock local).</p>

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
                      Promover
                    </button>
                    <button onClick={() => demote(u.email)} className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">
                      Reducir
                    </button>
                    <button onClick={() => toggleLock(u.email)} className="rounded-md border border-amber-300/50 px-2 py-1 text-amber-100 transition hover:border-amber-200/70">
                      {u.locked ? "Desbloquear" : "Bloquear"}
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
