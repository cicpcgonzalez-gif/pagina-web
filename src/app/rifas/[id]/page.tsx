"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchRaffle, fetchRafflePaymentDetails, initiatePayment, purchaseTickets, reactToRaffle, submitManualPayment } from "@/lib/api";
import type { PaymentDetails } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";

type AssignedNumbers = Array<string | number>;

function formatMoneyVES(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(n);
}

function formatTicketNumber(value: string | number, digits?: number) {
  const s = String(value);
  if (!digits || digits <= 0) return s;
  const onlyDigits = s.replace(/\D/g, "");
  if (!onlyDigits) return s;
  return onlyDigits.padStart(digits, "0");
}

function canShare() {
  return typeof navigator !== "undefined" && ("share" in navigator || "clipboard" in navigator);
}

export default function RaffleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [raffle, setRaffle] = useState<Awaited<ReturnType<typeof fetchRaffle>> | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [assigned, setAssigned] = useState<AssignedNumbers>([]);
  const [processing, setProcessing] = useState(false);
  const [manualProof, setManualProof] = useState<string | null>(null);
  const [manualRef, setManualRef] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return undefined;

    const load = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const data = await fetchRaffle(id);
        if (mounted) {
          setRaffle(data);
          const gallery = data.style?.gallery ?? [];
          setSelectedImage(gallery[0] || data.style?.bannerImage || null);
        }
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

  useEffect(() => {
    let mounted = true;
    if (!raffle) return;

    const loadDetails = async () => {
      try {
        const details = await fetchRafflePaymentDetails(raffle.id);
        if (mounted) setPaymentDetails(details);
      } catch {
        if (mounted) setPaymentDetails(null);
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [raffle]);

  const progress = useMemo(() => {
    if (!raffle) return 0;
    const sold = raffle.ticketsTotal - raffle.ticketsAvailable;
    if (!raffle.ticketsTotal) return 0;
    return Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)));
  }, [raffle]);

  const banner = useMemo(() => {
    if (!raffle) return "";
    const gallery = raffle.style?.gallery ?? [];
    return selectedImage || gallery[0] || raffle.style?.bannerImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";
  }, [raffle, selectedImage]);

  const isClosed = useMemo(() => {
    if (!raffle) return false;
    if (raffle.status !== "activa") return true;
    const endMs = Date.parse(raffle.endDate ?? raffle.drawDate);
    if (Number.isFinite(endMs) && endMs > 0 && endMs < Date.now()) return true;
    return false;
  }, [raffle]);

  const isSoldOut = useMemo(() => {
    if (!raffle) return false;
    return Boolean(raffle.isSoldOut ?? raffle.ticketsAvailable <= 0);
  }, [raffle]);

  const minQty = useMemo(() => {
    if (!raffle) return 1;
    return Math.max(1, Number(raffle.minTickets ?? 1));
  }, [raffle]);

  const onPurchase = async () => {
    if (!raffle) return;
    if (isClosed || isSoldOut) {
      setMessage(isSoldOut ? "Esta rifa está AGOTADA." : "Esta rifa está CERRADA." );
      return;
    }
    setProcessing(true);
    setMessage(null);
    setAssigned([]);
    try {
      const qty = Number.isFinite(quantity) && quantity >= minQty ? quantity : minQty;
      const res = await purchaseTickets(Number(raffle.id), qty);
      const numbers = (res as any)?.numbers;
      if (Array.isArray(numbers)) {
        setAssigned(numbers);
        setMessage(`Compra confirmada. Números: ${numbers.map((n: any) => formatTicketNumber(n, raffle.digits)).join(", ")}`);
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
    if (isClosed || isSoldOut) {
      setMessage(isSoldOut ? "Esta rifa está AGOTADA." : "Esta rifa está CERRADA." );
      return;
    }
    setProcessing(true);
    setMessage(null);
    try {
      const qty = Number.isFinite(quantity) && quantity >= minQty ? quantity : minQty;
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
    if (isClosed || isSoldOut) {
      setMessage(isSoldOut ? "Esta rifa está AGOTADA." : "Esta rifa está CERRADA." );
      return;
    }
    setProcessing(true);
    setMessage(null);
    try {
      const qty = Number.isFinite(quantity) && quantity >= minQty ? quantity : minQty;
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

  const onReact = async (type: "LIKE" | "HEART") => {
    if (!raffle) return;
    try {
      const res = await reactToRaffle(raffle.id, type);
      const active = Boolean(res?.active);
      setRaffle((prev) => {
        if (!prev) return prev;
        const prevReaction = prev.myReaction ?? null;
        const nextReaction = active ? type : null;
        const counts = { ...(prev.reactionCounts ?? {}) } as { LIKE?: number; HEART?: number };
        const dec = (k: "LIKE" | "HEART") => {
          counts[k] = Math.max(0, Number(counts[k] ?? 0) - 1);
        };
        const inc = (k: "LIKE" | "HEART") => {
          counts[k] = Number(counts[k] ?? 0) + 1;
        };
        if (prevReaction && prevReaction !== nextReaction) dec(prevReaction);
        if (nextReaction && prevReaction !== nextReaction) inc(nextReaction);
        return { ...prev, myReaction: nextReaction, reactionCounts: counts };
      });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo reaccionar");
    }
  };

  const onShare = async () => {
    if (!raffle) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        // @ts-expect-error - navigator.share no está tipado en algunos targets
        await navigator.share({ title: raffle.title, text: `Mira esta rifa: ${raffle.title}`, url });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMessage("Link copiado");
      }
    } catch {
      // cancelado por usuario
    }
  };

  if (loading) {
    return (
      <RequireAuth>
        <AppShell title="Rifa" subtitle="Cargando detalles...">
          <p className="text-sm text-white/70">Cargando detalles de la rifa...</p>
        </AppShell>
      </RequireAuth>
    );
  }

  if (!raffle) {
    return (
      <RequireAuth>
        <AppShell title="Rifa no encontrada" subtitle="Vuelve al mural e inténtalo de nuevo.">
          <p className="text-sm text-white/70">No pudimos encontrar los detalles para esta rifa.</p>
        </AppShell>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AppShell title={raffle.title} subtitle="Compra y pagos en un solo lugar.">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30">
          <div className="relative h-72 w-full overflow-hidden rounded-xl">
            {banner && (
              <Image src={banner} alt={raffle.title} fill className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0f172a] shadow">
                Cierra {raffle.endDate ?? raffle.drawDate}
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-extrabold ${isSoldOut ? "bg-yellow-400 text-black" : isClosed ? "bg-white/70 text-black" : "bg-emerald-400 text-black"}`}>
                {isSoldOut ? "AGOTADA" : isClosed ? "CERRADA" : "ACTIVA"}
              </div>
            </div>
          </div>

          {(raffle.style?.gallery?.length ?? 0) > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(raffle.style?.gallery ?? []).slice(0, 8).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSelectedImage(src)}
                  className={`relative h-16 w-24 overflow-hidden rounded-lg border ${selectedImage === src ? "border-white/30" : "border-white/10"}`}
                >
                  <Image src={src} alt="Imagen" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">{raffle.title}</h1>
            <p className="text-white/75">{raffle.description ?? "Participa con confianza, asignamos tus números automáticamente."}</p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span className="rounded-full bg-white/10 px-2 py-1">{formatMoneyVES(raffle.price)} por boleto</span>
              {raffle.minTickets ? <span className="rounded-full bg-white/10 px-2 py-1">Mínimo: {raffle.minTickets}</span> : null}
              {raffle.digits ? <span className="rounded-full bg-white/10 px-2 py-1">Dígitos: {raffle.digits}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onReact("LIKE")}
              className={`rounded-full border px-3 py-2 text-xs font-extrabold ${raffle.myReaction === "LIKE" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
            >
              LIKE · {Number(raffle.reactionCounts?.LIKE ?? 0)}
            </button>
            <button
              type="button"
              onClick={() => onReact("HEART")}
              className={`rounded-full border px-3 py-2 text-xs font-extrabold ${raffle.myReaction === "HEART" ? "border-white/25 bg-white/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}
            >
              HEART · {Number(raffle.reactionCounts?.HEART ?? 0)}
            </button>
            <button
              type="button"
              disabled={!canShare()}
              onClick={onShare}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              Compartir
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Progreso</span>
              <span>{progress}% vendido</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-neon-blue-gradient" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-white/60">
              Disponibles: {raffle.ticketsAvailable} / {raffle.ticketsTotal}
            </p>
          </div>

          {raffle.instantWins ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <p className="font-semibold text-white">Premios instantáneos</p>
              <p className="text-xs text-white/60">Algunos números pueden ganar al instante.</p>
              <p className="mt-2 text-sm text-white/80">
                {Array.isArray(raffle.instantWins)
                  ? raffle.instantWins.map((v) => formatTicketNumber(v, raffle.digits)).join(", ")
                  : String(raffle.instantWins)}
              </p>
            </div>
          ) : null}

          {paymentDetails?.seller ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <p className="font-semibold text-white">Rifero</p>
              <p className="text-xs text-white/60">
                {paymentDetails.seller.name ?? "Organizador"}
                {paymentDetails.seller.identityVerified ? <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-200">Verificado</span> : null}
              </p>
              {paymentDetails.seller.securityIdLast8 ? <p className="mt-1 text-xs text-white/60">ID: ****{paymentDetails.seller.securityIdLast8}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Cantidad de boletos</span>
            <input
              type="number"
              min={minQty}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24 rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
            />
          </div>

          {minQty > 1 ? <p className="text-xs text-white/60">Compra mínima: {minQty} boletos.</p> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={onPurchase} size="lg" disabled={processing || isClosed || isSoldOut} className="bg-neon-blue-gradient text-white">
              {processing ? "Procesando..." : "Comprar"}
            </Button>
            <Button onClick={onPay} size="lg" variant="outline" disabled={processing || isClosed || isSoldOut} className="border-white/30 text-white hover:border-white/60">
              Pagar ahora
            </Button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            <p className="font-semibold text-white">Pago manual</p>
            <p className="text-xs text-white/60">Sube tu comprobante y referencia si pagas por transferencia.</p>

            {paymentDetails?.paymentMethods?.length ? (
              <p className="mt-2 text-xs text-white/60">Métodos: {paymentDetails.paymentMethods.join(" · ")}</p>
            ) : null}

            {paymentDetails?.bankDetails ? (
              <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/70">
                <p className="font-semibold text-white/80">Datos bancarios</p>
                <pre className="mt-1 whitespace-pre-wrap wrap-break-word text-[11px] leading-snug text-white/70">{JSON.stringify(paymentDetails.bankDetails, null, 2)}</pre>
              </div>
            ) : null}

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
              <Button onClick={onManualPayment} disabled={processing || isClosed || isSoldOut} variant="ghost" className="border border-white/20 text-white">
                Enviar pago manual
              </Button>
            </div>
          </div>

          {assigned.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Números asignados: {assigned.map((n) => formatTicketNumber(n, raffle.digits)).join(", ")}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white">
              {message}
            </div>
          )}
        </div>
      </div>
      </AppShell>
    </RequireAuth>
  );
}
