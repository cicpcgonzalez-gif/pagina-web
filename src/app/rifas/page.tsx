/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileLinkButton } from "@/components/ProfileLinkButton";
import { fetchRaffles, initiatePayment, purchaseTickets } from "@/lib/api";
import { getUserRole, isAuthenticated } from "@/lib/session";

export default function RifasPage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Awaited<ReturnType<typeof fetchRaffles>>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [role, setRole] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "closing" | "cheap">("all");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const normalizedRole = role?.toLowerCase() || "";
  const isAdminOnly = normalizedRole === "admin";
  const isSuperAdmin = normalizedRole === "superadmin";

  const winners = [
    { name: "Mariana R.", prize: "iPhone 16 Pro", ticket: "0042" },
    { name: "Carlos D.", prize: "Viaje Cancún", ticket: "1321" },
    { name: "Lucía M.", prize: "Moto 150cc", ticket: "0910" },
  ];

  const fallbackImages = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  ];

  useEffect(() => {
    let mounted = true;
    const authed = isAuthenticated();
    if (!authed) {
      router.replace("/login?redirect=/rifas");
      return () => {
        mounted = false;
      };
    }

    const storedRole = getUserRole();
    if (mounted) setRole(storedRole);

    fetchRaffles()
      .then((data) => {
        if (mounted) setRaffles(data);
      })
      .catch(() => {
        if (mounted) setMessage("No se pudieron cargar las rifas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
        if (mounted) setCheckingAuth(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (checkingAuth) return null;

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

  const filteredRaffles = useMemo(() => {
    const arr = raffles.slice();
    if (filter === "cheap") {
      return arr.sort((a, b) => a.price - b.price);
    }
    if (filter === "closing") {
      return arr.sort((a, b) => {
        const ta = new Date(a.drawDate).getTime();
        const tb = new Date(b.drawDate).getTime();
        const safeA = Number.isFinite(ta) ? ta : Number.MAX_SAFE_INTEGER;
        const safeB = Number.isFinite(tb) ? tb : Number.MAX_SAFE_INTEGER;
        return safeA - safeB;
      });
    }
    return arr;
  }, [raffles, filter]);

  const navButtons = [
    { href: "/rifas", label: "Rifas" },
    { href: "/mis-rifas", label: "Mis rifas" },
    { href: "/wallet", label: "Wallet" },
    { href: "/ganadores", label: "Ganadores" },
    { href: "/perfil", label: "Perfil" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-12">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/30">
          <div className="flex flex-wrap gap-2">
            {navButtons.map((btn) => (
              <Link
                key={btn.href}
                href={btn.href}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-[#93c5fd] hover:bg-white/15"
              >
                {btn.label}
              </Link>
            ))}
            {isAdminOnly && (
              <Link
                href="/admin"
                className="rounded-full border border-[#60a5fa]/50 bg-[#1e3a8a]/60 px-4 py-2 text-sm font-semibold text-[#bfdbfe] shadow-md shadow-[#1e3a8a]/40 transition hover:-translate-y-[1px] hover:border-[#93c5fd]"
              >
                Admin
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                href="/superadmin"
                className="rounded-full border border-[#22d3ee]/60 bg-[#0f172a]/70 px-4 py-2 text-sm font-semibold text-[#7dd3fc] shadow-md shadow-[#0ea5e9]/30 transition hover:-translate-y-[1px] hover:border-[#7dd3fc]"
              >
                Superadmin
              </Link>
            )}
          </div>
          <span className="ml-auto text-[11px] uppercase tracking-[0.25em] text-white/60">Navegación rápida</span>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-black/30">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
              Sorteos activos
            </div>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Tu oportunidad de ganar hoy.</h1>
            <p className="max-w-2xl text-white/80">
              El mural principal de rifas, con disponibilidad en vivo, galería y acceso rápido a tu perfil o al panel admin.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <ProfileLinkButton className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40">
                Ir al perfil
              </ProfileLinkButton>
              {isAdminOnly && (
                <Link
                  href="/admin"
                  className="rounded-full border border-[#60a5fa]/50 bg-[#1e3a8a]/40 px-4 py-2 font-semibold text-[#bfdbfe] transition hover:-translate-y-[1px] hover:border-[#93c5fd]"
                >
                  Panel admin
                </Link>
              )}
              {isSuperAdmin && (
                <Link
                  href="/superadmin"
                  className="rounded-full border border-[#22d3ee]/50 bg-[#0f172a]/60 px-4 py-2 font-semibold text-[#7dd3fc] transition hover:-translate-y-[1px] hover:border-[#7dd3fc]"
                >
                  Panel superadmin
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Ganadores recientes</p>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/80">Top confianza</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {winners.map((w) => (
                <div
                  key={w.name}
                  className="min-w-[180px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-sm shadow-black/20"
                >
                  <p className="text-white font-semibold">{w.name}</p>
                  <p className="text-white/75">Ganó: {w.prize}</p>
                  <p className="text-white/60 text-xs mt-1">Ticket #{w.ticket}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <p className="font-semibold text-white">Cómo participar</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-white/70">
                <li>Explora rifas y revisa disponibilidad.</li>
                <li>Compra y paga; asignamos tus números.</li>
                <li>Revisa el muro de ganadores al cerrar.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm shadow-md shadow-black/20">
          {[{ id: "all", label: "Todas" }, { id: "closing", label: "Próximas a cerrar" }, { id: "cheap", label: "Menor precio" }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id as typeof filter)}
              className={`rounded-full border px-4 py-2 font-semibold transition ${
                filter === opt.id
                  ? "border-white/50 bg-white/15 text-white"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-xs uppercase tracking-[0.2em] text-white/60">Mural de rifas</span>
        </section>

      {message && (
        <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm shadow-black/30">
          {message}
        </div>
      )}

      {loading && <p className="text-sm text-white/80">Cargando rifas...</p>}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRaffles.map((raffle, idx) => {
          const sold = raffle.ticketsTotal - raffle.ticketsAvailable;
          const progress = raffle.ticketsTotal
            ? Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)))
            : 0;
          const remainingPct = raffle.ticketsTotal
            ? Math.max(0, Math.min(100, Math.round((raffle.ticketsAvailable / raffle.ticketsTotal) * 100)))
            : 0;
          const lowStock = remainingPct <= 10;
          const banner = fallbackImages[idx % fallbackImages.length];

          return (
            <article
              key={raffle.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{raffle.drawDate}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    raffle.status === "activa"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {raffle.status}
                </span>
              </div>

              <div className="relative h-52 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(120deg, rgba(5,8,20,0.6), rgba(5,8,20,0.2)), url(${banner})` }}
                />
                <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f172a] shadow-md shadow-black/40">
                  ¡Participa y gana!
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-white/80 p-3 text-sm text-[#0f172a] shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0f172a]">{raffle.title}</p>
                    <span className="rounded-full bg-[#fbbf24]/20 px-3 py-1 text-xs font-semibold text-[#92400e]">${raffle.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#0f172a]/80">Sorteo {raffle.drawDate}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-4 pb-4 pt-3 text-sm text-white/80">
                {lowStock && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 text-amber-100">
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-300" />
                    Quedan pocos tickets
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Disponibles</span>
                    <span>
                      {raffle.ticketsAvailable} / {raffle.ticketsTotal} ({remainingPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs uppercase text-white/60">
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    onChange={(e) => setQuantity((prev) => ({ ...prev, [raffle.id]: Number(e.target.value) }))}
                    className="w-20 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-sm text-white"
                  />
                </div>

                <div className="flex gap-2 text-sm">
                  <button
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30"
                    onClick={() => handlePurchase(raffle.id)}
                    disabled={loading}
                  >
                    Comprar
                  </button>
                  <button
                    className="rounded-lg border border-white/20 px-4 py-2 text-white transition hover:-translate-y-[1px] hover:border-white/40"
                    onClick={() => handlePayment(raffle.id)}
                    disabled={loading}
                  >
                    Pagar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && raffles.length === 0 && (
          <p className="text-sm text-white/75">No hay rifas disponibles.</p>
        )}
      </section>
      </div>
    </main>
  );
}
