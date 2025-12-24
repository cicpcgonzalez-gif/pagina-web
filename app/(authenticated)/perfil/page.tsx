"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchProfile, updateProfile } from "@/lib/api"
import { getAuthToken, getUserRole } from "@/lib/session"
import type { UserProfile } from "@/lib/types"
import { User, Shield, Crown, Save } from "lucide-react"

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [instagram, setInstagram] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent("/perfil")}`)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchProfile()
        if (!mounted) return
        setProfile(data)
        setName(data?.name || "")
        setBio(data?.bio || "")
        setInstagram(data?.socials?.instagram || "")
        setWhatsapp(data?.socials?.whatsapp || "")
        setAvatarUrl(data?.avatarUrl || data?.avatar || "")
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudo cargar tu perfil.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [router])

  const role = String(getUserRole() || "").toLowerCase()

  const onSave = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const payload: Partial<UserProfile> & { avatar?: string } = {
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar: avatarUrl.trim() || undefined,
        socials: {
          instagram: instagram.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
        },
      }
      const user = await updateProfile(payload)
      setProfile(user ?? profile)
      setMessage("Perfil actualizado")
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar tu perfil.")
    } finally {
      setSaving(false)
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
        {error ? <div className="rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {message ? <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div> : null}

        {!loading && profile ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-500 to-indigo-500 p-0.5">
                  <div className="h-full w-full rounded-full bg-slate-950 grid place-items-center text-base font-bold text-white">
                    {(profile.name || profile.email || "U").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{profile.name || "Usuario"}</p>
                  <p className="text-xs text-slate-300">{profile.email || profile.phone || ""}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
                {role === "superadmin" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {role || "usuario"}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Escribe una breve descripción"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram</label>
                  <input
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="@usuario"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    placeholder="+58..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar URL</label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="flex flex-wrap gap-3">
          <Link className="rounded-full px-5 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-500 transition" href="/rifas">
            Rifas
          </Link>
          <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/wallet">
            Billetera
          </Link>
          {role === "superadmin" ? (
            <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/superadmin">
              Superadmin
            </Link>
          ) : null}
          {role === "admin" || role === "organizer" || role === "superadmin" ? (
            <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
              Admin
            </Link>
          ) : null}
        </section>
      </main>
    </div>
  )
}
