"use client";

import { useEffect, useState } from "react";
import { fetchWinners } from "@/lib/api";
import type { Winner } from "@/lib/types";
import { Trophy } from "lucide-react";

export default function WinnersTicker() {
  const [items, setItems] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchWinners();
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!mounted) return;
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-purple-500/30 bg-slate-900/70 px-4 py-3 shadow-inner shadow-purple-900/20">
        <div className="flex items-center gap-2 text-purple-100 animate-pulse">
          <Trophy className="h-4 w-4" />
          <span className="text-sm">Cargando ganadores...</span>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  const marquee = [...items, ...items];

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/70 px-4 py-3 shadow-inner shadow-purple-900/20">
      <div className="flex items-center gap-2 text-purple-100 mb-2">
        <Trophy className="h-4 w-4" />
        <span className="text-sm font-semibold">Ganadores recientes</span>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-[marquee_18s_linear_infinite]">
          {marquee.map((w, idx) => (
            <div
              key={`${w.id ?? idx}-${idx}`}
              className="flex items-center gap-3 rounded-xl bg-slate-800/80 px-3 py-2 min-w-60 border border-slate-700"
            >
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 text-white grid place-items-center text-xs font-bold">
                {w.user?.name?.charAt(0)?.toUpperCase() ?? "G"}
              </div>
              <div className="text-xs leading-tight text-slate-100">
                <p className="font-semibold">{w.user?.name ?? "Ganador"}</p>
                <p className="text-[11px] text-slate-300">{w.raffle?.title ?? "Rifa"}</p>
                <p className="text-[11px] text-amber-300 font-semibold">{w.prize ?? "Premio"}</p>
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </div>
  );
}
