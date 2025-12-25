"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  activateBoost,
  changePassword,
  deleteAccount,
  fetchBoostMe,
  fetchMyReferrals,
  fetchMyTickets,
  fetchProfile,
  fetchUserPublicRaffles,
  fetchWallet,
  submitKyc,
  updateProfile,
} from "@/lib/api";
import { clearAuthToken, getUserRole, setUserRole } from "@/lib/session";
import type { UserProfile, UserTicket, WalletMovement } from "@/lib/types";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppShell } from "@/components/app/AppShell";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Grid3X3,
  Instagram,
  LogOut,
  Music,
  Pencil,
  Plane,
  RefreshCcw,
  ShieldCheck,
  SwapVertical,
  Trash,
  User as UserIcon,
  Users,
} from "lucide-react";

type KycImage = { previewUrl: string; base64: string };

function padTicketNumber(n: number, digits?: number) {
  if (!Number.isFinite(n)) return String(n ?? "—");
  const raw = String(Math.trunc(n));
  const d = Number(digits || 0);
  if (!Number.isFinite(d) || d <= 0) return raw;
  return raw.padStart(d, "0");
}

function typeLabel(type: unknown) {
  const t = String(type || "").toLowerCase();
  if (!t) return "Movimiento";
  if (t === "manual_payment") return "Pago manual";
  if (t === "ticket_purchase") return "Compra de tickets";
  if (t === "topup") return "Recarga";
  if (t === "withdrawal") return "Retiro";
  if (t === "deposit") return "Recarga";
  if (t === "purchase") return "Compra de tickets";
  if (t === "refund") return "Reembolso";
  return t.replace(/_/g, " ");
}

function statusTone(status: unknown) {
  const s = String(status || "pending").toLowerCase();
  if (s === "approved") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (s === "rejected" || s === "failed") return "border-red-400/30 bg-red-400/10 text-red-100";
  return "border-amber-400/30 bg-amber-400/10 text-amber-100";
}

export default function PerfilPage() {
  const role = String(getUserRole() || "").trim().toLowerCase();
  const isOrganizerRole = role === "admin" || role === "superadmin" || role === "organizer";
  const isAdminOrSuperadmin = role === "admin" || role === "superadmin";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [myPublications, setMyPublications] = useState<Array<Record<string, any>>>([]);
  const [myPublicationsLoading, setMyPublicationsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [movementsOpen, setMovementsOpen] = useState(false);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [walletData, setWalletData] = useState<{ balance: number; transactions: WalletMovement[] }>({ balance: 0, transactions: [] });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessTab, setBusinessTab] = useState<"personal" | "legal" | "kyc" | "subscription">("personal");
  const [draft, setDraft] = useState<UserProfile | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });

  const [kycUploading, setKycUploading] = useState(false);
  const [kycImages, setKycImages] = useState<{ front: KycImage | null; back: KycImage | null; selfie: KycImage | null }>({
    front: null,
    back: null,
    selfie: null,
  });

  const [boostData, setBoostData] = useState<any>(null);
  const [activatingBoost, setActivatingBoost] = useState(false);

  const achievements = useMemo(() => {
    if (!profile) return [] as Array<{ id: string; label: string }>;
    const list: Array<{ id: string; label: string }> = [];
    if (tickets.length > 0) list.push({ id: "ach1", label: "Explorador" });
    if (tickets.length >= 5) list.push({ id: "ach2", label: "Jugador fiel" });
    if ((profile.referrals?.length || 0) >= 5) list.push({ id: "ach3", label: "Influencer" });
    return list;
  }, [profile, tickets.length]);

  const { activePublications, closedPublications } = useMemo(() => {
    const list = Array.isArray(myPublications) ? myPublications : [];
    const active: any[] = [];
    const closed: any[] = [];
    for (const item of list) {
      if (String(item?.status || "").toLowerCase() === "active") active.push(item);
      else closed.push(item);
    }
    return { activePublications: active, closedPublications: closed };
  }, [myPublications]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    (async () => {
      try {
        const me = await fetchProfile();
        if (!mounted) return;

        // Referidos (no bloquear si falla)
        try {
          const r = await fetchMyReferrals();
          (me as any).referrals = Array.isArray(r?.referrals) ? r.referrals : [];
          (me as any).referralCode = r?.code;
        } catch {
          // no bloquear
        }

        setProfile(me);
        setDraft(me);

        const myTickets = await fetchMyTickets();
        if (!mounted) return;
        setTickets(Array.isArray(myTickets) ? myTickets : []);

        if (isOrganizerRole && (me as any)?.id != null) {
          setMyPublicationsLoading(true);
          try {
            const pubs = await fetchUserPublicRaffles((me as any).id as any);
            const active = Array.isArray(pubs?.active) ? pubs.active : [];
            const closed = Array.isArray(pubs?.closed) ? pubs.closed : [];
            const userStub = {
              id: (me as any).id,
              name: me.name,
              avatar: me.avatar,
              identityVerified: !!(me as any).identityVerified,
            };
            setMyPublications([...active, ...closed].map((r: any) => ({ ...r, user: userStub })));
          } catch {
            setMyPublications([]);
          } finally {
            if (mounted) setMyPublicationsLoading(false);
          }

          // Boost (solo admin/superadmin en backend; si no, se ignora)
          fetchBoostMe()
            .then((d) => {
              if (mounted) setBoostData(d);
            })
            .catch(() => {
              // ignorar
            });
        } else {
          setMyPublications([]);
          setMyPublicationsLoading(false);
        }
      } catch (e) {
        if (!mounted) return;
        setErrorMsg(e instanceof Error ? e.message : "No se pudo cargar el perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOrganizerRole]);

  const openMovements = async () => {
    setPanelOpen(false);
    setMovementsOpen(true);
    setMovementsLoading(true);
    try {
      const data = await fetchWallet();
      const transactions = Array.isArray((data as any)?.transactions) ? ((data as any).transactions as WalletMovement[]) : [];
      setWalletData({
        balance: Number((data as any)?.balance || 0),
        transactions,
      });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudieron cargar tus movimientos.");
    } finally {
      setMovementsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setUserRole(null);
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y perderás acceso a tus tickets y datos.",
    );
    if (!ok) return;
    setMessage("");
    try {
      await deleteAccount();
      handleLogout();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo eliminar la cuenta.");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.next) {
      setMessage("Ingresa ambas contraseñas.");
      return;
    }
    setChangingPassword(true);
    setMessage("");
    try {
      await changePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
      setMessage("Contraseña actualizada.");
      setPasswordForm({ current: "", next: "" });
      setShowPassword(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cambiar la contraseña.");
    } finally {
      setChangingPassword(false);
    }
  };

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      reader.readAsDataURL(file);
    });

  const handleAvatarFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await readAsDataUrl(file);
      setDraft((prev) => ({ ...(prev || {}), avatar: dataUrl }));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    }
  };

  const handleKycFile = async (kind: "front" | "back" | "selfie", file?: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await readAsDataUrl(file);
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      setKycImages((prev) => ({ ...prev, [kind]: { previewUrl: dataUrl, base64 } }));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    }
  };

  const saveDraftProfile = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage("");
    try {
      const payload: Partial<UserProfile> & { avatar?: string } = {
        name: draft.name,
        bio: draft.bio,
        avatar: draft.avatar,
        phone: draft.phone,
        address: (draft as any).address,
        cedula: (draft as any).cedula,
        socials: {
          instagram: draft.socials?.instagram,
          whatsapp: draft.socials?.whatsapp,
          tiktok: (draft.socials as any)?.tiktok,
          telegram: (draft.socials as any)?.telegram,
        },
      };
      const updated = await updateProfile(payload);
      setProfile(updated);
      setDraft(updated);
      setEditing(false);
      setMessage("Perfil actualizado correctamente.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const submitKycNow = async () => {
    if (!kycImages.front || !kycImages.selfie) {
      setMessage("Sube al menos frente y selfie para enviar tu verificación.");
      return;
    }
    setKycUploading(true);
    setMessage("");
    try {
      await submitKyc({
        documentType: "cedula",
        frontImage: kycImages.front.base64,
        backImage: kycImages.back?.base64 || null,
        selfieImage: kycImages.selfie.base64,
      });
      setMessage("Tu verificación fue enviada. Un superadmin la revisará.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo enviar tu verificación.");
    } finally {
      setKycUploading(false);
    }
  };

  const refreshBoost = async () => {
    try {
      const d = await fetchBoostMe();
      setBoostData(d);
    } catch {
      // ignorar
    }
  };

  const activateBoostNow = async () => {
    setActivatingBoost(true);
    setMessage("");
    try {
      await activateBoost();
      setMessage("Tu perfil ha sido promocionado por 24 horas.");
      await refreshBoost();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo activar el boost.");
    } finally {
      setActivatingBoost(false);
    }
  };

  const showReceipt = (t: UserTicket) => {
    const text =
      `Rifa: ${t.raffleTitle || ""}\n` +
      `Ticket: ${t.number != null ? padTicketNumber(Number(t.number), t.digits) : "—"}\n` +
      `Serial: ${t.serial || t.serialNumber || "—"}\n` +
      `ID comprador: ${(profile as any)?.securityId || (profile as any)?.publicId || "—"}\n` +
      `Estado: ${t.status || t.state || "—"}\n` +
      `Fecha: ${t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}\n` +
      `Vía: ${t.via || ""}`;
    window.alert(text);
  };

  const publicationGallery = (r: any) => {
    const gallery = Array.isArray(r?.style?.gallery) && r.style.gallery.length
      ? r.style.gallery
      : r?.style?.bannerImage
        ? [r.style.bannerImage]
        : [];
    return gallery;
  };

  if (loading) {
    return (
      <RequireAuth>
        <AppShell title="Perfil" subtitle="Cargando...">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/80">Cargando perfil…</div>
        </AppShell>
      </RequireAuth>
    );
  }

  if (!profile) {
    return (
      <RequireAuth>
        <AppShell title="Perfil" subtitle="Mi perfil">
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-sm text-red-100">
            {errorMsg || "No se pudo cargar el perfil."}
          </div>
        </AppShell>
      </RequireAuth>
    );
  }

  const idLabel = (profile as any)?.securityId || (profile as any)?.publicId || "—";
  const hasAnySocial =
    !!profile.socials?.whatsapp ||
    !!profile.socials?.instagram ||
    !!(profile.socials as any)?.tiktok ||
    !!(profile.socials as any)?.telegram;

  return (
    <RequireAuth>
      <AppShell title="Perfil" subtitle="Mi perfil">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-white">Mi perfil</p>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90"
            aria-label="Abrir panel de perfil"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
        </div>

        {panelOpen ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setPanelOpen(false)}
              aria-label="Cerrar panel"
            />
            <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm border-r border-white/10 bg-[rgba(12,18,36,0.98)] px-4 pt-12">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#7c3aed]/35 bg-[#7c3aed]/20">
                    <UserIcon className="h-5 w-5 text-white/90" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-white">{profile.name || "Usuario"}</p>
                    <p className="truncate text-xs text-white/60">{profile.email || ""}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setPanelOpen(false)} className="p-2 text-white/80" aria-label="Cerrar">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={openMovements}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-left"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#22d3ee]/35 bg-[#22d3ee]/15">
                  <SwapVertical className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-white">Transacciones / Movimientos</p>
                  <p className="text-xs text-white/60">Ver tus últimos movimientos</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/50" />
              </button>
            </div>
          </div>
        ) : null}

        {movementsOpen ? (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute bottom-6 left-4 right-4 top-20 rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.96)] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-extrabold text-white">Movimientos</p>
                  <p className="text-xs text-white/60">Saldo: {Number(walletData.balance || 0).toFixed(2)} VES</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openMovements}
                    disabled={movementsLoading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90 disabled:opacity-60"
                    aria-label="Actualizar movimientos"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementsOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/90"
                    aria-label="Cerrar movimientos"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {movementsLoading ? (
                <div className="grid place-items-center pt-10 text-sm text-white/70">Cargando movimientos…</div>
              ) : (
                <div className="h-full overflow-auto pb-6">
                  {walletData.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {walletData.transactions.map((tx: any, idx: number) => {
                        const amount = Number(tx?.amount || 0);
                        const currency = tx?.currency || "VES";
                        const status = String(tx?.status || "pending").toLowerCase();
                        return (
                          <div
                            key={String(tx?.id ?? `tx-${idx}`)}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[#22d3ee]/25 bg-[#22d3ee]/10">
                                <SwapVertical className="h-5 w-5 text-[#22d3ee]" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-extrabold text-white">{typeLabel(tx?.type)}</p>
                                <p className="truncate text-xs text-white/60">
                                  {tx?.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-white">
                                {amount.toFixed(2)} {currency}
                              </p>
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(status)}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-sm text-white/60">Aún no tienes movimientos.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{message}</div>
        ) : null}
        {errorMsg ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">{errorMsg}</div>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/5">
              {draft?.avatar || profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(draft?.avatar || profile.avatar)} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-8 w-8 text-white/40" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-extrabold text-white">{profile.name || "Usuario"}</p>
              <p className="mt-1 text-xs text-white/60">ID: {idLabel}</p>

              {(!!profile.verified || !!(profile as any).identityVerified) ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {!!profile.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#3b82f6]/25 bg-[#3b82f6]/10 px-3 py-1 text-xs font-bold text-[#93c5fd]">
                      <CheckCircle2 className="h-4 w-4" /> Email verificado
                    </span>
                  ) : null}
                  {!!(profile as any).identityVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
                      <ShieldCheck className="h-4 w-4" /> KYC verificado
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 py-2.5 text-center">
              <p className="text-lg font-extrabold text-white">{tickets.length}</p>
              <p className="text-xs text-white/60">Tickets</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 py-2.5 text-center">
              <p className="text-lg font-extrabold text-white">{profile.referrals?.length || 0}</p>
              <p className="text-xs text-white/60">Referidos</p>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-white/60">
            {isOrganizerRole ? "Promociona tus rifas • Más alcance • Más ventas" : "Compra segura • Participa y gana • Invita y suma beneficios"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-center text-sm text-white/70">{profile.bio || "Sin biografía."}</p>

          {achievements.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {achievements.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  <Users className="h-3.5 w-3.5 text-amber-300" /> {a.label}
                </span>
              ))}
            </div>
          ) : null}

          {hasAnySocial ? (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {profile.socials?.whatsapp ? (
                <a
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
                  href={`https://wa.me/${String(profile.socials.whatsapp).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <Users className="h-4 w-4" />
                </a>
              ) : null}
              {profile.socials?.instagram ? (
                <a
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
                  href={`https://instagram.com/${String(profile.socials.instagram).replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              {(profile.socials as any)?.tiktok ? (
                <a
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
                  href={`https://www.tiktok.com/@${String((profile.socials as any).tiktok).replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                >
                  <Music className="h-4 w-4" />
                </a>
              ) : null}
              {(profile.socials as any)?.telegram ? (
                <a
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
                  href={`https://t.me/${String((profile.socials as any).telegram).replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <Plane className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {editing && draft ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            {isOrganizerRole ? (
              <>
                <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-black/20 p-1">
                  {([
                    { id: "personal", label: "Personal" },
                    { id: "legal", label: "Legal" },
                    { id: "kyc", label: "KYC" },
                    { id: "subscription", label: "Plan" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBusinessTab(t.id)}
                      className={`rounded-lg py-2 text-[10px] font-bold ${businessTab === t.id ? "bg-[#7c3aed] text-white" : "text-white/70"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {businessTab === "personal" ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-white">Información Pública</p>
                    <label className="block cursor-pointer text-center text-sm font-semibold text-[#22d3ee]">
                      Cambiar Logo / Foto
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                    </label>

                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Nombre Visible</label>
                      <input
                        value={draft.name || ""}
                        onChange={(e) => setDraft((p) => ({ ...(p || {}), name: e.target.value }))}
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Bio / Descripción</label>
                      <textarea
                        value={draft.bio || ""}
                        onChange={(e) => setDraft((p) => ({ ...(p || {}), bio: e.target.value }))}
                        rows={3}
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Teléfono Contacto</label>
                      <input
                        value={draft.phone || ""}
                        onChange={(e) => setDraft((p) => ({ ...(p || {}), phone: e.target.value }))}
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">WhatsApp (Solo números)</label>
                      <input
                        value={draft.socials?.whatsapp || ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...(p || {}),
                            socials: { ...(p?.socials || {}), whatsapp: e.target.value },
                          }))
                        }
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Instagram (@usuario)</label>
                      <input
                        value={draft.socials?.instagram || ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...(p || {}),
                            socials: { ...(p?.socials || {}), instagram: e.target.value },
                          }))
                        }
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">TikTok (@usuario)</label>
                      <input
                        value={(draft.socials as any)?.tiktok || ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...(p || {}),
                            socials: { ...(p?.socials || {}), tiktok: e.target.value } as any,
                          }))
                        }
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Telegram (@usuario o usuario)</label>
                      <input
                        value={(draft.socials as any)?.telegram || ""}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...(p || {}),
                            socials: { ...(p?.socials || {}), telegram: e.target.value } as any,
                          }))
                        }
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                  </div>
                ) : null}

                {businessTab === "legal" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-white/60">Información para recibos y facturación.</p>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Dirección Fiscal</label>
                      <textarea
                        value={(draft as any).address || ""}
                        onChange={(e) => setDraft((p) => ({ ...(p || {}), address: e.target.value } as any))}
                        rows={2}
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-xs text-white/60">Cédula</label>
                      <input
                        value={(draft as any).cedula || ""}
                        onChange={(e) => setDraft((p) => ({ ...(p || {}), cedula: e.target.value } as any))}
                        className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                      />
                    </div>
                  </div>
                ) : null}

                {businessTab === "kyc" ? (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                      (profile as any).identityVerified
                        ? "border-emerald-400/30 bg-emerald-400/10"
                        : "border-amber-400/30 bg-amber-400/10"
                    }`}>
                      <ShieldCheck className={`h-6 w-6 ${(profile as any).identityVerified ? "text-emerald-300" : "text-amber-300"}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-white">
                          Estado: {(profile as any).identityVerified ? "VERIFICADO" : "PENDIENTE"}
                        </p>
                        <p className="text-xs text-white/60">
                          {(profile as any).identityVerified ? "Puedes operar sin límites." : "Sube tus documentos para activar pagos."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Documento de Identidad (Frente)</p>
                      <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-sm text-white">
                        Subir foto
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleKycFile("front", e.target.files?.[0])} />
                      </label>
                      {kycImages.front ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kycImages.front.previewUrl} alt="frente" className="h-44 w-full rounded-xl object-contain" />
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Documento de Identidad (Dorso)</p>
                      <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-sm text-white">
                        Subir foto
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleKycFile("back", e.target.files?.[0])} />
                      </label>
                      {kycImages.back ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kycImages.back.previewUrl} alt="dorso" className="h-44 w-full rounded-xl object-contain" />
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">Selfie con Cédula</p>
                      <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-center text-sm text-white">
                        Tomar selfie
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleKycFile("selfie", e.target.files?.[0])}
                        />
                      </label>
                      {kycImages.selfie ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={kycImages.selfie.previewUrl} alt="selfie" className="h-44 w-full rounded-xl object-contain" />
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={submitKycNow}
                      disabled={kycUploading}
                      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                    >
                      <Camera className="h-4 w-4" /> {kycUploading ? "Enviando..." : "Enviar verificación"}
                    </button>
                  </div>
                ) : null}

                {businessTab === "subscription" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 p-4 text-center">
                      <p className="text-xs font-bold tracking-widest text-[#22d3ee]">PLAN ACTUAL</p>
                      <p className="my-2 text-3xl font-extrabold text-white">GRATUITO</p>
                      <p className="text-sm text-white/70">Tienes acceso básico para crear rifas limitadas.</p>
                    </div>

                    {boostData ? (
                      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-amber-300" />
                          <p className="text-sm font-extrabold text-amber-200">BOOST SEMANAL</p>
                        </div>
                        <p className="text-sm text-white/85">
                          {boostData?.isBoosted
                            ? `¡Tu perfil está destacado hasta el ${
                                boostData?.activeBoosts?.[0]?.endAt
                                  ? new Date(boostData.activeBoosts[0].endAt).toLocaleString()
                                  : "(fin desconocido)"
                              }!`
                            : "Destaca tu perfil en la página principal por 24 horas. Tienes 1 boost gratis cada semana."}
                        </p>

                        {!boostData?.isBoosted ? (
                          <>
                            <button
                              type="button"
                              onClick={activateBoostNow}
                              disabled={
                                activatingBoost ||
                                (boostData?.nextEligibleAt ? new Date() < new Date(boostData.nextEligibleAt) : false)
                              }
                              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-amber-300 px-4 py-3 text-sm font-extrabold text-black disabled:opacity-60"
                            >
                              {activatingBoost ? "Activando..." : "Activar Boost Gratis"}
                            </button>
                            {boostData?.nextEligibleAt && new Date() < new Date(boostData.nextEligibleAt) ? (
                              <p className="mt-2 text-center text-xs text-white/60">
                                Disponible nuevamente el {new Date(boostData.nextEligibleAt).toLocaleDateString()}
                              </p>
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    ) : null}

                    <p className="text-sm font-semibold text-white">Mejorar mi Plan</p>
                    <button
                      type="button"
                      onClick={() => window.alert("Te redirigiremos a WhatsApp para activar tu plan PRO.")}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
                    >
                      <div>
                        <p className="text-lg font-extrabold text-amber-200">Plan PRO</p>
                        <p className="text-xs text-white/70">Rifas ilimitadas + Menor comisión</p>
                      </div>
                      <p className="text-sm font-extrabold text-white">$29/mes</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.alert("Te redirigiremos a WhatsApp para activar tu plan EMPRESA.")}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
                    >
                      <div>
                        <p className="text-lg font-extrabold text-purple-200">Plan EMPRESA</p>
                        <p className="text-xs text-white/70">Marca Blanca + Soporte Prioritario</p>
                      </div>
                      <p className="text-sm font-extrabold text-white">$99/mes</p>
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Editar Información</p>
                <label className="block cursor-pointer text-center text-sm font-semibold text-[#22d3ee]">
                  Cambiar Foto de Perfil
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                </label>
                <div className="grid gap-1">
                  <label className="text-xs text-white/60">Nombre</label>
                  <input
                    value={draft.name || ""}
                    onChange={(e) => setDraft((p) => ({ ...(p || {}), name: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-white/60">Biografía</label>
                  <textarea
                    value={draft.bio || ""}
                    onChange={(e) => setDraft((p) => ({ ...(p || {}), bio: e.target.value }))}
                    rows={3}
                    className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-white/60">Teléfono</label>
                  <input
                    value={draft.phone || ""}
                    onChange={(e) => setDraft((p) => ({ ...(p || {}), phone: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-white/60">WhatsApp (Solo números)</label>
                  <input
                    value={draft.socials?.whatsapp || ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...(p || {}),
                        socials: { ...(p?.socials || {}), whatsapp: e.target.value },
                      }))
                    }
                    className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-white/60">Instagram (@usuario)</label>
                  <input
                    value={draft.socials?.instagram || ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...(p || {}),
                        socials: { ...(p?.socials || {}), instagram: e.target.value },
                      }))
                    }
                    className="rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={saveDraftProfile}
              disabled={saving}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        ) : null}

        {isOrganizerRole ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-white">Mis publicaciones</p>

            {myPublicationsLoading ? (
              <div className="text-sm text-white/70">Cargando publicaciones…</div>
            ) : (
              <>
                <p className="mb-2 text-xs text-white/60">Activas: {activePublications.length}</p>
                {activePublications.length === 0 ? <p className="text-xs text-white/60">No tienes publicaciones activas.</p> : null}
                <div className="space-y-4">
                  {activePublications.map((r: any) => {
                    const stats = r?.stats || {};
                    const total = Number(r?.totalTickets || stats.total || 0);
                    const sold = Number(stats.sold || 0);
                    const remaining = Number(stats.remaining ?? (total ? Math.max(total - sold, 0) : 0));
                    const status = String(r?.status || "").toLowerCase();
                    const isClosed = status !== "active";
                    const isAgotada = !isClosed && remaining === 0;
                    const gallery = publicationGallery(r);
                    return (
                      <Link
                        key={`pub-${r.id}`}
                        href={`/rifas/${r.id}`}
                        className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/15 bg-[#7c3aed]">
                            {(profile.avatar || "") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={String(profile.avatar)} alt="avatar" className="h-8 w-8 object-cover" />
                            ) : (
                              <span className="text-xs font-extrabold text-black">{String(profile.name || "M").charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-extrabold text-white">{profile.name || "Rifero"}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {!!(profile as any).identityVerified ? <span className="text-[10px] text-white/60">Verificado</span> : null}
                              {isClosed ? (
                                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10px] font-extrabold text-red-100">CERRADA</span>
                              ) : null}
                              {isAgotada ? (
                                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10px] font-extrabold text-red-100">AGOTADA</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="aspect-square w-full bg-black">
                          {gallery.length > 0 ? (
                            <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto">
                              {gallery.map((img: string, idx: number) => (
                                <div key={`${r.id}-img-${idx}`} className="h-full w-full flex-none snap-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img} alt="" className="h-full w-full object-contain" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid h-full place-items-center text-white/20">Sin imagen</div>
                          )}
                        </div>

                        <div className="p-3">
                          <p className="truncate font-bold text-white">{r.title}</p>
                          {String(r.description || "").trim() ? (
                            <p className="mt-1 line-clamp-3 text-sm text-white/70">{r.description}</p>
                          ) : null}
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <p className="font-extrabold text-amber-300">—</p>
                            {isClosed ? (
                              <p className="text-xs font-extrabold text-red-100">CERRADA</p>
                            ) : isAgotada ? (
                              <p className="text-xs font-extrabold text-red-100">AGOTADA</p>
                            ) : (
                              <p className="text-xs text-white/60">{remaining} tickets restantes</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6" />

                <p className="mb-2 text-xs text-white/60">Cerradas: {closedPublications.length}</p>
                {closedPublications.length === 0 ? <p className="text-xs text-white/60">No tienes publicaciones cerradas.</p> : null}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-white">Actividad</p>
            {tickets.length === 0 ? (
              <p className="text-sm text-white/60">Aún no tienes actividad.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {tickets.slice(0, 12).map((t) => (
                  <button
                    type="button"
                    key={String(t.id ?? t.serial ?? t.serialNumber ?? t.code ?? Math.random())}
                    onClick={() => showReceipt(t)}
                    className="w-full py-3 text-left"
                  >
                    <p className="truncate text-sm font-bold text-white">{t.raffleTitle || "Rifa"}</p>
                    <p className="text-xs text-white/60">
                      {t.status || t.state || "—"} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setEditing((v) => !v);
            setBusinessTab("personal");
            setDraft(profile);
          }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-extrabold text-[#22d3ee]"
        >
          <Pencil className="h-4 w-4" /> {editing ? "Cancelar Edición" : "Editar Perfil"}
        </button>

        {!isAdminOrSuperadmin ? (
          <>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Legal</p>
              <Link href="/estado" className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-sm text-white/85">Términos, Privacidad y Marco Legal</span>
                <ChevronRight className="h-5 w-5 text-white/50" />
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <p className="text-sm font-semibold text-white">Seguridad</p>
                {showPassword ? <ChevronUp className="h-5 w-5 text-white/70" /> : <ChevronDown className="h-5 w-5 text-white/70" />}
              </button>

              {showPassword ? (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-white/60">Cambiar contraseña</p>
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-night-sky px-3 py-2 text-sm text-white outline-none focus:border-[#22d3ee]"
                  />
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" /> {changingPassword ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 pb-10">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-extrabold text-white"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
              <button type="button" onClick={handleDeleteAccount} className="w-full text-center text-sm text-white/60 underline">
                Eliminar mi cuenta
              </button>
            </div>
          </>
        ) : null}
      </AppShell>
    </RequireAuth>
  );
}
