"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchInstantWinsFeed, fetchWinners } from "@/lib/api";
import type { Winner } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import { Search, XCircle } from "lucide-react";

type InstantWinItem = {
  id?: string | number;
  user?: { name?: string };
  ticketNumber?: string | number;
  raffle?: { title?: string };
  prize?: string;
};

function formatTickerItem(item: InstantWinItem) {
  const userName = item?.user?.name ? String(item.user.name) : "Alguien";
  const ticketNumber = item?.ticketNumber != null ? `#${item.ticketNumber}` : "#—";
  const raffleTitle = item?.raffle?.title ? String(item.raffle.title) : "Rifa";
  const prize = item?.prize ? String(item.prize) : "";
  const prizePart = prize ? ` (${prize})` : "";
  return `Ganador bendecido: ${userName} ${ticketNumber} - ${raffleTitle}${prizePart}`;
}

export default function GanadoresPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [tickerItems, setTickerItems] = useState<InstantWinItem[]>([]);
  const seenIdsRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchWinners()
      .then((data) => {
        if (!mounted) return;
        setWinners(Array.isArray(data) ? (data as Winner[]) : []);
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

  useEffect(() => {
    let alive = true;

    const poll = async () => {
      const raw = await fetchInstantWinsFeed(80);
      if (!alive) return;
      if (!Array.isArray(raw)) return;

      const ordered = [...raw].reverse();
      const next: InstantWinItem[] = [];
      for (const w of ordered) {
        const id = (w as any)?.id;
        if (!id) continue;
        if (seenIdsRef.current.has(id)) continue;
        seenIdsRef.current.add(id);
        next.push(w as any);
      }
      if (next.length > 0) {
        setTickerItems((prev) => [...prev, ...next]);
      }
    };

    poll();
    const id = window.setInterval(poll, 10_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  const filteredWinners = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return winners;
    return winners.filter((w) => {
      const n = (w.user?.name || "").toLowerCase();
      const p = (w.prize || "").toLowerCase();
      const r = (w.raffle?.title || "").toLowerCase();
      return n.includes(q) || p.includes(q) || r.includes(q);
    });
  }, [winners, search]);

  const tickerText = useMemo(() => {
    const parts = (tickerItems || []).map(formatTickerItem).filter(Boolean);
    return parts.join(" | ");
  }, [tickerItems]);

  return (
    <RequireAuth>
      <AppShell title="Ganadores" subtitle="Muro de la Fama: resultados reales.">

        {tickerText ? (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-night-sky">
            <div className="border-b border-white/10 px-4 py-2 text-xs font-extrabold text-white/70">Bendecidos</div>
            <div className="relative h-10 overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-night-sky to-transparent" />
              <div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-night-sky to-transparent" />
              <div className="h-10 whitespace-nowrap px-4">
                <div className="inline-block will-change-transform" style={{ animation: "marquee 28s linear infinite" }}>
                  <span className="text-xs font-bold text-white/70">{tickerText}</span>
                  <span className="px-8" />
                  <span className="text-xs font-bold text-white/70">{tickerText}</span>
                </div>
              </div>
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-sky px-3 py-2">
            <Search className="h-5 w-5 text-white/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ganador, premio o rifa..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
            {search ? (
              <button type="button" onClick={() => setSearch("")} className="text-white/50 hover:text-white" aria-label="Limpiar">
                <XCircle className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
        )}
        {loading && <p className="text-sm text-white/70">Cargando...</p>}

        <div className="grid gap-4">
          {!loading && !error && filteredWinners.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {search ? "No se encontraron ganadores." : "Aún no hay ganadores registrados."}
            </div>
          )}

          {filteredWinners.map((w) => (
            <article key={w.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
              {w.photoUrl && (
                <div
                  className="h-64 w-full bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(140deg, rgba(8,13,26,0.55), rgba(8,13,26,0.15)), url(${w.photoUrl})` }}
                />
              )}
              <div className="space-y-3 p-5 text-sm text-white/80">
                <div className="flex items-center gap-3">
                  {w.user?.avatar ? (
                    <div
                      className="h-12 w-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${w.user.avatar})` }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/70">🏅</div>
                  )}
                  <div className="leading-tight">
                    <p className="text-base font-semibold text-white">{w.user?.name || "Ganador"}</p>
                    <p className="text-xs text-white/60">
                      {w.drawDate ? new Date(w.drawDate).toLocaleDateString() : "Fecha no disponible"}
                      {w.raffle?.title ? ` • ${w.raffle.title}` : ""}
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">Premio</span>
                </div>
                <p className="text-lg font-semibold text-amber-200">Premio: {w.prize || w.raffle?.title || "—"}</p>
                {w.testimonial && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/80">
                    <p className="italic">“{w.testimonial}”</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
