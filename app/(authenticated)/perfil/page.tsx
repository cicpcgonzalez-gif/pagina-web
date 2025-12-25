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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Crown,
  Grid3X3,
  Instagram,
  LogOut,
  MessageCircle,
  Music,
  Pencil,
  Plane,
  RefreshCcw,
  Save,
  Shield,
  Ticket,
  Trash,
  User,
  X,
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

function typeLabel(type: unknown) {
  const t = String(type || "").toLowerCase()
  if (!t) return "Movimiento"
  if (t === "manual_payment") return "Pago manual"
  if (t === "ticket_purchase") return "Compra de tickets"
  if (t === "topup") return "Recarga"
  if (t === "withdrawal") return "Retiro"
  return t.replace(/_/g, " ")
}

function statusPillClass(status: unknown) {
  const s = String(status || "").toLowerCase()
  if (s === "approved" || s === "success" || s === "completed") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
  if (s === "rejected" || s === "failed") return "border-red-400/30 bg-red-500/10 text-red-100"
  return "border-amber-400/30 bg-amber-400/10 text-amber-100"
}

function raffleStatusPillClass(status: unknown) {
  const s = String(status || "").toLowerCase()
  if (s === "activa" || s === "active") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
  if (s === "cerrada" || s === "closed") return "border-slate-400/30 bg-slate-400/10 text-slate-100"
  if (s === "pausada" || s === "paused") return "border-amber-400/30 bg-amber-400/10 text-amber-100"
  return "border-white/10 bg-white/5 text-slate-100"
}

function buildDraftFromProfile(me: UserProfile | null): Partial<UserProfile> {
  return {
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
    ...(me ? { companyName: (me as any)?.companyName || "", rif: (me as any)?.rif || "" } : {}),
  } as any
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

  const [panelVisible, setPanelVisible] = useState(false)
  const [movementsVisible, setMovementsVisible] = useState(false)
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [walletData, setWalletData] = useState<{ balance: number; currency: string; transactions: Array<Record<string, any>> }>({
    balance: 0,
    currency: "USD",
    transactions: [],
  })

  const [referralsVisible, setReferralsVisible] = useState(false)

  const [myPublications, setMyPublications] = useState<Array<Record<string, any>>>([])
  const [myPublicationsLoading, setMyPublicationsLoading] = useState(false)
  const [boostData, setBoostData] = useState<any>(null)
  const [activatingBoost, setActivatingBoost] = useState(false)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<"personal" | "legal" | "kyc" | "subscription">("personal")

  const [draft, setDraft] = useState<Partial<UserProfile>>({})
  const [avatarPicking, setAvatarPicking] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
        setDraft(buildDraftFromProfile(me))

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

  const loadMyMovements = async () => {
    setMovementsLoading(true)
    setMessage("")
    try {
      const w = await fetchWallet()
      const balance = Number((w as any)?.balance || 0)
      const transactions = Array.isArray((w as any)?.transactions) ? (w as any).transactions : []
      const currency = String((w as any)?.currency || (transactions?.[0] as any)?.currency || "USD")
      setWalletData({ balance, currency, transactions })
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudieron cargar tus movimientos.")
      setWalletData({ balance: 0, currency: "USD", transactions: [] })
    } finally {
      setMovementsLoading(false)
    }
  }

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
      setDraft(buildDraftFromProfile((user as any) ?? profile))
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

  const onPickAvatarFile = async (file: File | null) => {
    if (!file) return
    setAvatarPicking(true)
    setMessage("")
    try {
      const dataUrl = await readAsDataUrl(file)
      setDraft((prev) => ({ ...prev, avatar: dataUrl }))
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo cargar la imagen.")
    } finally {
      setAvatarPicking(false)
    }
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
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold text-white">Mi perfil</h1>
            <button
              type="button"
              onClick={() => setPanelVisible(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Abrir panel de perfil"
            >
              <Grid3X3 className="h-5 w-5 text-slate-200" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
        {loading ? <p className="text-slate-300">Cargando…</p> : null}
        {errorMsg ? (
          <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{errorMsg}</div>
        ) : null}
        {message ? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div>
        ) : null}

        {panelVisible ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setPanelVisible(false)}
              aria-label="Cerrar panel"
            />
            <div className="absolute inset-y-0 left-0 w-[82%] max-w-sm border-r border-white/10 bg-slate-950/95 p-4 pt-12">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-2xl border border-purple-500/30 bg-purple-500/10 grid place-items-center">
                    <User className="h-5 w-5 text-slate-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white truncate">{profile?.name || "Usuario"}</p>
                    <p className="text-xs text-slate-400 truncate">{profile?.email || ""}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelVisible(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-slate-200" />
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setPanelVisible(false)
                  setMovementsVisible(true)
                  await loadMyMovements()
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 grid place-items-center">
                    <RefreshCcw className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-white">Transacciones / Movimientos</p>
                    <p className="text-xs text-slate-400">Ver tus últimos movimientos</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </button>
            </div>
          </div>
        ) : null}

        {movementsVisible ? (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute left-4 right-4 top-20 bottom-6 rounded-2xl border border-white/10 bg-slate-950/95 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-lg font-extrabold text-white">Movimientos</p>
                  <p className="text-xs text-slate-400">
                    Saldo: {Number(walletData?.balance || 0).toFixed(2)} {walletData?.currency || "USD"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadMyMovements}
                    disabled={movementsLoading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-60"
                    aria-label="Recargar"
                  >
                    <RefreshCcw className="h-5 w-5 text-slate-200" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementsVisible(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5 text-slate-200" />
                  </button>
                </div>
              </div>

              {movementsLoading ? (
                <p className="text-sm text-slate-300">Cargando movimientos...</p>
              ) : walletData?.transactions?.length ? (
                <div className="h-[calc(100%-3.5rem)] overflow-auto pr-1 space-y-2">
                  {walletData.transactions.map((tx: any, idx: number) => {
                    const amount = Number(tx?.amount || 0)
                    const currency = String(tx?.currency || walletData?.currency || "USD")
                    const status = String(tx?.status || "pending")
                    return (
                      <div key={String(tx?.id ?? idx)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-white truncate">{typeLabel(tx?.type)}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {tx?.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-white">{amount.toFixed(2)} {currency}</p>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${statusPillClass(status)}`}>{status}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  Aún no tienes movimientos.
                </div>
              )}
            </div>
          </div>
        ) : null}

        {referralsVisible ? (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setReferralsVisible(false)}
              aria-label="Cerrar referidos"
            />
            <div className="absolute left-4 right-4 top-24 max-w-xl mx-auto rounded-2xl border border-white/10 bg-slate-950/95 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-lg font-extrabold text-white">Referidos</p>
                <button
                  type="button"
                  onClick={() => setReferralsVisible(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-slate-200" />
                </button>
              </div>

              {referralCode ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 mb-3">
                  <p className="text-xs text-slate-400">Tu código</p>
                  <p className="text-lg font-extrabold text-white break-words">{referralCode}</p>
                </div>
              ) : null}

              {referrals.length ? (
                <div className="max-h-[45vh] overflow-auto pr-1 space-y-2">
                  {referrals.slice(0, 50).map((r, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-sm font-extrabold text-white">{r.name || "Referido"}</p>
                      <p className="text-xs text-slate-400">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""} {r.verified ? "• verificado" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  Aún no tienes referidos.
                </div>
              )}
            </div>
          </div>
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
                  <p className="text-xs text-slate-300 truncate">
                    ID: {profile.securityId || profile.publicId || "—"}
                  </p>

                  {(!!profile.verified || !!profile.identityVerified) ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!!profile.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
                          <CheckCircle2 className="h-4 w-4" /> Email verificado
                        </span>
                      ) : null}
                      {!!profile.identityVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
                          <CheckCircle2 className="h-4 w-4" /> KYC verificado
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">Tickets</p>
                    <p className="text-2xl font-extrabold text-white leading-none">{tickets.length}</p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                    <Ticket className="h-5 w-5 text-slate-200" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReferralsVisible(true)}
                className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 text-left hover:bg-slate-950/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">Referidos</p>
                    <p className="text-2xl font-extrabold text-white leading-none">{referrals.length}</p>
                  </div>
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                    <Users className="h-5 w-5 text-slate-200" />
                  </div>
                </div>
              </button>
            </div>

            <p className="text-sm text-slate-300 text-center">
              {isOrganizerRole ? "Promociona tus rifas • Más alcance • Más ventas" : "Compra segura • Participa y gana • Invita y suma beneficios"}
            </p>
          </section>
        ) : null}

        {!loading && profile ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-4">
            <p className="text-sm text-slate-200 text-center">{String(profile.bio || "Sin biografía.")}</p>

            {achievements.length ? (
              <div className="flex flex-wrap justify-center gap-2">
                {achievements.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100">
                    {a.label}
                  </span>
                ))}
              </div>
            ) : null}

            {(profile.socials?.whatsapp || profile.socials?.instagram || profile.socials?.tiktok || profile.socials?.telegram) ? (
              <div className="flex flex-wrap justify-center gap-4">
                {profile.socials?.whatsapp ? (
                  <button
                    type="button"
                    onClick={() => window.open(`https://wa.me/${String(profile.socials?.whatsapp).replace(/\D/g, "")}`, "_blank")}
                    aria-label="WhatsApp"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-200" />
                  </button>
                ) : null}
                {profile.socials?.instagram ? (
                  <button
                    type="button"
                    onClick={() => window.open(`https://instagram.com/${String(profile.socials?.instagram).replace(/^@/, "")}`, "_blank")}
                    aria-label="Instagram"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Instagram className="h-5 w-5 text-pink-200" />
                  </button>
                ) : null}
                {profile.socials?.tiktok ? (
                  <button
                    type="button"
                    onClick={() => window.open(`https://www.tiktok.com/@${String(profile.socials?.tiktok).replace(/^@/, "")}`, "_blank")}
                    aria-label="TikTok"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Music className="h-5 w-5 text-slate-200" />
                  </button>
                ) : null}
                {profile.socials?.telegram ? (
                  <button
                    type="button"
                    onClick={() => window.open(`https://t.me/${String(profile.socials?.telegram).replace(/^@/, "")}`, "_blank")}
                    aria-label="Telegram"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    <Plane className="h-5 w-5 text-blue-200" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading && profile && !isOrganizerRole ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              <Users className="h-4 w-4" /> Actividad
            </div>
            {tickets.length ? (
              <div className="space-y-2">
                {tickets.slice(0, 12).map((t, idx) => (
                  <Link
                    key={String(t?.id ?? idx)}
                    href={t?.raffleId != null ? `/rifas/${String(t.raffleId)}` : "/rifas"}
                    className="block rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 hover:bg-slate-950/60"
                  >
                    <p className="text-sm font-semibold text-white truncate">{t.raffleTitle || "Rifa"}</p>
                    <p className="text-xs text-slate-400">
                      Ticket: {t.number ?? t.serialNumber ?? t.serial ?? t.code ?? "—"} • {t.status || t.state || "—"} •{" "}
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">Aún no tienes actividad.</div>
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
                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-3 py-3 hover:bg-slate-950/60"
                  >
                    <div className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      {(() => {
                        const style = r?.style || {}
                        const gallery0 = Array.isArray(style?.gallery) ? style.gallery?.[0] : null
                        const img = style?.bannerImage || gallery0 || r?.bannerImage || r?.image || null
                        return img ? (
                          <img src={String(img)} alt="Rifa" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-xs font-extrabold text-white">MR</div>
                        )
                      })()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-white truncate">{String(r?.title || "Rifa")}</p>
                      <p className="text-xs text-slate-400 truncate">{r?.endDate ? new Date(r.endDate).toLocaleDateString() : r?.drawDate ? new Date(r.drawDate).toLocaleDateString() : ""}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${raffleStatusPillClass(r?.status)}`}>
                        {String(r?.status || "-")}
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
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

        {!loading && profile ? (
          <button
            type="button"
            onClick={() => {
              setEditing((v) => !v)
              setTab("personal")
              setDraft(buildDraftFromProfile(profile))
            }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-extrabold text-cyan-300"
          >
            <Pencil className="h-4 w-4" /> {editing ? "Cancelar Edición" : "Editar Perfil"}
          </button>
        ) : null}

        {!loading && profile && editing ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-4">
            {isOrganizerRole ? (
              <>
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
                    Plan
                  </button>
                </div>

                {tab === "personal" ? (
                  <div className="space-y-3">
                    <p className="text-sm font-extrabold text-white">Información Pública</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                          {(draft as any)?.avatar ? (
                            <img src={String((draft as any)?.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                          ) : profile?.avatarUrl || profile?.avatar ? (
                            <img src={String(profile?.avatarUrl || profile?.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-sm font-extrabold text-white">
                              {(profile?.name || profile?.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-xs text-slate-300"
                            onChange={(e) => onPickAvatarFile(e.target.files?.[0] || null)}
                          />
                          <p className="mt-1 text-[11px] text-slate-400">Selecciona una imagen desde tu PC.</p>
                          {avatarPicking ? <p className="mt-1 text-[11px] text-slate-300">Cargando imagen...</p> : null}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Visible</label>
                      <input
                        value={String(draft?.name || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Descripción</label>
                      <textarea
                        value={String(draft?.bio || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Contacto</label>
                      <input
                        value={String(draft?.phone || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (Solo números)</label>
                        <input
                          value={String((draft as any)?.socials?.whatsapp || "")}
                          onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, whatsapp: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram (@usuario)</label>
                        <input
                          value={String((draft as any)?.socials?.instagram || "")}
                          onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, instagram: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">TikTok (@usuario)</label>
                        <input
                          value={String((draft as any)?.socials?.tiktok || "")}
                          onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, tiktok: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Telegram (@usuario o usuario)</label>
                        <input
                          value={String((draft as any)?.socials?.telegram || "")}
                          onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, telegram: e.target.value } }))}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {tab === "legal" ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">Información para recibos y facturación.</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Legal / Razón Social</label>
                      <input
                        value={String((draft as any)?.companyName || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value } as any))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        placeholder="Ej: Inversiones MegaRifas C.A."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">RIF / Cédula</label>
                      <input
                        value={String((draft as any)?.rif || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, rif: e.target.value } as any))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        placeholder="J-12345678-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Fiscal</label>
                      <input
                        value={String(draft?.address || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                        placeholder="Av. Principal..."
                      />
                    </div>
                  </div>
                ) : null}

                {tab === "kyc" ? (
                  <div className="space-y-4">
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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
                    >
                      {kycUploading ? "Enviando..." : "Enviar verificación"}
                    </button>
                  </div>
                ) : null}

                {tab === "subscription" ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <p className="text-sm font-semibold text-white">Boost</p>
                      <p className="mt-1 text-xs text-slate-400">Impulsa tus publicaciones.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <p className="text-xs text-slate-400">Estado</p>
                      <p className="text-sm font-semibold text-white">{boostData ? String((boostData as any)?.status || "activo") : "—"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={onActivateBoost}
                      disabled={activatingBoost}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-purple-500 disabled:opacity-60"
                    >
                      {activatingBoost ? "Activando..." : "Activar boost"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-white">Editar Información</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        {(draft as any)?.avatar ? (
                          <img src={String((draft as any)?.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                        ) : profile?.avatarUrl || profile?.avatar ? (
                          <img src={String(profile?.avatarUrl || profile?.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-sm font-extrabold text-white">
                            {(profile?.name || profile?.email || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-xs text-slate-300"
                          onChange={(e) => onPickAvatarFile(e.target.files?.[0] || null)}
                        />
                        <p className="mt-1 text-[11px] text-slate-400">Selecciona una imagen desde tu PC.</p>
                        {avatarPicking ? <p className="mt-1 text-[11px] text-slate-300">Cargando imagen...</p> : null}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                    <input
                      value={String(draft?.name || "")}
                      onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Biografía</label>
                    <textarea
                      value={String(draft?.bio || "")}
                      onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                    <input
                      value={String(draft?.phone || "")}
                      onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (Solo números)</label>
                      <input
                        value={String((draft as any)?.socials?.whatsapp || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, whatsapp: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram (@usuario)</label>
                      <input
                        value={String((draft as any)?.socials?.instagram || "")}
                        onChange={(e) => setDraft((p) => ({ ...p, socials: { ...(p as any).socials, instagram: e.target.value } }))}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </section>
        ) : null}

        {!loading && !isAdminOrSuperadmin ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-3">
            <p className="text-sm font-semibold text-white">Legal</p>
            <Link href="/estado" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10">
              <span className="text-sm text-white/85">Términos, Privacidad y Marco Legal</span>
              <ChevronRight className="h-5 w-5 text-white/50" />
            </Link>
          </section>
        ) : null}

        {!loading ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30 space-y-3">
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="flex w-full items-center justify-between">
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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                />
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                />
                <button
                  type="button"
                  onClick={onChangePassword}
                  disabled={changingPassword}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                >
                  <Shield className="h-4 w-4" /> {changingPassword ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading ? (
          <section className="space-y-3 pb-10">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-extrabold text-white"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
            <button type="button" onClick={onDeleteAccount} className="w-full text-center text-sm text-white/60 underline">
              Eliminar mi cuenta
            </button>
          </section>
        ) : null}
      </main>
    </div>
  )
}
