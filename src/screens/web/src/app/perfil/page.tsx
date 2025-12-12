/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyTickets, fetchProfile } from "@/lib/api";
import { clearAuthToken, getAuthToken, getUserRole } from "@/lib/session";
import type { UserProfile, UserTicket } from "@/lib/types";
import { Camera, Link2, LogOut, Mail, Phone, Shield, User as UserIcon } from "lucide-react";

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [socials, setSocials] = useState<Array<{ label: string; url: string }>>([
    { label: "Instagram", url: "https://instagram.com/" },
    { label: "Twitter", url: "https://x.com/" },
  ]);

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
        if (p?.name) {
          setBio(`Hola, soy ${p.name} y me encantan las rifas seguras.`);
        }
        const maybeAvatar = (p as any)?.avatarUrl as string | undefined;
        if (maybeAvatar) setAvatarPreview(maybeAvatar);
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

  const badges = useMemo(
    () => [
      { label: "Rol", value: role ?? profile?.role ?? "—" },
      { label: "Boletos", value: tickets.length.toString() },
      { label: "Estado", value: "Verificado" },
    ],
    [role, profile?.role, tickets.length],
  );

  const handleAvatarChange = (file?: File | null) => {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSocialChange = (index: number, field: "label" | "url", value: string) => {
    setSocials((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addSocial = () => {
    setSocials((prev) => [...prev, { label: "Red", url: "https://" }]);
  };

  const removeSocial = (index: number) => {
    setSocials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    clearAuthToken();
    setProfile(null);
    setTickets([]);
    setMessage("Sesión cerrada.");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 bg-night-sky text-white">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0f172a] via-[#111827] to-[#0f172a] p-[1px] shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-6 rounded-3xl bg-night-sky/90 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Perfil</p>
            <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">Mural de identidad</h1>
            <p className="text-base text-white/80">Personaliza tu foto, redes y bio. Tus boletos viven aquí.</p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-white/5">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/50">
                      <UserIcon className="h-8 w-8" />
                    </div>
                  )}
                  <label className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#22d3ee] text-night-sky shadow-md shadow-black/40">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{profile?.name ?? "Tu nombre"}</p>
                  <p className="text-sm text-white/70">{profile?.email ?? "correo@ejemplo.com"}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {badges.map((b) => (
                      <span key={b.label} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                        {b.label}: {b.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-white/70">Bio</p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuenta quién eres, qué rifas te gustan y cómo contactarte."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  rows={3}
                />
              </div>

              <div className="grid gap-3 text-sm text-white/85">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/60" /> {profile?.email ?? ""}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/60" /> {profile?.phone ?? "No definido"}</div>
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-white/60" /> Rol: {role ?? profile?.role ?? "—"}</div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition hover:border-[#22d3ee]/60"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Redes y mural</h2>
                  <button
                    onClick={addSocial}
                    className="text-xs font-semibold text-[#22d3ee] transition hover:text-white"
                  >
                    Añadir red
                  </button>
                </div>
                <div className="mt-3 grid gap-3">
                  {socials.map((s, idx) => (
                    <div
                      key={`${s.label}-${idx}`}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/85"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2 sm:w-40">
                          <Link2 className="h-4 w-4 text-white/60" />
                          <input
                            value={s.label}
                            onChange={(e) => handleSocialChange(idx, "label", e.target.value)}
                            className="w-full rounded-lg border border-white/15 bg-night-sky px-2 py-1 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                            placeholder="Red"
                          />
                        </div>
                        <input
                          value={s.url}
                          onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                          className="flex-1 rounded-lg border border-white/15 bg-night-sky px-2 py-1 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                          placeholder="https://"
                        />
                        <button
                          onClick={() => removeSocial(idx)}
                          className="text-xs text-white/60 transition hover:text-white"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/60">Pronto: guardado real en tu API.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Boletos</h2>
                  <span className="text-xs text-white/60">{tickets.length} en total</span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/85">
                  {tickets.length === 0 && <p>No tienes boletos registrados.</p>}
                  {tickets.map((t, idx) => (
                    <div key={t.id ?? t.serial ?? t.code ?? `ticket-${idx}`} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
                      <div className="flex justify-between"><span>Serial</span><span>{t.serial ?? t.code ?? "-"}</span></div>
                      <div className="flex justify-between"><span>Rifa</span><span>{t.raffleId ?? t.raffle?.id ?? "-"}</span></div>
                      <div className="flex justify-between"><span>Estado</span><span>{t.status ?? t.state ?? "-"}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
              {tickets.map((t, idx) => (
                <div key={t.id ?? t.serial ?? t.code ?? `ticket-${idx}`} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
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
