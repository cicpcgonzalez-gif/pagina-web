"use client";

import { useMemo, useState } from "react";

export default function AdminTicketsPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const recent = useMemo(
    () => [
      { code: "TK-12001", raffle: "Camioneta 4x4", status: "valido", at: "2025-12-12 11:40" },
      { code: "TK-11988", raffle: "iPhone 16 Pro", status: "ya usado", at: "2025-12-12 10:05" },
      { code: "TK-11970", raffle: "Moto 150cc", status: "no existe", at: "2025-12-11 19:33" },
    ],
    [],
  );

  const statusClass = (status: string) => {
    if (status === "valido") return "bg-emerald-500/15 text-emerald-100 border-emerald-200/30";
    if (status === "ya usado") return "bg-amber-500/15 text-amber-100 border-amber-200/30";
    return "bg-rose-500/15 text-rose-100 border-rose-200/30";
  };

  const handleValidate = () => {
    if (!code.trim()) {
      setResult("Ingresa un código");
      return;
    }
    const normalized = code.trim().toUpperCase();
    if (normalized.startsWith("TK-12")) {
      setResult(`OK: ${normalized} válido para canje`);
    } else {
      setResult(`No válido: ${normalized} no existe`);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Validar boletos</h1>
      <p className="mt-2 text-white/80">Escanea o ingresa el código del boleto. Mock de prueba.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: TK-12001"
            className="w-full rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
          />
          <button
            onClick={handleValidate}
            className="rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]"
          >
            Validar
          </button>
        </div>
        {result && <p className="mt-3 text-sm text-white/85">{result}</p>}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/10 text-xs uppercase text-white/70">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Rifa</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((item) => (
              <tr key={item.code} className="border-t border-white/10">
                <td className="px-4 py-3 font-semibold text-white">{item.code}</td>
                <td className="px-4 py-3">{item.raffle}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/60">{item.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
