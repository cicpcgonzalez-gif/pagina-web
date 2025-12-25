"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
} from "@/lib/api"
import { clearAuthToken, getAuthToken, getUserRole, setUserRole } from "@/lib/session"
import type { UserProfile, UserTicket } from "@/lib/types"
import {
  Camera,
  CheckCircle2,
  Crown,
  Grid3X3,
  Instagram,
  LogOut,
  Music,
  Pencil,
  Plane,
  Save,
  Shield,
  Trash,
  User,
  Users,
} from "lucide-react"

type KycImage = { previewUrl: string; base64: string }

function normalizeSocialHandle(value: string) {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
}

function normalizeWhatsapp(value: string) {
  const digits = String(value || "").replace(/\D/g, "")
  return digits
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.readAsDataURL(file)
  })
}

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [referrals, setReferrals] = useState<Array<{ name?: string; createdAt?: string; verified?: boolean }>>([])
  const [referralCode, setReferralCode] = useState<string>("")

  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [walletLoading, setWalletLoading] = useState(false)

  const [myPublications, setMyPublications] = useState<Array<Record<string, any>>>([])
  const [myPublicationsLoading, setMyPublicationsLoading] = useState(false)
  const [boostData, setBoostData] = useState<any>(null)
  const [activatingBoost, setActivatingBoost] = useState(false)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"personal" | "legal" | "kyc" | "subscription">("personal")

  const [draft, setDraft] = useState<Partial<UserProfile>>({})
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" })
  const [changingPassword, setChangingPassword] = useState(false)

  const [kycUploading, setKycUploading] = useState(false)
  const [kycImages, setKycImages] = useState<{ front: KycImage | null; back: KycImage | null; selfie: KycImage | null }>({
    front: null,
    back: null,
    selfie: null,
  })

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/perfil")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setErrorMsg("")
        setMessage("")

        const me = await fetchProfile()
        if (!mounted) return
        setProfile(me)
        setDraft({
          name: me?.name || "",
          bio: me?.bio || "",
          avatar: me?.avatarUrl || me?.avatar || "",
          phone: me?.phone || "",
          address: me?.address || "",
          cedula: me?.cedula || "",
          state: me?.state || "",
          socials: {
            instagram: me?.socials?.instagram || "",
            whatsapp: me?.socials?.whatsapp || "",
            tiktok: me?.socials?.tiktok || "",
            telegram: me?.socials?.telegram || "",
          },
        })

        // Tickets (no bloquear si falla)
        try {
          const t = await fetchMyTickets()
          if (mounted) setTickets(Array.isArray(t) ? t : [])
        } catch {
          if (mounted) setTickets([])
        }

        // Referidos (no bloquear si falla)
        try {
          const r = await fetchMyReferrals()
          if (mounted) {
            setReferrals(Array.isArray(r?.referrals) ? r.referrals : [])
            setReferralCode(String(r?.code || ""))
          }
        } catch {
          if (mounted) {
            setReferrals([])
            setReferralCode("")
          }
        }

        // Wallet (solo balance rápido)
        setWalletLoading(true)
        try {
          const w = await fetchWallet()
          if (mounted) setWalletBalance(Number((w as any)?.balance || 0))
        } catch {
          if (mounted) setWalletBalance(0)
        } finally {
          if (mounted) setWalletLoading(false)
        }

        // Publicaciones + Boost si es rifero
        const role = String(me?.role || getUserRole() || "").trim().toLowerCase()
        const isRifero = role === "admin" || role === "superadmin" || role === "organizer"
        if (isRifero && (me as any)?.id != null) {
          setMyPublicationsLoading(true)
          try {
            const pubs = await fetchUserPublicRaffles((me as any).id)
            const active = Array.isArray((pubs as any)?.active) ? (pubs as any).active : []
            const closed = Array.isArray((pubs as any)?.closed) ? (pubs as any).closed : []
            const userStub = {
              id: (me as any).id,
              name: me?.name,
              avatar: me?.avatar,
              identityVerified: !!(me as any)?.identityVerified,
            }
            if (mounted) setMyPublications([...active, ...closed].map((x: any) => ({ ...x, user: userStub })))
          } catch {
            if (mounted) setMyPublications([])
          } finally {
            if (mounted) setMyPublicationsLoading(false)
          }

          fetchBoostMe()
            .then((d) => {
              if (mounted) setBoostData(d)
            })
            .catch(() => {
              // ignore
            })
        } else {
          if (mounted) {
            setMyPublications([])
            setMyPublicationsLoading(false)
            setBoostData(null)
          }
        }
      } catch (e) {
        if (!mounted) return
        setErrorMsg(e instanceof Error ? e.message : "No se pudo cargar tu perfil.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  const role = String(profile?.role || getUserRole() || "").trim().toLowerCase()
  const isOrganizerRole = role === "admin" || role === "superadmin" || role === "organizer"
  const isAdminOrSuperadmin = role === "admin" || role === "superadmin"

  const achievements = useMemo(() => {
    const list: Array<{ id: string; label: string }> = []
    if (tickets.length > 0) list.push({ id: "ach1", label: "Explorador" })
    if (tickets.length >= 5) list.push({ id: "ach2", label: "Jugador fiel" })
    if ((referrals?.length || 0) >= 5) list.push({ id: "ach3", label: "Influencer" })
    return list
  }, [referrals?.length, tickets.length])

  const onLogout = () => {
    clearAuthToken()
    setUserRole(null)
    window.location.href = "/login"
  }

  const onSave = async () => {
    setSaving(true)
    setMessage("")
    setErrorMsg("")
    try {
      const socials = {
        instagram: normalizeSocialHandle(String((draft as any)?.socials?.instagram || "")) || undefined,
        tiktok: normalizeSocialHandle(String((draft as any)?.socials?.tiktok || "")) || undefined,
        telegram: normalizeSocialHandle(String((draft as any)?.socials?.telegram || "")) || undefined,
        whatsapp: normalizeWhatsapp(String((draft as any)?.socials?.whatsapp || "")) || undefined,
      }

      const payload: Partial<UserProfile> & { avatar?: string } = {
        name: String(draft?.name || "").trim() || undefined,
        bio: String(draft?.bio || "").trim() || undefined,
        avatar: String((draft as any)?.avatar || "").trim() || undefined,
        phone: String(draft?.phone || "").trim() || undefined,
        address: String(draft?.address || "").trim() || undefined,
        cedula: String(draft?.cedula || "").trim() || undefined,
        state: String((draft as any)?.state || "").trim() || undefined,
        socials,
      }

      const user = await updateProfile(payload)
      setProfile(user ?? profile)
      setEditing(false)
      setMessage("Perfil actualizado")
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "No se pudo actualizar tu perfil.")
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next) {
      setMessage("Ingresa ambas contraseñas.")
      return
    }
    setChangingPassword(true)
    setMessage("")
    try {
      await changePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next })
      setMessage("Contraseña actualizada.")
      setPasswordForm({ current: "", next: "" })
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cambiar la contraseña.")
    } finally {
      setChangingPassword(false)
    }
  }

  const onDeleteAccount = async () => {
    const ok = window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")
    if (!ok) return
    setMessage("")
    try {
      await deleteAccount()
      onLogout()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo eliminar la cuenta.")
    }
  }

  const onActivateBoost = async () => {
    setActivatingBoost(true)
    setMessage("")
    try {
      const d = await activateBoost()
      setBoostData(d)
      setMessage("Boost activado")
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo activar el boost.")
    } finally {
      setActivatingBoost(false)
    }
  }

  const onPickKycFile = async (key: "front" | "back" | "selfie", file: File | null) => {
    if (!file) return
    const dataUrl = await readAsDataUrl(file)
    setKycImages((prev) => ({
      ...prev,
      [key]: { previewUrl: dataUrl, base64: dataUrl },
    }))
  }

  const onSubmitKyc = async () => {
    if (!kycImages.front?.base64 || !kycImages.selfie?.base64) {
      setMessage("Sube al menos: cédula (frontal) y selfie.")
      return
    }
    setKycUploading(true)
    setMessage("")
    try {
      await submitKyc({
        documentType: "cedula",
        frontImage: kycImages.front.base64,
        backImage: kycImages.back?.base64 || null,
        selfieImage: kycImages.selfie.base64,
      })
      setMessage("KYC enviado. Espera verificación.")
      const me = await fetchProfile()
      setProfile(me)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo enviar el KYC.")
    } finally {
      setKycUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">PERFIL</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
            <User className="h-4 w-4" /> Tu cuenta
          </div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Administra tu perfil.</h2>
          <p className="mt-2 text-slate-200 text-sm">Actualiza datos básicos y redes.</p>
        </section>

        {loading ? <p className="text-slate-300">Cargando…</p> : null}
        {errorMsg ? (
          <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{errorMsg}</div>
        ) : null}
        {message ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div>
        ) : null}

        {!loading && profile ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 shrink-0 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 p-0.5 overflow-hidden">
                  {profile.avatarUrl || profile.avatar ? (
                    <img
                      src={String(profile.avatarUrl || profile.avatar)}
                      alt={profile.name || "Usuario"}
                      className="h-full w-full rounded-full object-cover bg-slate-950"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-slate-950 grid place-items-center text-base font-bold text-white">
                      {(profile.name || profile.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile.name || "Usuario"}</p>
                  <p className="text-xs text-slate-300 truncate">{profile.email || profile.phone || ""}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile.identityVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <CheckCircle2 className="h-4 w-4" /> Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
                        <Shield className="h-4 w-4" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                {role === "superadmin" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {role || "usuario"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-xs text-slate-400">Saldo</p>
                <p className="text-lg font-extrabold text-white">{walletLoading ? "…" : `$${walletBalance.toFixed(2)}`}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-xs text-slate-400">Tickets</p>
                <p className="text-lg font-extrabold text-white">{tickets.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-xs text-slate-400">Referidos</p>
                <p className="text-lg font-extrabold text-white">{referrals.length}</p>
              </div>
            </div>

            {achievements.length ? (
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <span key={a.id} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                    {a.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing((v) => !v)
                  setMessage("")
                  setErrorMsg("")
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                <Pencil className="h-4 w-4" /> {editing ? "Cerrar edición" : "Editar"}
              </button>
            </div>
          </section>
        ) : null}

        {!loading && profile ? (
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab("personal")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "personal" ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setTab("legal")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "legal" ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                Legal
              </button>
              <button
                type="button"
                onClick={() => setTab("kyc")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "kyc" ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                KYC
              </button>
              <button
                type="button"
                onClick={() => setTab("subscription")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === "subscription" ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/15"
                }`}
              >
                Subscripción
              </button>
            </div>

            {tab === "personal" ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                  <input
                    value={String(draft?.name || "")}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                  <textarea
                    value={String(draft?.bio || "")}
                    onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                    placeholder="Escribe una breve descripción"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar URL</label>
                  <input
                    value={String((draft as any)?.avatar || "")}
                    onChange={(e) => setDraft((p) => ({ ...p, avatar: e.target.value }))}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={String((draft as any)?.socials?.instagram || "")}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            socials: { ...(p as any).socials, instagram: e.target.value },
                          }))
                        }
                        disabled={!editing}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                        placeholder="usuario (sin @)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={String((draft as any)?.socials?.whatsapp || "")}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            socials: { ...(p as any).socials, whatsapp: e.target.value },
                          }))
                        }
                        disabled={!editing}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                        placeholder="58..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">TikTok</label>
                    <div className="relative">
                      <Music className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={String((draft as any)?.socials?.tiktok || "")}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            socials: { ...(p as any).socials, tiktok: e.target.value },
                          }))
                        }
                        disabled={!editing}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                        placeholder="usuario (sin @)"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telegram</label>
                    <div className="relative">
                      <Plane className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={String((draft as any)?.socials?.telegram || "")}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            socials: { ...(p as any).socials, telegram: e.target.value },
                          }))
                        }
                        disabled={!editing}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                        placeholder="usuario (sin @)"
                      />
                    </div>
                  </div>
                </div>

                {editing ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setDraft({
                          name: profile?.name || "",
                          bio: profile?.bio || "",
                          avatar: profile?.avatarUrl || profile?.avatar || "",
                          phone: profile?.phone || "",
                          address: profile?.address || "",
                          cedula: profile?.cedula || "",
                          state: profile?.state || "",
                          socials: {
                            instagram: profile?.socials?.instagram || "",
                            whatsapp: profile?.socials?.whatsapp || "",
                            tiktok: profile?.socials?.tiktok || "",
                            telegram: profile?.socials?.telegram || "",
                          },
                        })
                      }}
                      className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {tab === "legal" ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                    <input
                      value={String(draft?.phone || "")}
                      onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                      disabled={!editing}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                      placeholder="+58..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                    <input
                      value={String((draft as any)?.state || "")}
                      onChange={(e) => setDraft((p) => ({ ...p, state: e.target.value }))}
                      disabled={!editing}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                      placeholder="Ej: Miranda"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección</label>
                  <input
                    value={String(draft?.address || "")}
                    onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                    placeholder="Tu dirección"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula</label>
                  <input
                    value={String(draft?.cedula || "")}
                    onChange={(e) => setDraft((p) => ({ ...p, cedula: e.target.value }))}
                    disabled={!editing}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-70"
                    placeholder="V-..."
                  />
                </div>
                {editing ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                ) : null}
              </section>
            ) : null}

            {tab === "kyc" ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-sm font-semibold text-white">Verificación de identidad (KYC)</p>
                  <p className="mt-1 text-xs text-slate-400">Sube tu cédula y una selfie para verificación.</p>
                  <p className="mt-2 text-xs text-slate-300">
                    Estado: <span className="font-semibold">{profile.identityVerified ? "verificado" : "pendiente"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-xs text-slate-300 font-semibold">Cédula (frontal)</p>
                    {kycImages.front?.previewUrl ? (
                      <img src={kycImages.front.previewUrl} alt="Frontal" className="mt-2 h-40 w-full rounded-xl object-contain bg-black/40" />
                    ) : (
                      <div className="mt-2 h-40 w-full rounded-xl border border-slate-800 bg-slate-950/40 grid place-items-center text-slate-500">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-xs text-slate-300"
                      onChange={(e) => onPickKycFile("front", e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-xs text-slate-300 font-semibold">Cédula (reverso)</p>
                    {kycImages.back?.previewUrl ? (
                      <img src={kycImages.back.previewUrl} alt="Reverso" className="mt-2 h-40 w-full rounded-xl object-contain bg-black/40" />
                    ) : (
                      <div className="mt-2 h-40 w-full rounded-xl border border-slate-800 bg-slate-950/40 grid place-items-center text-slate-500">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-xs text-slate-300"
                      onChange={(e) => onPickKycFile("back", e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <p className="text-xs text-slate-300 font-semibold">Selfie</p>
                    {kycImages.selfie?.previewUrl ? (
                      <img src={kycImages.selfie.previewUrl} alt="Selfie" className="mt-2 h-40 w-full rounded-xl object-contain bg-black/40" />
                    ) : (
                      <div className="mt-2 h-40 w-full rounded-xl border border-slate-800 bg-slate-950/40 grid place-items-center text-slate-500">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-xs text-slate-300"
                      onChange={(e) => onPickKycFile("selfie", e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSubmitKyc}
                  disabled={kycUploading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {kycUploading ? "Enviando..." : "Enviar verificación"}
                </button>
              </section>
            ) : null}

            {tab === "subscription" ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-sm font-semibold text-white">Boost</p>
                  <p className="mt-1 text-xs text-slate-400">Impulsa tus publicaciones (solo para roles que publican).</p>
                </div>

                {isOrganizerRole ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <p className="text-xs text-slate-400">Estado</p>
                      <p className="text-sm font-semibold text-white">
                        {boostData ? String((boostData as any)?.status || "activo") : "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onActivateBoost}
                      disabled={activatingBoost}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-purple-500 disabled:opacity-60"
                    >
                      <Grid3X3 className="h-4 w-4" /> {activatingBoost ? "Activando..." : "Activar boost"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-center text-slate-200">
                    Esta sección aplica para rifero/admin.
                  </div>
                )}
              </section>
            ) : null}
          </section>
        ) : null}

        {!loading && (referralCode || referrals.length) ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <Users className="h-4 w-4" /> Referidos
            </div>
            {referralCode ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="text-xs text-slate-400">Tu código</p>
                <p className="text-lg font-extrabold text-white wrap-break-word">{referralCode}</p>
              </div>
            ) : null}
            {referrals.length ? (
              <div className="space-y-2">
                {referrals.slice(0, 10).map((r, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{r.name || "Referido"}</p>
                    <p className="text-xs text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""} {r.verified ? "• verificado" : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                Aún no tienes referidos.
              </div>
            )}
          </section>
        ) : null}

        {!loading && isOrganizerRole ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <Grid3X3 className="h-4 w-4" /> Mis publicaciones
            </div>
            {myPublicationsLoading ? <p className="text-sm text-slate-300">Cargando publicaciones…</p> : null}
            {!myPublicationsLoading && myPublications.length ? (
              <div className="space-y-2">
                {myPublications.slice(0, 12).map((r: any, idx: number) => (
                  <Link
                    key={String(r?.id ?? idx)}
                    href={r?.id != null ? `/rifas/${String(r.id)}` : "/rifas"}
                    className="block rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 hover:bg-slate-950/60"
                  >
                    <p className="text-sm font-semibold text-white truncate">{String(r?.title || "Rifa")}</p>
                    <p className="text-xs text-slate-400">Estado: {String(r?.status || "-")}</p>
                  </Link>
                ))}
              </div>
            ) : null}
            {!myPublicationsLoading && !myPublications.length ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                No tienes publicaciones.
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="text-sm font-extrabold">Seguridad</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onChangePassword}
              disabled={changingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15 disabled:opacity-60"
            >
              {changingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </section>
        ) : null}

        {!loading ? (
          <section className="rounded-2xl border border-red-400/20 bg-red-900/10 p-5 space-y-3">
            <div className="text-sm font-extrabold text-red-100">Zona de peligro</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onDeleteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/20 px-5 py-3 text-sm font-extrabold text-red-100 hover:bg-red-500/25"
              >
                <Trash className="h-4 w-4" /> Eliminar cuenta
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
