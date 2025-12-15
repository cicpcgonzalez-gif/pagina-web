"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchRaffle, initiatePayment, purchaseTickets, submitManualPayment } from "@/lib/api";

type AssignedNumbers = Array<string | number>;

export default function RaffleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [raffle, setRaffle] = useState<Awaited<ReturnType<typeof fetchRaffle>> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<AssignedNumbers>([]);
  const [processing, setProcessing] = useState(false);
  const [manualProof, setManualProof] = useState<string | null>(null);
  const [manualRef, setManualRef] = useState("");
  const [manualNote, setManualNote] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!id) return undefined;

    const load = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const data = await fetchRaffle(id);
        if (mounted) setRaffle(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudo cargar la rifa.";
        if (mounted) setMessage(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const progress = useMemo(() => {
    if (!raffle) return 0;
    const sold = raffle.ticketsTotal - raffle.ticketsAvailable;
    if (!raffle.ticketsTotal) return 0;
    return Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)));
  }, [raffle]);

  const banner = useMemo(() => {
    if (!raffle) return "";
    const gallery = raffle.style?.gallery ?? [];
    return gallery[0] || raffle.style?.bannerImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";
  }, [raffle]);

  const onPurchase = async () => {
    if (!raffle) return;
    setProcessing(true);
    setMessage(null);
    setAssigned([]);
    try {
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      const res = await purchaseTickets(Number(raffle.id), qty);
      const numbers = (res as any)?.numbers;
      if (Array.isArray(numbers)) {
        setAssigned(numbers);
        setMessage(`Compra confirmada. Números: ${numbers.join(", ")}`);
      } else {
        setMessage(`Compra registrada (${qty} boleto/s).`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo completar la compra.";
      setMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  const onPay = async () => {
    if (!raffle) return;
    setProcessing(true);
    setMessage(null);
    try {
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      const res = await initiatePayment({ raffleId: Number(raffle.id), quantity: qty });
      if (res?.paymentUrl) {
        window.open(res.paymentUrl, "_blank");
        setMessage("Pago iniciado en una pestaña nueva.");
      } else {
        setMessage("Pago iniciado, revisa tu correo o notificaciones.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo iniciar el pago.";
      setMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  const onManualPayment = async () => {
    if (!raffle) return;
    setProcessing(true);
    setMessage(null);
    try {
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      const payload = {
        quantity: qty,
        reference: manualRef,
        note: manualNote,
        proof: manualProof ?? undefined,
      };
      await submitManualPayment(Number(raffle.id), payload);
      setManualNote("");
      setManualRef("");
      setManualProof(null);
      setMessage("Pago manual enviado para validación.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo registrar el pago.";
      setMessage(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleProof = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setManualProof(result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>Cargando detalles de la rifa...</p>
      </main>
    );
  }

  if (!raffle) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Rifa no encontrada</h1>
        <p>No pudimos encontrar los detalles para esta rifa. Por favor, vuelve al mural.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto grid w-full max-w-[480px] gap-8 px-4 pb-20 pt-10 md:max-w-5xl md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="relative h-72 w-full overflow-hidden rounded-xl">
            {banner && (
              <Image src={banner} alt={raffle.title} fill className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1224]/70 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0f172a] shadow">
              Sorteo {raffle.drawDate}
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">{raffle.title}</h1>
            <p className="text-white/75">{raffle.description ?? "Participa con confianza, asignamos tus números automáticamente."}</p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">{raffle.status}</span>
              <span className="rounded-full bg-white/10 px-2 py-1">${raffle.price.toFixed(2)} por boleto</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Progreso</span>
              <span>{progress}% vendido</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/60">
              Disponibles: {raffle.ticketsAvailable} / {raffle.ticketsTotal}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Cantidad de boletos</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24 rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={onPurchase} size="lg" disabled={processing} className="bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] text-white">
              {processing ? "Procesando..." : "Comprar"}
            </Button>
            <Button onClick={onPay} size="lg" variant="outline" disabled={processing} className="border-white/30 text-white hover:border-white/60">
              Pagar ahora
            </Button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            <p className="font-semibold text-white">Pago manual</p>
            <p className="text-xs text-white/60">Sube tu comprobante y referencia si pagas por transferencia.</p>
            <div className="mt-2 grid gap-2">
              <input
                type="text"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                placeholder="Referencia (últimos 4 dígitos)"
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="text"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Nota (opcional)"
                className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProof(e.target.files?.[0])}
                className="text-xs text-white/70"
              />
              <Button onClick={onManualPayment} disabled={processing} variant="ghost" className="border border-white/20 text-white">
                Enviar pago manual
              </Button>
            </div>
          </div>

          {assigned.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Números asignados: {assigned.join(", ")}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
