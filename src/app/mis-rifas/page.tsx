"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyRaffles } from "@/lib/api";
import type { MyRaffle } from "@/lib/types";
import { formatTicketNumber } from "@/lib/utils";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";

export default function MisRifasPage() {
  const [items, setItems] = useState<MyRaffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMyRaffles()
      .then((data) => {
        if (!mounted) return;
        setItems(Array.isArray(data) ? data.filter(Boolean) as MyRaffle[] : []);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "No se pudo cargar";
        setError(msg);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const winners = items.filter((i) => i.isWinner).length;
    const pending = items.filter((i) => (i.status || "").toLowerCase().includes("pend"));
    return { total, winners, pending: pending.length };
  }, [items]);

  return (
    <RequireAuth>
      <AppShell title="Tickets" subtitle="Tu historial de compras (rifas y números asignados).">

        <div className="grid gap-3 sm:grid-cols-3">
          {[{ label: "Total", value: totals.total }, { label: "Ganadas", value: totals.winners }, { label: "Pendientes", value: totals.pending }].map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{tile.label}</p>
              <p className="text-2xl font-semibold">{tile.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
        )}
        {loading && <p className="text-sm text-white/70">Cargando...</p>}

        <div className="grid gap-4">
          {!loading && !error && items.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">No tienes rifas compradas.</div>
          )}

          {items.map((item, idx) => {
            const raffle = item.raffle || {};
            const progress = raffle?.stats?.progress ?? 0;
            const isWinner = !!item.isWinner;
            const status = (item.status || "Activo").toString();
            const statusColor = isWinner
              ? "bg-amber-500/20 text-amber-100 border-amber-300/50"
              : status.toLowerCase().includes("appr")
              ? "bg-emerald-500/15 text-emerald-100 border-emerald-300/40"
              : status.toLowerCase().includes("pend")
              ? "bg-amber-500/15 text-amber-100 border-amber-300/30"
              : "bg-white/10 text-white/70 border-white/20";

            const numbersText = (() => {
              const nums = item.numbers;
              if (Array.isArray(nums)) return nums.map((n) => formatTicketNumber(String(n), raffle?.digits)).join(" • ");
              if (nums) return formatTicketNumber(String(nums), raffle?.digits);
              return "—";
            })();

            return (
              <article
                key={item.id || item.raffleId || `raffle-${idx}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/70">
                  <div>
                    <p className="text-sm font-semibold text-white">{raffle.title || "Rifa"}</p>
                    <p className="text-white/60">{raffle.description || "Ticket adquirido"}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusColor}`}>{isWinner ? "Ganador" : status}</span>
                </div>

                <div className="grid gap-3 px-4 py-3 text-sm text-white/80 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Tus números</p>
                    <p className="text-lg font-semibold text-white">{numbersText}</p>
                    <div className="text-xs text-white/60">
                      <div>Serial: {item.serialNumber ? String(item.serialNumber).slice(-12).toUpperCase() : "Pendiente"}</div>
                      <div>
                        Comprador: {item.user?.firstName || item.user?.name || "Usuario"} {item.user?.lastName || ""}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>Progreso de la rifa</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-neon-blue-gradient" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                    </div>
                    <button className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
