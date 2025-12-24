"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, RefreshCw, Upload, Camera, Zap, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<"personal" | "legal" | "kyc" | "plan">("personal")
  const [showPublicaciones, setShowPublicaciones] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [expandPublicaciones, setExpandPublicaciones] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b"
        style={{ borderColor: "rgba(251, 146, 60, 0.2)" }}
      >
        <div className="flex items-center justify-center gap-3 px-4 py-4">
          <Image src="/images/icon.png" alt="MEGA RIFAS" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl font-bold">Mi perfil</h1>
        </div>
      </header>

      {/* Side Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowDrawer(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-80 bg-slate-900 border-r border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDrawer(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 mb-6 mt-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="font-bold">Super Admin</h3>
                <p className="text-sm text-gray-400">rifa@megarifasapp.com</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <Link
                href="/wallet"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Transacciones / Movimientos</h4>
                    <p className="text-sm text-gray-400">Ver tus últimos movimientos</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6">
          {/* Avatar and Stats */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/icon.png"
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Super Admin</h2>
              <p className="text-gray-400 text-sm mb-3">ID: —</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-2xl p-3 border border-white/5">
                  <div className="text-3xl font-bold">4</div>
                  <div className="text-sm text-gray-400">Tickets</div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-3 border border-white/5">
                  <div className="text-3xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Referidos</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm">Promociona tus rifas • Más alcance • Más ventas</p>
        </div>

        {/* Admin Badge Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6 text-center">
          <p className="text-gray-300 mb-4">Administrador Global del sistema MegaRifas, app y página web</p>

          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">🎯 Explorador</Badge>

          <div className="flex justify-center gap-4">
            <a
              href="https://wa.me/584227930168"
              target="_blank"
              className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all"
              rel="noreferrer"
            >
              <span className="text-2xl">📱</span>
            </a>
            <a
              href="https://instagram.com/megarifas"
              target="_blank"
              className="w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center hover:bg-pink-500/30 transition-all"
              rel="noreferrer"
            >
              <span className="text-2xl">📷</span>
            </a>
          </div>
        </div>

        {/* Mis Publicaciones Toggle */}
        <button onClick={() => setShowPublicaciones(!showPublicaciones)} className="w-full text-left mb-6">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Mis publicaciones</h3>
              <ChevronRight className={`w-5 h-5 transition-transform ${showPublicaciones ? "rotate-90" : ""}`} />
            </div>
            <p className="text-gray-400 text-sm">Activas: 1</p>
          </div>
        </button>

        {showPublicaciones && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6">
            {/* Active Publication */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Image src="/images/icon.png" alt="Avatar" width={40} height={40} className="rounded-full" />
                <span className="font-semibold">Super Admin</span>
              </div>

              <Image
                src="/images/whatsapp-20image-202025-12-23-20at-2010.jpeg"
                alt="Rifa promocional"
                width={500}
                height={400}
                className="w-full rounded-2xl mb-4"
              />

              <h4 className="text-xl font-bold mb-2">Rifas Guajiro</h4>
              <p className="text-gray-400 mb-3">Camioneta</p>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 w-1/4" />
              </div>
              <p className="text-sm text-gray-400 text-right">9996 tickets restantes</p>
            </div>

            {/* Closed Section */}
            <div>
              <h4 className="font-bold mb-2">Cerradas: 0</h4>
              <p className="text-gray-400 text-sm">No tienes publicaciones cerradas.</p>
            </div>

            <Button
              className="w-full mt-6 text-white py-6 rounded-2xl text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
              }}
            >
              ✏️ Editar Perfil
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "personal", label: "Personal" },
            { id: "legal", label: "Legal" },
            { id: "kyc", label: "KYC" },
            { id: "plan", label: "Plan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id ? "" : "bg-slate-800/50 text-gray-400 hover:bg-slate-800"
              }`}
              style={
                activeTab === tab.id
                  ? {
                      background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(251, 146, 60, 0.5)",
                    }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Personal Tab */}
        {activeTab === "personal" && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-2">Información Pública</h3>
            <button className="text-purple-400 mb-6 font-semibold">Cambiar Logo / Foto</button>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Nombre Visible</label>
                <Input
                  defaultValue="Super Admin"
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Bio / Descripción</label>
                <Textarea
                  defaultValue="Administrador Global del sistema MegaRifas, app y página web"
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl min-h-24"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Teléfono Contacto</label>
                <Input className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6" />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">WhatsApp (Solo números)</label>
                <Input
                  defaultValue="04227930168"
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Instagram (@usuario)</label>
                <Input
                  defaultValue="megarifas"
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">TikTok (@usuario)</label>
                <Input className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6" />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Telegram (@usuario o usuario)</label>
                <Input className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6" />
              </div>
            </div>

            <Button
              className="w-full mt-6 text-white py-6 rounded-2xl text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        )}

        {/* Legal Tab */}
        {activeTab === "legal" && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            <p className="text-gray-400 text-sm mb-2">Información para recibos y facturación.</p>
            <h3 className="text-xl font-bold mb-6">Nombre Legal / Razón Social</h3>

            <div className="space-y-4">
              <Input
                placeholder="Ej: Inversiones MegaRifas C.A."
                className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
              />

              <div>
                <label className="text-white font-semibold mb-2 block">RIF / Cédula</label>
                <Input
                  placeholder="J-12345678-9"
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
                />
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">Dirección Fiscal</label>
                <Input
                  placeholder="Av. Principal..."
                  className="bg-slate-800/50 border-white/10 text-white rounded-2xl py-6"
                />
              </div>
            </div>

            <Button
              className="w-full mt-6 text-white py-6 rounded-2xl text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
              }}
            >
              Guardar Cambios
            </Button>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
            {/* Status Alert */}
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                ⏰
              </div>
              <div>
                <h4 className="font-bold mb-1">Estado: PENDIENTE</h4>
                <p className="text-sm text-gray-300">Sube tus documentos para activar pagos.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* ID Front */}
              <div>
                <h4 className="font-bold mb-3">Documento de Identidad (Frente)</h4>
                <button className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-300">Subir Foto</span>
                </button>
              </div>

              {/* ID Back */}
              <div>
                <h4 className="font-bold mb-3">Documento de Identidad (Dorso)</h4>
                <button className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-300">Subir Foto</span>
                </button>
              </div>

              {/* Selfie */}
              <div>
                <h4 className="font-bold mb-3">Selfie con Cédula</h4>
                <button className="w-full border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center gap-3">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-300">Tomar Selfie</span>
                </button>
              </div>
            </div>

            <Button
              className="w-full mt-6 text-white py-6 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
              }}
            >
              <Upload className="w-5 h-5" />
              Enviar verificación
            </Button>

            <Button
              variant="outline"
              className="w-full mt-3 border-white/10 text-white py-6 rounded-2xl text-lg font-semibold hover:bg-white/5 bg-transparent"
            >
              Guardar Cambios
            </Button>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === "plan" && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-6 text-center">
              <p className="text-cyan-400 text-sm font-semibold mb-2">PLAN ACTUAL</p>
              <h2 className="text-4xl font-bold mb-3">GRATUITO</h2>
              <p className="text-gray-300">Tienes acceso básico para crear rifas limitadas.</p>
            </div>

            {/* Weekly Boost */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-xl rounded-3xl border border-yellow-500/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-yellow-400">BOOST SEMANAL</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Destaca tu perfil en la página principal por 24 horas. Tienes 1 boost gratis cada semana.
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-2xl text-lg font-semibold"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                  boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
                }}
              >
                Activar Boost Gratis
              </Button>
            </div>

            {/* Upgrade Plans */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-xl font-bold mb-6">Mejorar mi Plan</h3>

              <div className="space-y-4">
                {/* PRO Plan */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-yellow-400 mb-1">Plan PRO</h4>
                    <p className="text-gray-400 text-sm">Rifas ilimitadas + Menor comisión</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$29</div>
                    <div className="text-gray-400 text-sm">/mes</div>
                  </div>
                </div>

                {/* EMPRESA Plan */}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-purple-400 mb-1">Plan EMPRESA</h4>
                    <p className="text-gray-400 text-sm">Marca Blanca + Soporte Prioritario</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$99</div>
                    <div className="text-gray-400 text-sm">/mes</div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 text-white py-6 rounded-2xl text-lg font-semibold"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                  boxShadow: "0 8px 24px rgba(251, 146, 60, 0.4)",
                }}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          {[
            { icon: "🏷️", label: "Rifas", href: "/rifas" },
            { icon: "✨", label: "Tickets", href: "/tickets" },
            { icon: "💳", label: "Wallet", href: "/wallet" },
            { icon: "🏆", label: "Ganadores", href: "/ganadores" },
            { icon: "👤", label: "Perfil", href: "/perfil", active: true },
            { icon: "🛡️", label: "Superadmin", href: "/superadmin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 min-w-0 ${
                item.active ? "text-purple-400" : "text-gray-400"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
