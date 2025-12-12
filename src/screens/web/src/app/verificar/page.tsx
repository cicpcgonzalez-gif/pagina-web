"use client";

import { useState } from "react";
import { safeVerify } from "@/lib/verify-ticket";

export default function VerificarPage() {
  const [serial, setSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await safeVerify(serial);
      setResult(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo verificar.";
      setResult(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0f172a]/70">Verificar boleto</p>
        <h1 className="font-[var(--font-display)] text-3xl text-[#0f172a] sm:text-4xl">Valida un boleto</h1>
        <p className="text-base text-[#0f172a]/75">
          Ingresa el serial o código del boleto. Se llama al endpoint `/verify-ticket/:serial`.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#0f172a]/80" htmlFor="serial">Serial o código</label>
          <input
            id="serial"
            className="rounded-lg border border-[#0f172a]/15 bg-white px-3 py-2 text-sm text-[#0f172a] outline-none focus:border-[#ff8c6f]/70 focus:shadow-[0_0_0_3px_rgba(255,140,111,0.15)]"
            placeholder="ABC-123"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#ff8c6f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff8c6f]/30 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verificando..." : "Verificar"}
        </button>
      </form>

      {result && (
        <div className="mt-4 rounded-lg border border-[#0f172a]/10 bg-white/85 px-3 py-2 text-sm text-[#0f172a] shadow-sm shadow-black/5">
          {result}
        </div>
      )}
    </main>
  );
}
