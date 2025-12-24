"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, Bitcoin, CreditCard, Plus, Smartphone, Wallet } from "lucide-react";
import { adminActivateRaffle, adminCreateRaffle } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  onCreated?: () => void;
};

const LOTTERIES = [
  "Super Gana (Lotería del Táchira)",
  "Triple Táchira",
  "Triple Zulia",
  "Triple Caracas",
  "Triple Caliente",
  "Triple Zamorano",
  "La Ricachona",
  "La Ruca",
  "El Terminalito / La Granjita",
];

const THEME_SWATCHES = ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#db2777"];

const PAYMENT_METHODS: Array<{ key: string; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { key: "mobile_payment", label: "Pago Móvil", Icon: Smartphone },
  { key: "wallet", label: "Wallet", Icon: Wallet },
  { key: "transfer", label: "Transferencia", Icon: CreditCard },
  { key: "zelle", label: "Zelle", Icon: Banknote },
  { key: "binance", label: "Binance", Icon: Bitcoin },
];

async function fileToJpegDataUrl(file: File, opts?: { maxSide?: number; quality?: number }) {
  const maxSide = opts?.maxSide ?? 1200;
  const quality = opts?.quality ?? 0.78;

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen."));
      el.src = objectUrl;
    });

    const w0 = img.naturalWidth || img.width;
    const h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) throw new Error("No se pudo leer el tamaño de la imagen.");

    const scale = Math.min(1, maxSide / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen (canvas).");
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (!/^data:image\/jpeg;base64,/.test(dataUrl)) {
      throw new Error("No se pudo generar la imagen comprimida.");
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function parseInstantWins(raw: string): number[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number.parseInt(x, 10))
    .filter((n) => Number.isFinite(n) && !Number.isNaN(n));
}

export function CreateRaffleModal({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState<string>("");
  const [totalTickets, setTotalTickets] = useState<string>("");
  const [digits, setDigits] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
  const [lottery, setLottery] = useState<string>("");
  const [terms, setTerms] = useState<string>("");
  const [minTickets, setMinTickets] = useState<string>("1");
  const [instantWins, setInstantWins] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["mobile_payment"]);

  const [themeColor, setThemeColor] = useState<string>("#2563eb");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  const hasAnyImage = useMemo(() => {
    return Boolean((bannerImage || "").trim()) || (Array.isArray(gallery) && gallery.some((x) => String(x || "").trim()));
  }, [bannerImage, gallery]);

  const togglePayment = (method: string) => {
    setPaymentMethods((prev) => {
      const has = prev.includes(method);
      const next = has ? prev.filter((m) => m !== method) : [...prev, method];
      return next.length ? next : prev;
    });
  };

  const validate = (mode: "draft" | "publish") => {
    const t = title.trim();
    const d = description.trim();
    if (!t) return "Falta el título.";
    if (!d) return "Falta la descripción/premio.";
    if (!ticketPrice.trim()) return "Falta el precio del ticket.";
    if (!lottery.trim()) return "Falta seleccionar la lotería.";
    if (mode === "publish" && !hasAnyImage) return "Debes subir al menos 1 imagen antes de publicar.";
    return null;
  };

  const submit = async (mode: "draft" | "publish") => {
    const err = validate(mode);
    if (err) {
      setMessage(err);
      return;
    }

    setBusy(true);
    setMessage(mode === "publish" ? "Publicando rifa..." : "Guardando borrador...");

    try {
      const priceNum = Number(ticketPrice);
      const totalTicketsNum = totalTickets.trim() ? Number(totalTickets) : undefined;
      const minTicketsNum = minTickets.trim() ? Number(minTickets) : 1;
      const instantWinsArray = parseInstantWins(instantWins);

      const style = {
        bannerImage: (bannerImage || "").trim() || undefined,
        gallery: (gallery || []).filter(Boolean),
        themeColor: (themeColor || "").trim() || undefined,
        whatsapp: (whatsapp || "").trim() || undefined,
        instagram: (instagram || "").trim() || undefined,
        paymentMethods,
      };

      const result = await adminCreateRaffle({
        title: title.trim(),
        description: description.trim(),
        ticketPrice: Number.isFinite(priceNum) ? priceNum : 0,
        totalTickets: totalTicketsNum && Number.isFinite(totalTicketsNum) ? totalTicketsNum : undefined,
        lottery: lottery.trim(),
        terms: terms.trim() ? terms.trim() : null,
        digits,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        securityCode: securityCode.trim() || undefined,
        instantWins: instantWinsArray.length ? instantWinsArray : undefined,
        minTickets: Number.isFinite(minTicketsNum) ? Math.max(1, minTicketsNum) : 1,
        paymentMethods,
        style,
      });

      const raffleId = (result as any)?.raffle?.id ?? (result as any)?.id;
      const createdTitle = (result as any)?.raffle?.title ?? (result as any)?.title ?? title.trim();

      if (mode === "publish") {
        if (!raffleId) throw new Error("No se pudo determinar el ID de la rifa creada para activarla.");
        await adminActivateRaffle(raffleId);
        setMessage(`Rifa "${createdTitle}" publicada (activa).`);
      } else {
        setMessage(`Rifa "${createdTitle}" creada como borrador.`);
      }

      onCreated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido.";
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear rifa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden p-0 bg-slate-950 text-white border border-slate-800">
        <div className="flex max-h-[92vh] flex-col">
          <div className="shrink-0 border-b border-slate-800 bg-slate-950/90 px-6 pb-4 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15" />
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg font-extrabold tracking-tight text-white">Crear rifa</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-300">
                Completa los datos y luego guarda como borrador o publica.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form
              id="create-raffle-form"
              onSubmit={(e) => {
                e.preventDefault();
                submit("publish");
              }}
              className="grid gap-4"
            >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-semibold">
                Título
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: Camioneta 4x4"
                disabled={busy}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="lottery" className="text-sm font-semibold">
                Lotería
              </label>
              <select
                id="lottery"
                value={lottery}
                onChange={(e) => setLottery(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                disabled={busy}
                required
              >
                <option value="" disabled>
                  Seleccionar Lotería
                </option>
                {LOTTERIES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-semibold">
              Descripción / Premio
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
              placeholder="Describe el premio y condiciones clave."
              disabled={busy}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="ticketPrice" className="text-sm font-semibold">
                Precio del ticket
              </label>
              <input
                id="ticketPrice"
                type="number"
                inputMode="decimal"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: 10"
                disabled={busy}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="totalTickets" className="text-sm font-semibold">
                Total de tickets
              </label>
              <input
                id="totalTickets"
                type="number"
                inputMode="numeric"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: 5000"
                disabled={busy}
              />
              <p className="text-xs text-slate-400">Máximo permitido por el backend: 10000.</p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="digits" className="text-sm font-semibold">
                Dígitos
              </label>
              <select
                id="digits"
                value={digits}
                onChange={(e) => setDigits(Number(e.target.value))}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                disabled={busy}
              >
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
          </div>

          <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-sm font-extrabold text-amber-300">Métodos de Pago Aceptados</p>
            <p className="mt-1 text-xs text-slate-300">Selecciona qué métodos de pago estarán disponibles para esta rifa.</p>

            <div className="mt-3 grid gap-2">
              {PAYMENT_METHODS.map(({ key, label, Icon }) => {
                const enabled = paymentMethods.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePayment(key)}
                    disabled={busy}
                    className={
                      "w-full rounded-xl border px-4 py-3 text-left transition flex items-center justify-between gap-3 " +
                      (enabled
                        ? "border-emerald-400/40 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/55")
                    }
                  >
                    <span className="inline-flex items-center gap-3 min-w-0">
                      <span
                        className={
                          "grid h-10 w-10 place-items-center rounded-xl border " +
                          (enabled ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-slate-800 bg-white/5 text-slate-300")
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className={"text-sm font-bold truncate " + (enabled ? "text-white" : "text-slate-200")}>{label}</span>
                    </span>
                    <span
                      className={
                        "h-5 w-5 rounded-full border-2 grid place-items-center " +
                        (enabled ? "border-emerald-400" : "border-slate-500")
                      }
                    >
                      {enabled ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-semibold">
                Fecha inicio (opcional)
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                disabled={busy}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="endDate" className="text-sm font-semibold">
                Fecha cierre (opcional)
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                disabled={busy}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="securityCode" className="text-sm font-semibold">
                Código de seguridad (opcional)
              </label>
              <input
                id="securityCode"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: 1234"
                disabled={busy}
              />
              <p className="text-xs text-slate-400">Se guarda en el estilo de la rifa.</p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="minTickets" className="text-sm font-semibold">
                Mínimo de tickets (opcional)
              </label>
              <input
                id="minTickets"
                type="number"
                inputMode="numeric"
                value={minTickets}
                onChange={(e) => setMinTickets(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                disabled={busy}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="instantWins" className="text-sm font-semibold">
                Premios instantáneos (opcional)
              </label>
              <input
                id="instantWins"
                value={instantWins}
                onChange={(e) => setInstantWins(e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: 10, 50, 100"
                disabled={busy}
              />
              <p className="text-xs text-slate-400">Separados por coma. Se envían como números.</p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Métodos de pago</label>
              <div className="flex flex-wrap gap-3 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.includes("mobile_payment")}
                    onChange={() => togglePayment("mobile_payment")}
                    disabled={busy}
                  />
                  Pago móvil
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.includes("wallet")}
                    onChange={() => togglePayment("wallet")}
                    disabled={busy}
                  />
                  Wallet
                </label>
              </div>
              <p className="text-xs text-slate-400">Se guarda también en el estilo de la rifa.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="terms" className="text-sm font-semibold">
              Términos (opcional)
            </label>
            <textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="min-h-20 w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
              placeholder="Términos y condiciones de la rifa."
              disabled={busy}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="banner" className="text-sm font-semibold">
                Imagen principal (banner)
              </label>
              <input
                id="banner"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setMessage("Procesando imagen...");
                    const url = await fileToJpegDataUrl(f);
                    setBannerImage(url);
                    setMessage("");
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : "No se pudo procesar la imagen.");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full text-sm"
                disabled={busy}
              />
              {bannerImage ? <p className="text-xs text-slate-400">Banner listo.</p> : <p className="text-xs text-slate-400">Se guarda como dataURL (como la app).</p>}
            </div>

            <div className="grid gap-2">
              <label htmlFor="gallery" className="text-sm font-semibold">
                Galería (múltiples)
              </label>
              <input
                id="gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const list = Array.from(e.target.files || []);
                  if (!list.length) return;
                  try {
                    setMessage("Procesando imágenes...");
                    const urls: string[] = [];
                    for (const f of list.slice(0, 6)) {
                      urls.push(await fileToJpegDataUrl(f));
                    }
                    setGallery((prev) => [...prev, ...urls]);
                    setMessage("");
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : "No se pudieron procesar las imágenes.");
                  } finally {
                    e.target.value = "";
                  }
                }}
                className="w-full text-sm"
                disabled={busy}
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{gallery.length ? `${gallery.length} imagen(es) cargada(s).` : "Sin imágenes"}</span>
                {gallery.length ? (
                  <button type="button" className="underline underline-offset-4" onClick={() => setGallery([])} disabled={busy}>
                    Limpiar
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="themeColor" className="text-sm font-semibold">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="themeColor"
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  disabled={busy}
                  className="h-10 w-12 rounded-md border border-slate-800 bg-transparent"
                />
                <div className="flex items-center gap-2">
                  {THEME_SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThemeColor(c)}
                      disabled={busy}
                      className={
                        "h-9 w-9 rounded-full border-2 transition " +
                        (themeColor === c ? "border-white" : "border-transparent")
                      }
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                disabled={busy}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="whatsapp" className="text-sm font-semibold">
                WhatsApp (opcional)
              </label>
              <input
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={busy}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="Ej: +58..."
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="instagram" className="text-sm font-semibold">
                Instagram (opcional)
              </label>
              <input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                disabled={busy}
                className="w-full rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60"
                placeholder="@usuario"
              />
            </div>
          </div>

            </form>
          </div>

          <div className="shrink-0 border-t border-slate-800 bg-slate-950/90 px-6 py-4">
            {message ? (
              <p className="text-sm text-center text-slate-200 mb-3">
                {message}
                {String(message || "").includes("413") ? (
                  <span className="block text-xs text-slate-400 mt-1">Si ves “413 / entity too large”, usa imágenes más ligeras.</span>
                ) : null}
              </p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => submit("draft")} disabled={busy}>
                Guardar borrador
              </Button>
              <Button type="submit" form="create-raffle-form" disabled={busy}>
                {busy ? "Procesando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
