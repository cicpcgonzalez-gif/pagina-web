"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRaffles } from "@/lib/api";
import type { Raffle } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";

type Filter = "all" | "ending" | "price";

export default function RifasPage() {
  const [items, setItems] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchRaffles();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las rifas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    const base = items
      .filter(Boolean)
      .filter((r) => {
        if ((r.status || "").toLowerCase() !== "activa") return false;
        const endMs = Date.parse(r.drawDate);
        const endedByTime = Number.isFinite(endMs) && endMs > 0 && endMs < now;
        if (endedByTime) return false;
        return true;
      })
      .filter((r) => {
        if (!q) return true;
        return (r.title || "").toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
      });

    if (filter === "price") {
      return [...base].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (filter === "ending") {
      return [...base].sort((a, b) => {
        const aMs = Date.parse(a.drawDate);
        const bMs = Date.parse(b.drawDate);
        const aVal = Number.isFinite(aMs) ? aMs : Number.POSITIVE_INFINITY;
        const bVal = Number.isFinite(bMs) ? bMs : Number.POSITIVE_INFINITY;
        return aVal - bVal;
      });
    }

    return base;
  }, [items, search, filter]);

  return (
    <RequireAuth>
      <AppShell title="Rifas" subtitle="Rifas activas (incluye agotadas).">
        <section className="glass-cyber rounded-3xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Sorteos activos</p>
              <p className="text-xs text-white/70">Actualiza para ver nuevas rifas y cambios.</p>
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar rifas..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">Todas</option>
              <option value="ending">Próximas a cerrar</option>
              <option value="price">Menor precio</option>
            </select>
          </div>

          {error && <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              No hay rifas activas para mostrar.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((raffle) => {
              const total = Number(raffle.ticketsTotal || raffle.stats?.total || 0) || 0;
              const remaining = Number(raffle.ticketsAvailable ?? raffle.stats?.remaining ?? 0) || 0;
              const sold = total ? Math.max(total - remaining, 0) : 0;
              const progress = total ? Math.round((sold / total) * 100) : 0;
              const banner =
                raffle.style?.gallery?.[0] ||
                raffle.style?.bannerImage ||
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

              return (
                <article key={raffle.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
                  <div className="relative h-56 w-full bg-black/40">
                    <Image src={banner} alt={raffle.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                      {raffle.drawDate && raffle.drawDate !== "Por definir" ? `Cierra: ${new Date(raffle.drawDate).toLocaleDateString()}` : "Cierre por definir"}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                      {raffle.description ? <p className="text-sm text-white/70 line-clamp-2">{raffle.description}</p> : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">VES {Number(raffle.price || 0).toFixed(2)} / boleto</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                        {remaining} / {total || "—"} disponibles
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-neon-blue-gradient" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
                      </div>
                    </div>

                    <Link
                      href={`/rifas/${raffle.id}`}
                      className="block w-full rounded-2xl bg-neon-orange-gradient px-4 py-3 text-center text-sm font-extrabold text-black glow-neon-orange"
                    >
                      ¡PARTICIPA Y GANA!
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
