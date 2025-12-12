"use client";

import { useEffect, useState } from "react";
import { fetchRaffles, initiatePayment, purchaseTickets } from "@/lib/api";
import { isAuthenticated } from "@/lib/session";

export default function RifasPage() {
  const [raffles, setRaffles] = useState<Awaited<ReturnType<typeof fetchRaffles>>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated()) {
      setMessage("Inicia sesión para ver rifas.");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    fetchRaffles()
      .then((data) => {
        if (mounted) setRaffles(data);
      })
      .catch(() => {
        if (mounted) setMessage("No se pudieron cargar las rifas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePurchase = async (raffleId: string | number) => {
    setMessage(null);
    try {
      const qty = quantity[String(raffleId)] ?? 1;
      await purchaseTickets(Number(raffleId), qty);
      setMessage(`Compra registrada (${qty} boleto/s).`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo comprar.";
      setMessage(msg);
    }
  };

  const handlePayment = async (raffleId: string | number) => {
    setMessage(null);
    try {
      const qty = quantity[String(raffleId)] ?? 1;
      const res = await initiatePayment({ raffleId: Number(raffleId), quantity: qty });
      if (res?.paymentUrl) {
        window.open(res.paymentUrl, "_blank");
        setMessage("Pago iniciado en nueva pestaña.");
      } else {
        setMessage("Pago iniciado, revisa tu bandeja o notificaciones.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
      setMessage(msg);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#0f172a]/70">Rifas activas</p>
        <h1 className="font-[var(--font-display)] text-3xl text-[#0f172a] sm:text-4xl">
          Catálogo listo para vender y pagar en línea.
        </h1>
        <p className="text-base text-[#0f172a]/75">
          Datos en vivo desde `/raffles`. Selecciona cantidad, compra o inicia el pago directamente.
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-[#0f172a]/10 bg-white/80 px-3 py-2 text-sm text-[#0f172a] shadow-sm shadow-black/5">
          {message}
        </div>
      )}

      {loading && <p className="mt-6 text-sm text-[#0f172a]">Cargando rifas...</p>}

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {raffles.map((raffle) => {
          const sold = raffle.ticketsTotal - raffle.ticketsAvailable;
          const progress = raffle.ticketsTotal
            ? Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)))
            : 0;

          return (
            <article
              key={raffle.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#0f172a]/10 bg-white/85 p-5 shadow-lg shadow-black/5"
            >
              <div className="flex items-center justify-between text-xs text-[#0f172a]/70">
                <span>{raffle.drawDate}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    raffle.status === "activa"
                      ? "bg-emerald-500/15 text-emerald-700"
                      : raffle.status === "pausada"
                        ? "bg-amber-400/20 text-amber-800"
                        : "bg-[#0f172a]/10 text-[#0f172a]/70"
                  }`}
                >
                  {raffle.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">{raffle.title}</h3>
              <p className="text-sm text-[#0f172a]/75">Precio: ${raffle.price.toFixed(2)}</p>
              <div className="rounded-lg border border-[#0f172a]/10 bg-[#0f172a]/5 p-3 text-sm text-[#0f172a]">
                <div className="flex items-center justify-between text-xs text-[#0f172a]/70">
                  <span>Disponibles</span>
                  <span>
                    {raffle.ticketsAvailable} / {raffle.ticketsTotal}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#ff8c6f] to-[#4078d1]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#0f172a]/80">
                <label className="text-xs uppercase">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  defaultValue={1}
                  onChange={(e) => setQuantity((prev) => ({ ...prev, [raffle.id]: Number(e.target.value) }))}
                  className="w-20 rounded-lg border border-[#0f172a]/15 bg-white px-2 py-1 text-sm text-[#0f172a]"
                />
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  className="flex-1 rounded-lg bg-[#ff8c6f] px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#ff8c6f]/30"
                  onClick={() => handlePurchase(raffle.id)}
                  disabled={loading}
                >
                  Comprar
                </button>
                <button
                  className="rounded-lg border border-[#4078d1]/40 px-4 py-2 text-[#4078d1] transition hover:-translate-y-[1px] hover:border-[#4078d1]/60"
                  onClick={() => handlePayment(raffle.id)}
                  disabled={loading}
                >
                  Pagar
                </button>
                <button className="rounded-lg border border-[#0f172a]/15 px-4 py-2 text-[#0f172a] transition hover:border-[#0f172a]/40">
                  Detalles
                </button>
              </div>
            </article>
          );
        })}
        {!loading && raffles.length === 0 && (
          <p className="text-sm text-[#0f172a]/75">No hay rifas disponibles.</p>
        )}
      </section>
    </main>
  );
}
