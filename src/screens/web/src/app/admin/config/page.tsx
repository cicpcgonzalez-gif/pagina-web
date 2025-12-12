"use client";

import { useState } from "react";

export default function AdminConfigPage() {
  const [brand, setBrand] = useState({ name: "Megarifas", primary: "#3b82f6", secondary: "#22d3ee" });
  const [payments, setPayments] = useState({ provider: "Stripe", webhook: "https://example.com/webhook" });
  const [limits, setLimits] = useState({ maxTickets: 100, maxRaffles: 10 });
  const [message, setMessage] = useState<string | null>(null);

  const saveAll = () => {
    setMessage("Configuración guardada (mock local). Ajusta para API real.");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Parámetros del sistema</h1>
      <p className="mt-2 text-white/80">Branding, pasarelas y límites (mock local).</p>

      <div className="mt-6 grid gap-4">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Branding</h2>
          <div className="mt-3 grid gap-3 text-sm text-white/80">
            <label className="grid gap-1">
              <span>Nombre</span>
              <input
                value={brand.name}
                onChange={(e) => setBrand((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Color primario</span>
              <input
                value={brand.primary}
                onChange={(e) => setBrand((prev) => ({ ...prev, primary: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Color secundario</span>
              <input
                value={brand.secondary}
                onChange={(e) => setBrand((prev) => ({ ...prev, secondary: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Pasarelas</h2>
          <div className="mt-3 grid gap-3 text-sm text-white/80">
            <label className="grid gap-1">
              <span>Proveedor</span>
              <input
                value={payments.provider}
                onChange={(e) => setPayments((prev) => ({ ...prev, provider: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Webhook</span>
              <input
                value={payments.webhook}
                onChange={(e) => setPayments((prev) => ({ ...prev, webhook: e.target.value }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Límites</h2>
          <div className="mt-3 grid gap-3 text-sm text-white/80">
            <label className="grid gap-1">
              <span>Máx. rifas activas</span>
              <input
                type="number"
                value={limits.maxRaffles}
                onChange={(e) => setLimits((prev) => ({ ...prev, maxRaffles: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
            <label className="grid gap-1">
              <span>Máx. boletos por compra</span>
              <input
                type="number"
                value={limits.maxTickets}
                onChange={(e) => setLimits((prev) => ({ ...prev, maxTickets: Number(e.target.value) }))}
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
              />
            </label>
          </div>
        </section>
      </div>

      <button
        onClick={saveAll}
        className="mt-6 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]"
      >
        Guardar
      </button>

      {message && <p className="mt-3 text-sm text-white/85">{message}</p>}
    </main>
  );
}
