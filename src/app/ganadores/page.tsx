"use client";

import { useEffect, useState } from "react";
import { fetchWinners } from "@/lib/api";
import type { Winner } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";

export default function GanadoresPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <RequireAuth>
      <AppShell title="Ganadores" subtitle="Muro de la Fama: resultados reales.">

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
        )}
        {loading && <p className="text-sm text-white/70">Cargando...</p>}

        <div className="grid gap-4">
          {!loading && !error && winners.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">Aún no hay ganadores registrados.</div>
          )}

          {winners.map((w) => (
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
                    <p className="text-xs text-white/60">{w.drawDate ? new Date(w.drawDate).toLocaleDateString() : "Fecha no disponible"}</p>
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
