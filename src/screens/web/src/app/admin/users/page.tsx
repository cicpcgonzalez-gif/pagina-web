"use client";

import { useMemo } from "react";

export default function AdminUsersPage() {
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

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Usuarios</h1>
      <p className="mt-2 text-white/80">Mock de gestión. Conecta tu CRUD real.</p>

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
