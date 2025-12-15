"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminCreateRaffle, fetchRafflesLive } from "@/lib/api";
import type { Raffle } from "@/lib/types";

const defaultRaffleForm = { title: "", description: "", price: 0, totalTickets: 0, drawDate: "", endDate: "", status: "activa" };

export default function AdminRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [rafflesError, setRafflesError] = useState<string | null>(null);
  const [rafflesLoading, setRafflesLoading] = useState(false);
  const [raffleTab, setRaffleTab] = useState<"list" | "create">("list");
  const [raffleForm, setRaffleForm] = useState(defaultRaffleForm);
  const [raffleFlyer, setRaffleFlyer] = useState<File | null>(null);
  const [raffleImages, setRaffleImages] = useState<File[]>([]);
  const [rafflePreviews, setRafflePreviews] = useState<Array<{ url: string; name: string; sizeKb: number; width?: number; height?: number }>>([]);
  const [raffleError, setRaffleError] = useState<string | null>(null);
  const [raffleSubmitting, setRaffleSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const notify = (message: string, variant: "success" | "error") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3200);
  };

  const loadRaffles = useCallback(async () => {
    setRafflesLoading(true);
    try {
      const data = await fetchRafflesLive();
      setRaffles(data);
      setRafflesError(null);
    } catch (err) {
      setRaffles([]);
      setRafflesError(err instanceof Error ? err.message : "No se pudieron cargar rifas");
    } finally {
      setRafflesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRaffles();
    return () => {
      rafflePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revokePreviews = useCallback(() => {
    rafflePreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [rafflePreviews]);

  const resizeImageFile = useCallback((file: File) => {
    return new Promise<File>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1400;
        const maxH = 1400;
        const ratio = Math.min(1, maxW / img.width, maxH / img.height);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type || "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          file.type || "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImagesSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      setRaffleError(null);
      revokePreviews();
      const raw = Array.from(files).slice(0, 3);
      const resized = await Promise.all(raw.map((f) => resizeImageFile(f)));
      const previews = await Promise.all(
        resized.map(
          (file) =>
            new Promise<{ url: string; name: string; sizeKb: number; width?: number; height?: number }>((resolve) => {
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                resolve({ url, name: file.name, sizeKb: Math.round(file.size / 1024), width: img.width, height: img.height });
              };
              img.onerror = () => resolve({ url, name: file.name, sizeKb: Math.round(file.size / 1024) });
              img.src = url;
            })
        )
      );
      setRaffleImages(resized);
      setRafflePreviews(previews);
      if (files.length > 3) setRaffleError("Máximo 3 fotos. Se tomaron las primeras 3.");
    },
    [revokePreviews, resizeImageFile]
  );

  const resetRaffleForm = useCallback(() => {
    revokePreviews();
    setRaffleForm(defaultRaffleForm);
    setRaffleFlyer(null);
    setRaffleImages([]);
    setRafflePreviews([]);
    setRaffleError(null);
  }, [revokePreviews]);

  const submitRaffle = useCallback(async () => {
    setRaffleError(null);
    if (!raffleForm.title.trim()) return setRaffleError("Título es obligatorio.");
    if (!raffleForm.price || raffleForm.price <= 0) return setRaffleError("Precio debe ser mayor a 0.");
    if (!raffleForm.totalTickets || raffleForm.totalTickets <= 0) return setRaffleError("Total de tickets debe ser mayor a 0.");
    setRaffleSubmitting(true);
    try {
      await adminCreateRaffle({
        title: raffleForm.title,
        description: raffleForm.description,
        price: raffleForm.price,
        totalTickets: raffleForm.totalTickets,
        drawDate: raffleForm.drawDate,
        endDate: raffleForm.endDate,
        status: raffleForm.status,
        flyer: raffleFlyer,
        images: raffleImages,
      });
      notify("Rifa creada", "success");
      resetRaffleForm();
      setRaffleTab("list");
      loadRaffles();
    } catch (err) {
      setRaffleError(err instanceof Error ? err.message : "No se pudo crear la rifa");
    } finally {
      setRaffleSubmitting(false);
    }
  }, [raffleForm, raffleFlyer, raffleImages, resetRaffleForm, loadRaffles]);

  const activeRaffles = useMemo(() => raffles.filter((r) => r.status === "activa"), [raffles]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      {toast && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-lg shadow-black/30">
          <span className={`h-2 w-2 rounded-full ${toast.variant === "success" ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Rifas</h1>
          <p className="text-white/80">Crear, editar, subir flyer y galería.</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[{ id: "list", label: "Rifas activas" }, { id: "create", label: "Crear rifa" }].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRaffleTab(tab.id as typeof raffleTab)}
              className={`rounded-lg border px-4 py-2 font-semibold transition ${
                raffleTab === tab.id ? "border-emerald-400/70 bg-emerald-400/15 text-white" : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {raffleTab === "list" && (
        <div className="mt-6 space-y-4">
          {rafflesLoading && <p className="text-sm text-white/70">Cargando rifas...</p>}
          {rafflesError && <p className="text-sm text-red-200">{rafflesError}. Conecta el backend y vuelve a intentar.</p>}
          {!rafflesLoading && !rafflesError && raffles.length === 0 && <p className="text-sm text-white/70">No hay rifas creadas aún.</p>}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {raffles.map((raffle) => {
              const sold = (raffle.ticketsTotal ?? 0) - (raffle.ticketsAvailable ?? 0);
              const progress = raffle.ticketsTotal ? Math.min(100, Math.round((sold / raffle.ticketsTotal) * 100)) : 0;
              const gallery = ((raffle as any)?.style?.gallery as string[]) || [];
              const banner = (raffle as any)?.style?.bannerImage;
              const visuals = gallery.length ? gallery.slice(0, 3) : banner ? [banner] : [];

              return (
                <div key={raffle.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                      <p className="text-xs text-white/60">ID: {raffle.id}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${raffle.status === "activa" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/15 text-white/80"}`}>
                      {raffle.status}
                    </span>
                  </div>

                  {visuals.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 text-[0] snap-x snap-mandatory">
                      {visuals.map((src) => (
                        <div key={src} className="min-w-[180px] snap-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={raffle.title} className="h-28 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-sm text-white/80">
                    <p>Precio ticket: ${raffle.price?.toLocaleString()}</p>
                    <p>Venta: {sold.toLocaleString()} / {raffle.ticketsTotal?.toLocaleString()} tickets</p>
                    <p>Disponible: {raffle.ticketsAvailable?.toLocaleString()}</p>
                    <p>Sorteo: {raffle.drawDate}</p>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }} aria-label={`Progreso ${progress}%`} />
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <Link
                      href={`/rifas/${raffle.id}`}
                      className="rounded-lg border border-white/20 px-3 py-2 font-semibold text-white transition hover:-translate-y-[1px] hover:border-emerald-300/60"
                    >
                      Ver rifa
                    </Link>
                    <Link
                      href="/admin/raffles"
                      className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-2 font-semibold text-emerald-50 transition hover:-translate-y-[1px] hover:border-emerald-300/80"
                    >
                      Editar en admin
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {raffleTab === "create" && (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="space-y-1 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Título *</span>
                <input
                  value={raffleForm.title}
                  onChange={(e) => setRaffleForm((s) => ({ ...s, title: e.target.value }))}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  placeholder="Rifa especial"
                />
              </label>
              <label className="space-y-1 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Descripción</span>
                <textarea
                  value={raffleForm.description}
                  onChange={(e) => setRaffleForm((s) => ({ ...s, description: e.target.value }))}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  rows={4}
                  placeholder="Detalles, premios, condiciones"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-white/80">
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Precio *</span>
                  <input
                    type="number"
                    min={0}
                    value={raffleForm.price}
                    onChange={(e) => setRaffleForm((s) => ({ ...s, price: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm text-white/80">
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Tickets *</span>
                  <input
                    type="number"
                    min={1}
                    value={raffleForm.totalTickets}
                    onChange={(e) => setRaffleForm((s) => ({ ...s, totalTickets: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-sm text-white/80">
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Fecha inicio</span>
                  <input
                    type="datetime-local"
                    value={raffleForm.drawDate}
                    onChange={(e) => setRaffleForm((s) => ({ ...s, drawDate: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm text-white/80">
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Fecha fin</span>
                  <input
                    type="datetime-local"
                    value={raffleForm.endDate}
                    onChange={(e) => setRaffleForm((s) => ({ ...s, endDate: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                  />
                </label>
                <label className="space-y-1 text-sm text-white/80">
                  <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Estado</span>
                  <select
                    value={raffleForm.status}
                    onChange={(e) => setRaffleForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none bg-transparent"
                  >
                    <option value="activa" className="bg-[#0b1224]">Activa</option>
                    <option value="borrador" className="bg-[#0b1224]">Borrador</option>
                    <option value="pausada" className="bg-[#0b1224]">Pausada</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="space-y-1 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Flyer (recomendado 1200x800, máx 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    if (!file) {
                      setRaffleFlyer(null);
                      return;
                    }
                    const resized = await resizeImageFile(file);
                    setRaffleFlyer(resized);
                  }}
                  className="w-full text-xs text-white/70"
                />
              </label>

              <label className="space-y-1 text-sm text-white/80">
                <span className="block text-xs uppercase tracking-[0.2em] text-white/60">Galería (máximo 3 fotos, 2MB c/u)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImagesSelect(e.target.files)}
                  className="w-full text-xs text-white/70"
                />
              </label>

              {rafflePreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 text-[0] snap-x snap-mandatory">
                  {rafflePreviews.map((img) => (
                    <div key={img.url} className="min-w-[140px] snap-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 text-left text-xs text-white/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="h-24 w-full rounded-lg object-cover" />
                      <p className="mt-1 truncate">{img.name}</p>
                      <p>{img.sizeKb} KB {img.width && img.height ? `(${img.width}x${img.height})` : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {raffleError && <p className="text-sm text-red-200">{raffleError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={submitRaffle}
              disabled={raffleSubmitting}
              className="rounded-lg border border-emerald-300/50 bg-emerald-300/20 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:-translate-y-[1px] hover:border-emerald-200/80 disabled:opacity-50"
            >
              {raffleSubmitting ? "Creando..." : "Crear rifa"}
            </button>
            <button
              type="button"
              onClick={resetRaffleForm}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
            >
              Limpiar
            </button>
            <div className="ml-auto text-xs text-white/60">Activas: {activeRaffles.length}</div>
          </div>
        </div>
      )}
    </main>
  );
}
