"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { setUserRole } from "@/lib/session"

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await login({ email, password })
      const role = (res as any)?.user?.role ? String((res as any).user.role) : null
      if (role) setUserRole(role)

      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null
      if (next) {
        router.push(next)
        return
      }

      router.push("/rifas")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "No se pudo iniciar sesión."
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0b0b1e 0%, #1a0f2e 50%, #0b0b1e 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}
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
          <p className="text-gray-400">Seguridad en cada clic, emoción en cada premio</p>
        </div>

        {/* Login Form */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: "linear-gradient(145deg, rgba(36, 20, 60, 0.92), rgba(24, 16, 44, 0.92))",
            backdropFilter: "blur(18px)",
            borderColor: "rgba(250, 204, 21, 0.35)",
            boxShadow: "0 20px 50px rgba(107, 33, 168, 0.35)",
          }}
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-100 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-200/60 border outline-none focus:border-purple-500 transition-all"
                style={{
                  background: "rgba(17, 12, 32, 0.7)",
                  borderColor: "rgba(107, 33, 168, 0.5)",
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-100 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-200/60 border outline-none focus:border-purple-500 transition-all pr-12"
                  style={{
                    background: "rgba(17, 12, 32, 0.7)",
                    borderColor: "rgba(107, 33, 168, 0.5)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-purple-600 text-purple-500 focus:ring-purple-400 bg-slate-900/60"
                />
                <span className="text-sm text-purple-100">Mantener sesión</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-slate-900 transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #facc15, #eab308)",
                boxShadow: "0 0 30px rgba(250, 204, 21, 0.45)",
              }}
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>

            {message ? (
              <div
                className="rounded-xl px-4 py-3 text-sm border"
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  borderColor: "rgba(239, 68, 68, 0.35)",
                }}
              >
                {message}
              </div>
            ) : null}

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                href="/recuperar"
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors inline-flex items-center gap-2"
              >
                <span>¿Olvidaste tu contraseña?</span>
              </Link>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t" style={{ borderColor: "rgba(107, 33, 168, 0.35)" }}>
              <Link
                href="/register"
                className="text-sm text-purple-200 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <span>¿No tienes cuenta?</span>
                <span className="text-amber-300 font-semibold">Crear cuenta nueva</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Buena suerte.</p>
          <p className="text-gray-600 text-xs mt-1">v0.1.0 (2)</p>
        </div>
      </div>
    </div>
  )
}
