"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRaffles, reactToRaffle } from "@/lib/api";
import type { Raffle } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";

type Filter = "all" | "ending" | "price";

function formatMoneyVES(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(n);
}

function canShare() {
  return typeof navigator !== "undefined" && ("share" in navigator || "clipboard" in navigator);
}

export default function RifasPage() {
  const [items, setItems] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
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

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();

    const base = items
      .filter(Boolean)
      .filter((r) => {
        if ((r.status || "").toLowerCase() !== "activa") return false;
        const endMs = Date.parse(r.endDate ?? r.drawDate);
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
        const aMs = Date.parse(a.endDate ?? a.drawDate);
        const bMs = Date.parse(b.endDate ?? b.drawDate);
        const aVal = Number.isFinite(aMs) ? aMs : Number.POSITIVE_INFINITY;
        const bVal = Number.isFinite(bMs) ? bMs : Number.POSITIVE_INFINITY;
        return aVal - bVal;
      });
    }

    return base;
  }, [items, search, filter]);

  const onReact = useCallback(
    async (raffleId: string, type: "LIKE" | "HEART") => {
      try {
        const res = await reactToRaffle(raffleId, type);
        const active = Boolean(res?.active);

        setItems((prev) =>
          prev.map((r) => {
            if (String(r.id) !== String(raffleId)) return r;

            const prevReaction = r.myReaction ?? null;
            const nextReaction = active ? type : null;

            const counts = { ...(r.reactionCounts ?? {}) } as { LIKE?: number; HEART?: number };
            const dec = (k: "LIKE" | "HEART") => {
              counts[k] = Math.max(0, Number(counts[k] ?? 0) - 1);
            };
            const inc = (k: "LIKE" | "HEART") => {
              counts[k] = Number(counts[k] ?? 0) + 1;
            };

            if (prevReaction && prevReaction !== nextReaction) dec(prevReaction);
            if (nextReaction && prevReaction !== nextReaction) inc(nextReaction);

            return { ...r, myReaction: nextReaction, reactionCounts: counts };
          }),
        );
      } catch (e) {
        setToast(e instanceof Error ? e.message : "No se pudo reaccionar");
      }
    },
    [],
  );

  const onShare = useCallback(async (raffle: Raffle) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/rifas/${raffle.id}` : `/rifas/${raffle.id}`;
    const title = raffle.title || "Rifa";
    const text = `Mira esta rifa: ${title}`;

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        // @ts-expect-error - navigator.share no está tipado en algunos targets
        await navigator.share({ title, text, url });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setToast("Link copiado");
        return;
      }
      setToast("Tu navegador no soporta compartir");
    } catch {
      // usuario canceló o no permitido
    }
  }, []);

  return (
    <RequireAuth>
      <AppShell title="Rifas" subtitle="Rifas activas (incluye agotadas).">
        <section className="app-glass rounded-3xl p-5">
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === "all" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilter("ending")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === "ending" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
              >
                Por terminar
              </button>
              <button
                type="button"
                onClick={() => setFilter("price")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${filter === "price" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
              >
                Baratas
              </button>
            </div>
          </div>

          {error && <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}

          {toast && <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">{toast}</div>}

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
              const isSoldOut = Boolean(raffle.isSoldOut ?? remaining <= 0);
              const banner =
                raffle.style?.gallery?.[0] ||
                raffle.style?.bannerImage ||
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

              const closeLabel = raffle.endDate ?? raffle.drawDate;
              const closeText = closeLabel && closeLabel !== "Por definir" ? `Cierra: ${new Date(closeLabel).toLocaleDateString()}` : "Cierre por definir";
              const likeCount = Number(raffle.reactionCounts?.LIKE ?? 0);
              const heartCount = Number(raffle.reactionCounts?.HEART ?? 0);
              const my = raffle.myReaction ?? null;
              const rifero = raffle.user?.name || "Organizador";

              return (
                <article key={raffle.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
                  <div className="relative h-56 w-full bg-black/40">
                    <Image src={banner} alt={raffle.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">{closeText}</div>
                      <div className={`rounded-full px-3 py-1 text-xs font-extrabold ${isSoldOut ? "bg-yellow-400 text-black" : "bg-emerald-400 text-black"}`}>
                        {isSoldOut ? "AGOTADA" : "ACTIVA"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                      <p className="text-xs text-white/70">
                        Rifero: <span className="text-white/90">{rifero}</span>
                        {raffle.user?.identityVerified ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-200">Verificado</span> : null}
                        {raffle.user?.isBoosted ? <span className="ml-2 rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">Boost</span> : null}
                      </p>
                      {raffle.description ? <p className="text-sm text-white/70 line-clamp-2">{raffle.description}</p> : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">{formatMoneyVES(Number(raffle.price || 0))} / boleto</span>
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

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onReact(String(raffle.id), "LIKE")}
                          className={`rounded-full border px-3 py-2 text-xs font-extrabold ${my === "LIKE" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
                        >
                          LIKE · {likeCount}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReact(String(raffle.id), "HEART")}
                          className={`rounded-full border px-3 py-2 text-xs font-extrabold ${my === "HEART" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
                        >
                          HEART · {heartCount}
                        </button>
                        <button
                          type="button"
                          disabled={!canShare()}
                          onClick={() => onShare(raffle)}
                          className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/80 hover:bg-white/10 disabled:opacity-50"
                        >
                          Compartir
                        </button>
                      </div>

                      <Link
                        href={`/rifas/${raffle.id}`}
                        className="rounded-full bg-neon-orange-gradient px-4 py-2 text-xs font-extrabold text-black glow-neon-orange"
                      >
                        Ver
                      </Link>
                    </div>
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
