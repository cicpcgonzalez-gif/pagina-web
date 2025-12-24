"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/lib/api"
import { setUserRole } from "@/lib/session"

export default function RegisterPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [variant, setVariant] = useState<"ok" | "error">("ok")

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await register({
        name: fullName || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email,
        password,
      })

      const role = (res as any)?.user?.role ? String((res as any).user.role) : null
      if (role) setUserRole(role)

      setVariant("ok")
      setMessage("Registro exitoso. Bienvenido.")

      const normalizedRole = String(role || "").toLowerCase()
      if (normalizedRole === "superadmin") router.push("/superadmin")
      else if (normalizedRole === "admin" || normalizedRole === "organizer") router.push("/admin")
      else router.push("/rifas")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo registrar."
      setVariant("error")
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0a1628 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image
              src="/images/icon.png"
              alt="MEGA RIFAS"
              width={120}
              height={120}
              className="rounded-full"
              style={{
                filter: "drop-shadow(0 0 30px rgba(251, 146, 60, 0.6))",
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MEGA RIFAS</h1>
          <p className="text-gray-400">Crea tu cuenta para empezar a jugar</p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(34, 211, 238, 0.25)",
          }}
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-cyan-400 transition-all"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    borderColor: "rgba(71, 85, 105, 0.5)",
                  }}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-cyan-400 transition-all"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    borderColor: "rgba(71, 85, 105, 0.5)",
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-cyan-400 transition-all"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderColor: "rgba(71, 85, 105, 0.5)",
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-cyan-400 transition-all"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderColor: "rgba(71, 85, 105, 0.5)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #fb923c, #22d3ee)",
                boxShadow: "0 0 30px rgba(34, 211, 238, 0.35)",
              }}
            >
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>

            {message ? (
              <div
                className="rounded-xl px-4 py-3 text-sm border"
                style={
                  variant === "ok"
                    ? {
                        background: "rgba(34, 211, 238, 0.10)",
                        borderColor: "rgba(34, 211, 238, 0.35)",
                      }
                    : {
                        background: "rgba(239, 68, 68, 0.12)",
                        borderColor: "rgba(239, 68, 68, 0.35)",
                      }
                }
              >
                {message}
              </div>
            ) : null}

            <div className="text-center pt-4 border-t" style={{ borderColor: "rgba(71, 85, 105, 0.3)" }}>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <span>¿Ya tienes cuenta?</span>
                <span className="text-cyan-300 font-medium">Iniciar sesión</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
