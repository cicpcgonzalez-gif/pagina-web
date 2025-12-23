"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  login,
  register,
  requestPasswordRecovery,
  resendVerification,
  verifyEmailCode,
  verifyTwoFactor,
} from "@/lib/api";
import { setAuthToken, setUserRole } from "@/lib/session";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

async function getCaptchaToken(action: string) {
  if (!RECAPTCHA_SITE_KEY) return null;
  // Cargar script solo cuando se necesite
  if (!(window as any).grecaptcha) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar reCAPTCHA"));
      document.head.appendChild(script);
    });
  }
  return new Promise<string | null>((resolve) => {
    (window as any).grecaptcha.ready(() => {
      (window as any).grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => resolve(token))
        .catch(() => resolve(null));
    });
  });
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "recovery" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [remember, setRemember] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [twofaNeeded, setTwofaNeeded] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaEmail, setTwofaEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const resetMessages = () => {
    setMessage(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    setLoading(true);
    resetMessages();
    try {
      const captchaToken = await getCaptchaToken("login");
      const result = await login({ email, password, captchaToken: captchaToken || undefined });
      if ((result as any)?.require2FA) {
        setTwofaNeeded(true);
        setTwofaEmail(email);
        setMessage("Ingresa el código de seguridad enviado a tu correo.");
        return;
      }
      const token = (result as any).token || (result as any).accessToken;
      if (token) {
        setAuthToken(token);
        const role = (result as any).user?.role || "sin-rol";
        setUserRole(role);
        router.push("/rifas");
        return;
      }
      setMessage("Inicio de sesión sin token en la respuesta.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "No se pudo iniciar sesión. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwofa = async () => {
    if (!twofaEmail || !twofaCode) {
      setMessage("Ingresa el código de 6 dígitos.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      const result = await verifyTwoFactor({ email: twofaEmail, code: twofaCode });
      const token = (result as any).token || (result as any).accessToken;
      if (token) {
        setAuthToken(token);
        const role = (result as any).user?.role || "sin-rol";
        setUserRole(role);
        router.push("/rifas");
      } else {
        setMessage("Código verificado pero falta token.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!termsAccepted) {
      setMessage("Debes aceptar términos y condiciones.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      const captchaToken = await getCaptchaToken("register");
      const payload = { email, password, firstName, lastName, phone, cedula, state, address, dob, captchaToken: captchaToken || undefined };
      const result = await register(payload);
      setVerifyEmail(email);
      setSuccess("Registro exitoso. Verifica tu correo.");
      setMode("verify");
      if ((result as any)?.require2FA) {
        setTwofaEmail(email);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verifyEmail || !verifyCode) {
      setMessage("Ingresa email y código.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await verifyEmailCode({ email: verifyEmail, code: verifyCode });
      setSuccess("Cuenta verificada. Ahora puedes iniciar sesión.");
      setMode("login");
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verifyEmail) {
      setMessage("Ingresa tu email para reenviar código.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await resendVerification({ email: verifyEmail });
      setSuccess("Código reenviado.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "No se pudo reenviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!recoveryEmail) {
      setMessage("Ingresa tu correo.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      await requestPasswordRecovery({ email: recoveryEmail });
      setSuccess("Enviamos un enlace seguro a tu correo.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "No se pudo enviar la recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const headerLabel = useMemo(() => {
    if (twofaNeeded) return "Verificación 2FA";
    if (mode === "verify") return "Verificación de correo";
    if (mode === "recovery") return "Recuperar acceso";
    if (mode === "register") return "Crear cuenta";
    return "Iniciar sesión";
  }, [mode, twofaNeeded]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1224] via-[#0f172a] to-[#0f172a] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-10 lg:flex-row lg:items-center lg:gap-12">
        <section className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Acceso seguro
          </div>
          <h1 className="font-[var(--font-display)] text-4xl leading-tight sm:text-5xl">Ingresa a MegaRifas web.</h1>
          <p className="max-w-2xl text-white/75">
            Usa tus mismas credenciales de la app móvil para entrar al mural de rifas, panel admin y tu perfil.
          </p>
          <div className="grid gap-2 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Soporte a 2FA y verificación.
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Sesión se mantiene mientras tengas token válido.
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
              <div className="space-y-1">
                <span className="font-semibold text-white">{headerLabel}</span>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Portal + Login</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/rifas"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  Ver portal
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-[#22d3ee]/20 transition hover:-translate-y-[1px]"
                >
                  Registrarse
                </Link>
              </div>
            </div>

            {!twofaNeeded && mode === "login" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Correo</label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                    <span>Contraseña</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Mostrar
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-white/70">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 text-left text-sm ${remember ? "text-white" : "text-white/70"}`}
                    onClick={() => setRemember((v) => !v)}
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-white/30 bg-white/5">{remember ? "✓" : ""}</span>
                    Mantener la cuenta abierta
                  </button>
                  <Link href="/register" className="text-[#93c5fd] hover:text-white underline">
                    Recuperar / Registrarse
                  </Link>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleLogin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" /> {loading ? "Verificando..." : "Entrar"}
                </button>
              </div>
            )}

            {twofaNeeded && (
              <div className="space-y-4">
                <p className="text-sm text-white/80">Ingresa el código enviado a {twofaEmail || email}.</p>
                <input
                  type="text"
                  placeholder="000000"
                  value={twofaCode}
                  onChange={(e) => setTwofaCode(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-center text-lg text-white tracking-[0.3em] outline-none focus:border-[#22d3ee]"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleTwofa}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
                >
                  <ShieldCheck className="h-4 w-4" /> {loading ? "Validando..." : "Verificar código"}
                </button>
                <button
                  type="button"
                  className="text-xs text-white/60 underline"
                  onClick={() => {
                    setTwofaNeeded(false);
                    setTwofaCode("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {!twofaNeeded && mode === "register" && (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Nombre</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Apellido</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Apellido"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    placeholder="Contraseña"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Teléfono</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Teléfono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Cédula</label>
                    <input
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="V-00000000"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Estado</label>
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                      placeholder="Estado (VE)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-[0.2em] text-white/60">Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.2em] text-white/60">Dirección</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                    placeholder="Dirección de habitación"
                  />
                </div>

                <button
                  type="button"
                  className={`flex items-start gap-2 text-left text-sm ${termsAccepted ? "text-white" : "text-white/70"}`}
                  onClick={() => setTermsAccepted((v) => !v)}
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded border border-white/30 bg-white/5">{termsAccepted ? "✓" : ""}</span>
                  <span>
                    Acepto Términos, Privacidad y que MegaRifas es una herramienta de gestión.
                  </span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRegister}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" /> {loading ? "Creando perfil..." : "Registrarme"}
                </button>
              </div>
            )}

            {!twofaNeeded && mode === "recovery" && (
              <div className="space-y-3">
                <p className="text-sm text-white/80">Enviaremos un enlace seguro a tu correo.</p>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  placeholder="Correo registrado"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRecovery}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" /> {loading ? "Enviando..." : "Enviar instrucciones"}
                </button>
                <button
                  type="button"
                  className="text-xs text-white/60 underline"
                  onClick={() => {
                    setMode("login");
                    resetMessages();
                  }}
                >
                  Volver a iniciar sesión
                </button>
              </div>
            )}

            {!twofaNeeded && mode === "verify" && (
              <div className="space-y-3">
                <p className="text-sm text-white/80">Confirma tu correo con el código de 6 dígitos.</p>
                <input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  placeholder="Correo"
                />
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-night-sky px-3 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#22d3ee]"
                  placeholder="Código de 6 dígitos"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleVerifyEmail}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#22d3ee]/30 disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" /> {loading ? "Verificando..." : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleResend}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" /> Reenviar código
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-white/60 underline"
                  onClick={() => {
                    setMode("login");
                    resetMessages();
                  }}
                >
                  Volver a iniciar sesión
                </button>
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {message}
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                {success}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
