"use client";

import { useState } from "react";

export default function AdminExportsPage() {
  const [status, setStatus] = useState<string | null>(null);

  const runExport = (type: string) => {
    setStatus(`Export ${type} generado (mock local). Descarga simulada.`);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Exportes</h1>
      <p className="mt-2 text-white/80">Descarga CSV/PDF de ventas y boletos (mock).</p>

      <div className="mt-6 grid gap-3">
        {["Ventas CSV", "Ventas PDF", "Boletos CSV", "Boletos PDF"].map((item) => (
          <button
            key={item}
            onClick={() => runExport(item)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-[#22d3ee]/60"
          >
            {item}
          </button>
        ))}
      </div>

      {status && <p className="mt-4 text-sm text-white/85">{status}</p>}
    </main>
  );
}
