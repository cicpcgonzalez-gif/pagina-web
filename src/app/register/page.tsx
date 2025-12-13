"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { register, requestPasswordRecovery } from "@/lib/api";
import { setAuthToken, setUserRole } from "@/lib/session";

const VENEZUELA_STATES = [
  "Amazonas",
  "Anzoategui",
  "Apure",
  "Aragua",
  "Barinas",
  "Bolivar",
  "Carabobo",
  "Cojedes",
  "Delta Amacuro",
  "Distrito Capital",
  "Falcon",
  "Guarico",
  "Lara",
  "Merida",
  "Miranda",
  "Monagas",
  "Nueva Esparta",
  "Portuguesa",
  "Sucre",
  "Tachira",
  "Trujillo",
  "Vargas",
  "Yaracuy",
  "Zulia",
];

export default function RegisterPage() {
  const [legalOpen, setLegalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");
  const [state, setStateValue] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"ok" | "error">("ok");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recoveryVariant, setRecoveryVariant] = useState<"ok" | "error">("ok");

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);
  const legalSections = useMemo(
    () => [
      {
        title: "Términos y Condiciones",
        content:
          "1. Aceptación: al usar MegaRifas aceptas estos términos. 2. Elegibilidad: solo mayores de 18 años. 3. Rol: MegaRifas es herramienta tecnológica; los organizadores son responsables legales y de premios. 4. Reglas: cada rifa detalla fecha, premios y tickets con firma criptográfica; mantener datos actualizados es responsabilidad del usuario. 5. Pagos: procesados por pasarelas seguras; no hay devoluciones salvo cancelación. 6. Propiedad intelectual: contenido y marcas pertenecen a MegaRifas o licenciantes. 7. Modificaciones: podemos actualizar términos y aplican al publicarse.",
      },
      {
        title: "Responsabilidad de los Organizadores",
        content:
          "1. Legalidad y permisos dependen del organizador. 2. Fondos y premios los gestiona el organizador; MegaRifas no custodia ni entrega premios. 3. Reclamos deben dirigirse al organizador; MegaRifas solo aporta información técnica si procede.",
      },
      {
        title: "Política de Privacidad",
        content:
          "1. Datos: nombre, correo, teléfono, pago e IP se usan para operar y proteger el servicio. 2. Uso: procesar compras, verificar identidad (KYC), notificar resultados, prevenir fraude. 3. Protección: cifrado y SSL/TLS; sin compartir con terceros salvo pagos o ley. 4. Derechos ARCO: acceder, rectificar, cancelar u oponerse vía soporte. 5. Retención: mientras la cuenta esté activa o por obligaciones legales.",
      },
      {
        title: "Marco Legal y Consumidor",
        content:
          "Operamos conforme a leyes de protección al consumidor y juegos de azar. Transparencia con firmas verificables; atención al cliente para dudas y reclamos; promovemos juego responsable. Legislación aplicable: República Bolivariana de Venezuela; disputas en tribunales competentes.",
      },
    ],
    [],
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!firstName || !lastName || !email || !password || !state) {
      setVariant("error");
      setMessage("Completa los campos obligatorios.");
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setVariant("error");
      setMessage("Debes aceptar Términos y Condiciones.");
      setLoading(false);
      return;
    }

    try {
      const res = await register({
        name: fullName,
        firstName,
        lastName,
        email,
        phone,
        cedula,
        state,
        address,
        dob,
        password,
      });

      const token = res?.token ?? res?.accessToken;
      if (token) {
        setAuthToken(token);
        const role = res.user?.role || "sin-rol";
        setUserRole(role);
        setVariant("ok");
        setMessage("Registro exitoso. Sesión iniciada.");
      } else {
        setVariant("ok");
        setMessage("Registro exitoso. Verifica tu correo si es requerido.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo registrar.";
      setVariant("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecoveryMessage(null);
    if (!recoveryEmail) {
      setRecoveryVariant("error");
      setRecoveryMessage("Ingresa tu correo registrado.");
      return;
    }
    try {
      await requestPasswordRecovery({ email: recoveryEmail });
      setRecoveryVariant("ok");
      setRecoveryMessage("Enviamos instrucciones seguras a tu correo.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo enviar la recuperación.";
      setRecoveryVariant("error");
      setRecoveryMessage(msg);
    }
  };

  return (
    <main className="min-h-screen bg-night-sky text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Registro</p>
          <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">
            Abre tu acceso web con tus mismos datos.
          </h1>
          <p className="text-base text-white/80">
            Pedimos los mismos campos que ya usas: nombre y apellido, correo, teléfono, estado de Venezuela, cédula, dirección y fecha de nacimiento. Así mantenemos tu perfil sincronizado con la app.
          </p>
          <p className="text-sm text-white/75">
            Acepta Términos y Condiciones para continuar. Si todo va bien te dejamos adentro al instante; si falta validar tu correo, te mostraremos el aviso para completar ese paso.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Nombre</label>
                <input
                  id="firstName"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Apellido</label>
                <input
                  id="lastName"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Teléfono</label>
                <input
                  id="phone"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                  placeholder="0412-0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Cédula</label>
                <input
                  id="cedula"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                  placeholder="V-00000000"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Estado (Venezuela)</label>
                <select
                  id="state"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white outline-none focus:border-[#22d3ee]"
                  value={state}
                  onChange={(e) => setStateValue(e.target.value)}
                >
                  <option value="" className="bg-[#0c1a3a] text-white/70">
                    Selecciona tu estado
                  </option>
                  {VENEZUELA_STATES.map((item) => (
                    <option key={item} value={item} className="bg-[#0c1a3a] text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">Fecha de nacimiento</label>
                <input
                  id="dob"
                  type="date"
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Dirección</label>
              <input
                id="address"
                className="w-full rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none focus:border-[#22d3ee]"
                placeholder="Ciudad, calle, referencia"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">Contraseña</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1a3a]/60 px-4 py-3">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="text-xs text-white/70 underline"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`flex items-start gap-3 text-left text-sm ${termsAccepted ? "text-white" : "text-white/70"}`}
              onClick={() => setTermsAccepted((v) => !v)}
            >
              <span className="mt-1 flex h-4 w-4 items-center justify-center rounded border border-white/30 bg-white/5">
                {termsAccepted ? "✓" : ""}
              </span>
              <span>
                He leído y acepto los Términos y Condiciones, la Política de Privacidad y confirmo que MegaRifas es una herramienta de gestión.
              </span>
            </button>

            <button
              type="button"
              className="text-xs text-[#22d3ee] underline"
              onClick={() => setLegalOpen(true)}
            >
              Ver Términos, Privacidad y marco legal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/40 transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${
                variant === "ok"
                  ? "border-white/10 bg-white/10 text-white"
                  : "border-red-400/40 bg-red-500/10 text-red-100"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2 text-sm text-white/80">
              <span className="font-semibold text-white">¿Recuperar cuenta?</span>
              <button
                type="button"
                onClick={() => setRecoveryOpen((v) => !v)}
                className="text-xs text-[#22d3ee] underline"
              >
                {recoveryOpen ? "Cerrar" : "Abrir"}
              </button>
            </div>
            {recoveryOpen && (
              <form className="mt-3 space-y-2" onSubmit={handleRecovery}>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-[#0c1a3a]/60 px-3 py-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#22d3ee]"
                  placeholder="Correo registrado"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Enviar instrucciones
                </button>
                {recoveryMessage && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      recoveryVariant === "ok"
                        ? "border-white/10 bg-white/10 text-white"
                        : "border-red-400/40 bg-red-500/10 text-red-100"
                    }`}
                  >
                    {recoveryMessage}
                  </div>
                )}
              </form>
            )}
          </div>

          <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <p className="font-semibold text-white">¿Por qué pedimos estos datos?</p>
            <p>Los estados de Venezuela permiten segmentar rifas y premios; la aceptación de términos es obligatoria por cumplimiento.</p>
            <p>Si tu backend usa verificación por código o 2FA, agrega el flujo de confirmación tras registrarte.</p>
          </div>
        </div>
      </div>

      <Dialog.Root open={legalOpen} onOpenChange={setLegalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-[#0c1a3a] p-6 shadow-2xl shadow-black/50 focus:outline-none">
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-[var(--font-display)] text-2xl text-white">Términos y Privacidad</Dialog.Title>
              <Dialog.Close className="text-white/70 transition hover:text-white">✕</Dialog.Close>
            </div>
            <div className="mt-4 flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-2 text-sm text-white/80">
              {legalSections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-base font-semibold text-white">{section.title}</h3>
                  <p className="mt-2 leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
              <p className="text-xs text-white/60">Versión 1.0.0 - 2025</p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
