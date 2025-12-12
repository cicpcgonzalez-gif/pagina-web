"use client";

import { useMemo } from "react";
import { Pencil, Ticket } from "lucide-react";

export default function AdminRafflesPage() {
  const raffles = useMemo(
    () => [
      { id: "RF-101", title: "Camioneta 4x4", price: 10, total: 5000, sold: 3120, status: "activa", drawDate: "2025-12-22" },
      { id: "RF-099", title: "iPhone 16 Pro", price: 8, total: 3000, sold: 2980, status: "cerrada", drawDate: "2025-12-10" },
      { id: "RF-095", title: "Moto 150cc", price: 5, total: 2000, sold: 640, status: "activa", drawDate: "2026-01-05" },
      { id: "RF-090", title: "Viaje Cancún", price: 12, total: 1500, sold: 220, status: "proxima", drawDate: "2026-02-01" },
    ],
    [],
  );

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Rifas</h1>
        <p className="text-white/80">Listado y gestión (mock). Conecta aquí tu endpoint `/api/admin/raffles`.</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {raffles.map((raffle) => {
          const progress = Math.min(100, Math.round((raffle.sold / raffle.total) * 100));
          const statusColor =
            raffle.status === "activa"
              ? "text-emerald-300 bg-emerald-500/10 border-emerald-200/30"
              : raffle.status === "cerrada"
                ? "text-rose-200 bg-rose-500/10 border-rose-200/30"
                : "text-amber-200 bg-amber-500/10 border-amber-200/30";
          return (
            <article
              key={raffle.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full border px-2 py-1 text-[11px] font-semibold text-white/80">{raffle.id}</span>
                <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusColor}`}>{raffle.status}</span>
                <span className="ml-auto text-xs text-white/60">Sorteo {raffle.drawDate}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{raffle.title}</h3>
              <p className="text-sm text-white/70">${raffle.price.toFixed(2)} por boleto</p>
              <div className="mt-3 h-2 rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/70">
                <span>Vendidos {raffle.sold}</span>
                <span>Disponibles {Math.max(raffle.total - raffle.sold, 0)}</span>
              </div>
              <div className="mt-4 flex gap-2 text-sm">
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-3 py-2 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]">
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 font-semibold text-white transition hover:border-white/40">
                  <Ticket className="h-4 w-4" />
                  Ver boletos
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
