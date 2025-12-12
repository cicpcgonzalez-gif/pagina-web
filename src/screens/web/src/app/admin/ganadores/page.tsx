"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { fetchAdminWinners, fetchModules, fetchWinners, publishWinner } from "@/lib/api";
import { getUserRole } from "@/lib/session";
import type { ModuleConfig } from "@/lib/types";

type WinnerRow = {
  id: string;
  raffleTitle: string;
  winnerName: string;
  prize: string;
  drawDate?: string;
  testimonial?: string;
  photoUrl?: string;
  ticketNumber?: string;
};

const emptyForm = {
  raffleTitle: "",
  prize: "",
  winnerName: "",
  drawDate: "",
  testimonial: "",
  photoUrl: "",
  ticketNumber: "",
};

export default function AdminWinnersPage() {
  const [modulesConfig, setModulesConfig] = useState<ModuleConfig | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(true);
  const [winnersError, setWinnersError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "error" | null>(null);

  const role = getUserRole()?.toLowerCase();

  const fallbackWinners = useMemo(
    () => [
      {
        id: "W-01",
        raffleTitle: "Rifa Navidad",
        winnerName: "Ana P.",
        prize: "Auto compacto",
        drawDate: "2025-12-12",
        testimonial: "Gracias por la transparencia, recibí mi premio rápido.",
      },
    ],
    [],
  );

  useEffect(() => {
    let mounted = true;
    fetchModules()
      .then((data) => {
        if (!mounted) return;
        setModulesConfig(data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setModulesError(err instanceof Error ? err.message : "No se pudieron cargar módulos");
      })
      .finally(() => {
        if (mounted) setLoadingModules(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loadWinners = useCallback(async () => {
    setLoadingWinners(true);
    setWinnersError(null);
    try {
      const adminData = await fetchAdminWinners();
      if (adminData && Array.isArray(adminData) && adminData.length > 0) {
        setWinners(
          adminData.map((w, index) => ({
            id: String((w as any)?.id ?? `winner-${index}`),
            raffleTitle: (w as any)?.raffleTitle ?? (w as any)?.raffle?.title ?? "Rifa",
            winnerName: (w as any)?.winnerName ?? (w as any)?.user?.name ?? (w as any)?.userName ?? "Ganador",
            prize: (w as any)?.prize ?? (w as any)?.reward ?? "Premio",
            drawDate: (w as any)?.drawDate ?? (w as any)?.date ?? "",
            testimonial: (w as any)?.testimonial ?? "",
            photoUrl: (w as any)?.photoUrl ?? (w as any)?.avatar ?? "",
            ticketNumber: (w as any)?.ticketNumber ?? (w as any)?.ticket ?? (w as any)?.serialNumber ?? "",
          })),
        );
      } else {
        const publicData = await fetchWinners();
        if (publicData && Array.isArray(publicData) && publicData.length > 0) {
          setWinners(
            publicData.map((w, index) => ({
              id: String((w as any)?.id ?? `winner-${index}`),
              raffleTitle: (w as any)?.raffleTitle ?? (w as any)?.raffle?.title ?? "Rifa",
              winnerName: (w as any)?.winnerName ?? (w as any)?.user?.name ?? (w as any)?.userName ?? "Ganador",
              prize: (w as any)?.prize ?? (w as any)?.reward ?? "Premio",
              drawDate: (w as any)?.drawDate ?? (w as any)?.date ?? "",
              testimonial: (w as any)?.testimonial ?? "",
              photoUrl: (w as any)?.photoUrl ?? (w as any)?.avatar ?? "",
              ticketNumber: (w as any)?.ticketNumber ?? (w as any)?.ticket ?? (w as any)?.serialNumber ?? "",
            })),
          );
        } else {
          setWinners(fallbackWinners);
        }
      }
    } catch (err) {
      setWinnersError(err instanceof Error ? err.message : "No se pudieron cargar ganadores");
      setWinners(fallbackWinners);
    } finally {
      setLoadingWinners(false);
    }
  }, [fallbackWinners]);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      setMessage(null);
      setMessageVariant(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [message]);

  const winnersEnabled = useMemo(() => {
    if (!modulesConfig) return true;
    if (role === "superadmin") return modulesConfig.superadmin?.winners !== false;
    return modulesConfig.admin?.winners !== false;
  }, [modulesConfig, role]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.raffleTitle.trim() || form.raffleTitle.trim().length < 3) return "Indica el nombre de la rifa (mín. 3 caracteres).";
    if (!form.prize.trim() || form.prize.trim().length < 3) return "Indica el premio entregado (mín. 3 caracteres).";
    if (!form.winnerName.trim() || form.winnerName.trim().length < 3) return "Indica el nombre del ganador (mín. 3 caracteres).";
    if (form.photoUrl && !/^https?:\/\//i.test(form.photoUrl)) return "La foto debe ser una URL válida (http/https).";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setMessageVariant(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageVariant("error");
      setSubmitting(false);
      return;
    }

    try {
      await publishWinner({
        raffleTitle: form.raffleTitle,
        prize: form.prize,
        winnerName: form.winnerName,
        drawDate: form.drawDate,
        testimonial: form.testimonial,
        photoUrl: form.photoUrl,
        ticketNumber: form.ticketNumber,
      });
      setMessage("Ganador publicado");
      setMessageVariant("success");
      setForm(emptyForm);
      await loadWinners();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo publicar el ganador");
      setMessageVariant("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!loadingModules && !winnersEnabled) {
    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-md shadow-black/30">
          <p className="text-lg font-semibold">Módulo de ganadores desactivado.</p>
          <p className="mt-2 text-sm text-white/75">Actívalo en configuración para publicar ganadores.</p>
          {modulesError && <p className="mt-2 text-xs text-red-200">{modulesError}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      {message && (
        <div className="fixed right-4 top-4 z-20 flex max-w-md items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm shadow-lg shadow-black/40 backdrop-blur">
          <div
            className={`h-2 w-2 rounded-full ${
              messageVariant === "success" ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          <span className="text-white/90">{message}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Ganadores</h1>
        <p className="text-white/80">Publica y audita ganadores desde web.</p>
        {loadingModules && <span className="text-xs text-white/60">Cargando módulos…</span>}
        {modulesError && <span className="text-xs text-red-200">{modulesError}</span>}
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Publicar ganador</p>
              <h2 className="text-xl font-semibold text-white">Registrar resultado oficial</h2>
            </div>
            {message && (
              <span
                className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                  messageVariant === "success"
                    ? "border-emerald-200/40 bg-emerald-500/15 text-emerald-100"
                    : "border-rose-200/40 bg-rose-500/15 text-rose-100"
                }`}
              >
                {message}
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-white/80">
              <span>Rifa</span>
              <input
                value={form.raffleTitle}
                onChange={(e) => handleChange("raffleTitle", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                placeholder="Nombre de la rifa"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Premio</span>
              <input
                value={form.prize}
                onChange={(e) => handleChange("prize", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                placeholder="Premio entregado"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Ganador</span>
              <input
                value={form.winnerName}
                onChange={(e) => handleChange("winnerName", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                placeholder="Nombre del ganador"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Fecha del sorteo</span>
              <input
                type="date"
                value={form.drawDate}
                onChange={(e) => handleChange("drawDate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
              />
            </label>
            <label className="space-y-1 text-sm text-white/80 md:col-span-2">
              <span>Testimonio (opcional)</span>
              <textarea
                value={form.testimonial}
                onChange={(e) => handleChange("testimonial", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                rows={3}
                placeholder="Mensaje del ganador o comprobante"
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Foto (URL)</span>
              <input
                value={form.photoUrl}
                onChange={(e) => handleChange("photoUrl", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                placeholder="https://..."
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Ticket/Número</span>
              <input
                value={form.ticketNumber}
                onChange={(e) => handleChange("ticketNumber", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#22c55e]"
                placeholder="#12345"
              />
            </label>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#22c55e] px-4 py-2 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Publicando…" : "Publicar ganador"}
            </button>
            {loadingWinners && <span className="text-xs text-white/60">Sincronizando listado…</span>}
            {winnersError && <span className="text-xs text-red-200">{winnersError}</span>}
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Historial</p>
              <h2 className="text-xl font-semibold text-white">Ganadores publicados</h2>
            </div>
            <button
              onClick={loadWinners}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
            >
              Refrescar
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {winners.map((w) => (
              <div
                key={w.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{w.raffleTitle}</p>
                  <p className="text-sm text-white/80">{w.winnerName} · {w.prize}</p>
                  <p className="text-xs text-white/60">{w.drawDate || "Fecha no indicada"}</p>
                  {w.ticketNumber && <p className="text-xs text-white/70">Ticket {w.ticketNumber}</p>}
                  {w.testimonial && <p className="text-xs text-white/70">“{w.testimonial}”</p>}
                </div>
                {w.photoUrl && (
                  <img
                    src={w.photoUrl}
                    alt={w.winnerName}
                    className="h-16 w-16 rounded-lg object-cover shadow-sm shadow-black/30"
                  />
                )}
              </div>
            ))}
            {winners.length === 0 && !loadingWinners && (
              <p className="text-sm text-white/70">No hay ganadores publicados aún.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
