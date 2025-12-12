"use client";

import { useMemo } from "react";

export default function AdminPaymentsPage() {
  const payments = useMemo(
    () => [
      { id: "PM-5001", user: "Mariana R.", amount: 120, method: "Tarjeta", status: "confirmado", createdAt: "2025-12-12 11:20" },
      { id: "PM-5000", user: "Carlos D.", amount: 40, method: "Transferencia", status: "pendiente", createdAt: "2025-12-12 10:55" },
      { id: "PM-4999", user: "Lucía M.", amount: 20, method: "Efectivo", status: "conciliar", createdAt: "2025-12-11 19:10" },
      { id: "PM-4998", user: "Andrés P.", amount: 60, method: "Tarjeta", status: "fallido", createdAt: "2025-12-11 18:45" },
    ],
    [],
  );

  const statusClass = (status: string) => {
    if (status === "confirmado") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "pendiente" || status === "conciliar") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-white/80">Panel mock de conciliación. Conecta POST `/api/admin/payments/sync`.</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{p.id}</td>
                <td className="px-4 py-3">{p.user}</td>
                <td className="px-4 py-3">${p.amount.toFixed(2)}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{p.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs">
                    <button className="rounded-md border border-white/20 px-2 py-1 text-white transition hover:border-white/40">Ver</button>
                    <button className="rounded-md bg-[#3b82f6] px-2 py-1 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                      Conciliar
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
