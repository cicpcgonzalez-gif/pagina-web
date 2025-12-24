"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0a1628 100%)",
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
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(251, 146, 60, 0.3)",
          }}
        >
          <form className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-orange-500 transition-all"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderColor: "rgba(71, 85, 105, 0.5)",
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-orange-500 transition-all pr-12"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    borderColor: "rgba(71, 85, 105, 0.5)",
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
                  className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Mantener la cuenta abierta</span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.5)",
              }}
            >
              Entrar
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                href="/recuperar"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
              >
                <span>¿Olvidaste tu contraseña?</span>
              </Link>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t" style={{ borderColor: "rgba(71, 85, 105, 0.3)" }}>
              <Link
                href="/register"
                className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
              >
                <span>¿No tienes cuenta?</span>
                <span className="text-purple-400 font-medium">Crear cuenta nueva</span>
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
