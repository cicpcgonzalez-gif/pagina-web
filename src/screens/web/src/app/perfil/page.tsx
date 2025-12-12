"use client";

import { useEffect, useState } from "react";
import { fetchMyTickets, fetchProfile } from "@/lib/api";
import { clearAuthToken, getAuthToken, getUserRole } from "@/lib/session";

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = getAuthToken();
    if (!token) {
      setMessage("Inicia sesión para ver tu perfil.");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    Promise.all([fetchProfile(), fetchMyTickets()])
      .then(([p, t]) => {
        if (!mounted) return;
        setProfile(p);
        setTickets(Array.isArray(t) ? t : []);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "No se pudo cargar tu perfil.";
        setMessage(msg);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const role = getUserRole();

  const handleLogout = () => {
    clearAuthToken();
    setProfile(null);
    setTickets([]);
    setMessage("Sesión cerrada.");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 bg-night-sky text-white">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/70">Perfil</p>
        <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">Tu cuenta</h1>
        <p className="text-base text-white/80">
          Datos de usuario y boletos asociados. Requiere sesión iniciada.
        </p>
      </div>

      {message && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white shadow-sm shadow-black/30">
          {message}
        </div>
      )}

      {loading && <p className="mt-6 text-sm text-white/85">Cargando...</p>}

      {!loading && profile && (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-lg shadow-black/30">
            <h2 className="text-lg font-semibold text-white">Datos</h2>
            <dl className="mt-3 space-y-2 text-sm text-white/85">
              <div className="flex justify-between"><dt>Email</dt><dd>{profile.email}</dd></div>
              <div className="flex justify-between"><dt>Teléfono</dt><dd>{profile.phone ?? "-"}</dd></div>
              <div className="flex justify-between"><dt>Rol</dt><dd>{role ?? profile.role ?? "-"}</dd></div>
              <div className="flex justify-between"><dt>Nombre</dt><dd>{profile.name ?? "-"}</dd></div>
            </dl>
            <button
              onClick={handleLogout}
              className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#22d3ee]/60"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-lg shadow-black/30">
            <h2 className="text-lg font-semibold text-white">Boletos</h2>
            <div className="mt-3 space-y-2 text-sm text-white/85">
              {tickets.length === 0 && <p>No tienes boletos registrados.</p>}
              {tickets.map((t) => (
                <div key={t.id ?? t.serial ?? Math.random()} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                  <div className="flex justify-between"><span>Serial</span><span>{t.serial ?? t.code ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Rifa</span><span>{t.raffleId ?? t.raffle?.id ?? "-"}</span></div>
                  <div className="flex justify-between"><span>Estado</span><span>{t.status ?? t.state ?? "-"}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
