/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { changePassword, deleteAccount, fetchModules, fetchMyTickets, fetchProfile, updateProfile } from "@/lib/api";
import { clearAuthToken, getAuthToken, getUserRole, setUserRole } from "@/lib/session";
import type { ModuleConfig, UserProfile, UserTicket } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import {
  Camera,
  CheckCircle2,
  Instagram,
  Link2,
  List,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Shield,
  Star,
  Trash,
  User as UserIcon,
} from "lucide-react";

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [form, setForm] = useState({ name: "", phone: "", instagram: "", whatsapp: "" });
  const [socials, setSocials] = useState<Array<{ label: string; url: string }>>([
    { label: "Instagram", url: "https://instagram.com/" },
    { label: "Twitter", url: "https://x.com/" },
  ]);
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = getAuthToken();
    if (!token) {
      setMessage("Inicia sesión para ver tu perfil.");
      setLoading(false);
      setLoadingModules(false);
      return () => {
        mounted = false;
      };
    }

    Promise.all([fetchProfile(), fetchMyTickets(), fetchModules()])
      .then(([p, t, mods]) => {
        if (!mounted) return;
        setProfile(p);
        setTickets(Array.isArray(t) ? t : []);
        setModulesConfig(mods || null);
        const nextBio = p?.bio ?? (p?.name ? `Hola, soy ${p.name} y me encantan las rifas seguras.` : "");
        setBio(nextBio);
        const maybeAvatar = (p as any)?.avatarUrl as string | undefined;
        if (maybeAvatar) setAvatarPreview(maybeAvatar);
        setForm({
          name: p?.name ?? "",
          phone: p?.phone ?? "",
          instagram: p?.socials?.instagram ?? "",
          whatsapp: p?.socials?.whatsapp ?? "",
        });
        if (p?.socials?.links && Array.isArray(p.socials.links) && p.socials.links.length > 0) {
          setSocials(p.socials.links);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "No se pudo cargar tu perfil.";
        setMessage(msg);
        setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
        if (mounted) setLoadingModules(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const role = getUserRole();
  const isAdmin = role === "admin" || role === "superadmin";

  const profileEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    return modulesConfig.user?.profile !== false;
  }, [modulesConfig]);

  const badges = useMemo(
    () => [
      { label: "ID", value: profile?.id ?? "—" },
      { label: "Rol", value: role ?? profile?.role ?? "—" },
      { label: "Boletos", value: tickets.length.toString() },
      { label: "Estado", value: "Verificado" },
    ],
    [profile?.id, role, profile?.role, tickets.length],
  );

  const handleAvatarChange = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
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

  const toggleEditing = () => setEditing((prev) => !prev);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name || profile.name,
        phone: form.phone || profile.phone,
        bio,
        avatar: avatarPreview ?? profile.avatar ?? profile.avatarUrl,
        socials: {
          instagram: form.instagram,
          whatsapp: form.whatsapp,
          links: socials,
        },
      };

      const res = await updateProfile(payload);
      const nextProfile = res.user ?? { ...profile, ...payload };
      setProfile(nextProfile);
      setMessage("Perfil actualizado.");
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo guardar el perfil.";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.next) {
      setMessage("Ingresa la contraseña actual y la nueva.");
      return;
    }
    setChangingPassword(true);
    setMessage(null);
    try {
      await changePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
      setMessage("Contraseña actualizada.");
      setPasswordForm({ current: "", next: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo cambiar la contraseña.";
      setMessage(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUserRole(null);
    setProfile(null);
    setTickets([]);
    setMessage("Sesión cerrada.");
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    setMessage(null);
    try {
      await deleteAccount();
      handleLogout();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo eliminar la cuenta.";
      setMessage(msg);
    }
  };

  const stars = Array.from({ length: 5 });

  if (!loadingModules && !profileEnabled) {
    return (
      <RequireAuth>
        <AppShell title="Perfil" subtitle="Módulo desactivado">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
            <p className="text-lg font-semibold">Módulo de perfil desactivado.</p>
            <p className="mt-2 text-sm text-white/75">Actívalo para editar tu identidad y ver tus boletos.</p>
            {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
          </div>
        </AppShell>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
    <AppShell title="Perfil" subtitle="Tu mural de identidad">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-linear-to-r from-[#0f172a] via-[#111827] to-[#0f172a] p-px shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-6 rounded-3xl bg-night-sky/90 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Perfil</p>
            <h1 className="font-(--font-display) text-3xl text-white sm:text-4xl">Mural de identidad</h1>
            <p className="text-base text-white/80">Personaliza tu mural como en la app móvil: foto, bio, redes y accesos.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-lg shadow-black/30">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#22d3ee33] via-[#a855f733] to-transparent blur-2xl" />
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border border-white/20 bg-white/5 shadow-inner shadow-black/40">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/50">
                        <UserIcon className="h-12 w-12" />
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#22d3ee] text-night-sky shadow-md shadow-black/40">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide">Mi perfil</span>
                  {profile?.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#3b82f6]/40 bg-[#1e3a8a]/30 px-3 py-1 text-xs font-semibold text-[#93c5fd]">
                      <CheckCircle2 className="h-4 w-4" /> Verificado
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-white">{profile?.name || form.name || "Tu nombre"}</p>
                  <p className="text-sm text-white/70">{profile?.email ?? "correo@ejemplo.com"}</p>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-100">
                  {stars.map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1">5.0 • Excelencia</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
                  {badges.map((b) => (
                    <span key={b.label} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                      {b.label}: {b.value}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#3b82f6]/50 bg-[#1e3a8a]/30 px-4 py-2 text-sm font-semibold text-[#93c5fd] transition hover:border-[#60a5fa]/70 hover:text-white"
                    >
                      <List className="h-4 w-4" /> Mis publicaciones
                    </Link>
                  )}
                  <button
                    onClick={toggleEditing}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#22d3ee]/70 hover:text-[#22d3ee]"
                  >
                    <Pencil className="h-4 w-4" /> {editing ? "Listo" : "Editar perfil"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#22d3ee]/60"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar sesión
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 text-white/70">
                  {form.whatsapp && (
                    <a
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-white/40"
                      href={`https://wa.me/${form.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                  {form.instagram && (
                    <a
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:border-white/40"
                      href={`https://instagram.com/${form.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {editing && (
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                  <div className="grid gap-1">
                    <label className="text-xs text-white/60">Nombre</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-white/60">Teléfono</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Teléfono"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-white/60">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuenta quién eres, qué rifas te gustan y cómo contactarte."
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-white/60">Instagram (@usuario)</label>
                    <input
                      value={form.instagram}
                      onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="@usuario"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-white/60">WhatsApp (solo números)</label>
                    <input
                      value={form.whatsapp}
                      onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="521234567890"
                    />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Redes</span>
                      <button
                        onClick={addSocial}
                        className="text-xs font-semibold text-[#22d3ee] transition hover:text-white"
                      >
                        Añadir red
                      </button>
                    </div>
                    <div className="grid gap-3">
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
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="mt-2 inline-flex items-center justify-center rounded-lg border border-[#22d3ee]/50 bg-[#22d3ee]/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#22d3ee]/80"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              )}

              {!editing && bio && (
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80">
                  {bio}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Legal y seguridad</h2>
                  <span className="text-xs text-white/60">Lecturas rápidas</span>
                </div>
                <div className="mt-3 space-y-3 text-sm text-white/80">
                  <Link href="/estado" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/40">
                    <span>Términos y privacidad</span>
                    <Mail className="h-4 w-4" />
                  </Link>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="font-semibold text-white">Seguridad</p>
                    <p className="text-xs text-white/70">Gestiona tus credenciales desde la app móvil o soporte.</p>
                  </div>
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:border-red-400"
                    onClick={handleDeleteAccount}
                  >
                    <Trash className="h-4 w-4" /> Eliminar cuenta
                  </button>
                  <div className="grid gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-sm font-semibold text-white">Cambiar contraseña</p>
                    <input
                      type="password"
                      placeholder="Actual"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Nueva"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                      className="rounded-lg border border-white/15 bg-night-sky px-3 py-2 text-sm text-white outline-none"
                    />
                    <button
                      onClick={handlePasswordChange}
                      disabled={changingPassword}
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-[#22d3ee]/60"
                    >
                      {changingPassword ? "Actualizando..." : "Actualizar contraseña"}
                    </button>
                  </div>
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
    </AppShell>
    </RequireAuth>
  );
}
