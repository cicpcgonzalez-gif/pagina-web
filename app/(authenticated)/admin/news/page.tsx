"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import RequireRole from "../../../_components/RequireRole"
import { adminCreateAnnouncement, fetchAnnouncements } from "@/lib/api"
import { Megaphone } from "lucide-react"

export default function AdminNewsPage() {
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchAnnouncements()
      setItems(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las novedades.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onPublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setPublishing(true)
    setError(null)
    setMessage(null)
    try {
      const res = await adminCreateAnnouncement({ title: title.trim(), content: content.trim(), imageUrl: imageUrl.trim() || undefined })
      const msg = (res as any)?.message ? String((res as any).message) : "Anuncio publicado"
      setMessage(msg)
      setTitle("")
      setContent("")
      setImageUrl("")
      await load()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "No se pudo publicar.")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <RequireRole allow={["admin", "organizer", "superadmin"]} nextPath="/admin/news" title="Novedades">
      <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
              <h1 className="text-2xl font-extrabold text-white">NOVEDADES</h1>
              <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-4 space-y-6 pb-24">
          <section className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/60 px-3 py-1 text-sm font-semibold text-purple-100 shadow-inner shadow-purple-900/40">
              <Megaphone className="h-4 w-4" /> Avisos
            </div>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-white">Novedades</h2>
            <p className="mt-2 text-slate-200 text-sm">Publicar anuncios (endpoint <span className="font-semibold">/admin/announcements</span>) y listar (<span className="font-semibold">/announcements</span>).</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold" href="/admin">
                Volver
              </Link>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-full px-5 py-3 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-lg font-bold text-white">Publicar anuncio</h3>
            <form className="mt-4 space-y-4" onSubmit={onPublish}>
              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="title">Título</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Nuevo anuncio"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="content">Contenido</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Texto del anuncio"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300" htmlFor="imageUrl">Imagen URL (opcional)</label>
                <input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-300 transition disabled:opacity-60"
              >
                {publishing ? "Publicando..." : "Publicar"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">{error}</div>
            ) : null}
            {message ? (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{message}</div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/30">
            <h3 className="text-lg font-bold text-white">Últimas novedades</h3>
            {loading ? <p className="mt-3 text-sm text-slate-300">Cargando…</p> : null}
            {!loading && !items.length ? (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-center text-slate-200">No hay anuncios.</div>
            ) : null}
            <div className="mt-4 grid gap-3">
              {items.map((a, idx) => {
                const id = (a as any)?.id ?? idx
                const createdAt = (a as any)?.createdAt
                const adminName = (a as any)?.admin?.name
                return (
                  <div key={String(id)} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-sm font-extrabold text-white">{String((a as any)?.title || "Anuncio")}</p>
                    <p className="mt-1 text-xs text-slate-300">{adminName ? `Por ${adminName}` : ""}{createdAt ? ` · ${new Date(String(createdAt)).toLocaleString()}` : ""}</p>
                    <p className="mt-3 text-sm text-slate-100 whitespace-pre-wrap">{String((a as any)?.content || "")}</p>
                    {(a as any)?.imageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
                        <img src={String((a as any).imageUrl)} alt="Imagen" className="h-48 w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </RequireRole>
  )
}
