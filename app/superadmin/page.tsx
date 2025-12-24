"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Newspaper,
  Users,
  Wrench,
  Phone,
  Mail,
  FileText,
  Palette,
  Layers,
  MailOpen,
  Flag,
  TrendingUp,
  QrCode,
  User,
  Headphones,
  Bell,
  Shield,
  Package,
  Edit,
  BarChart3,
  DollarSign,
  HelpCircle,
  Tag,
  Sparkles,
  Ticket,
} from "lucide-react"

export default function SuperAdminPage() {
  const [activeMenu, setActiveMenu] = useState<"principal" | "sistema">("principal")

  const principalModules = [
    { icon: User, label: "Perfil", color: "from-purple-500 to-pink-500", href: "/perfil" },
    { icon: Headphones, label: "Mi Soporte", color: "from-pink-500 to-red-500", href: "#" },
    { icon: Bell, label: "Notificaciones", color: "from-pink-400 to-rose-400", href: "#" },
    { icon: Shield, label: "Cód. Seguridad", color: "from-emerald-400 to-cyan-400", href: "#" },
    { icon: Package, label: "Sorteo en Vivo", color: "from-orange-400 to-pink-400", href: "#" },
    { icon: Edit, label: "Gestión de Rifas", color: "from-purple-400 to-indigo-400", href: "#" },
    { icon: BarChart3, label: "Dashboard", color: "from-emerald-500 to-green-500", href: "#" },
    { icon: DollarSign, label: "Validar Pagos", color: "from-green-400 to-emerald-400", href: "#" },
    { icon: TrendingUp, label: "Movimientos", color: "from-cyan-400 to-blue-400", href: "#" },
    { icon: QrCode, label: "Verificador", color: "from-orange-500 to-amber-500", href: "#" },
    { icon: Newspaper, label: "Novedades", color: "from-blue-500 to-indigo-500", href: "#" },
    { icon: Users, label: "Usuarios", color: "from-cyan-400 to-blue-400", href: "#" },
  ]

  const sistemaModules = [
    { icon: TrendingUp, label: "Movimientos", color: "from-cyan-400 to-blue-400", href: "#" },
    { icon: QrCode, label: "Verificador", color: "from-orange-500 to-amber-500", href: "#" },
    { icon: Newspaper, label: "Novedades", color: "from-blue-500 to-indigo-500", href: "#" },
    { icon: Users, label: "Usuarios", color: "from-cyan-400 to-blue-400", href: "#" },
    { icon: Wrench, label: "Administrar Rifas", color: "from-pink-500 to-rose-500", href: "#" },
    { icon: Phone, label: "Soporte Técnico", color: "from-cyan-400 to-sky-400", href: "#" },
    { icon: Mail, label: "Correo SMTP", color: "from-amber-500 to-yellow-500", href: "#" },
    { icon: FileText, label: "Auditoría", color: "from-yellow-500 to-orange-500", href: "#" },
    { icon: Palette, label: "Branding", color: "from-purple-500 to-violet-500", href: "#" },
    { icon: Layers, label: "Módulos", color: "from-emerald-400 to-cyan-400", href: "#" },
    { icon: MailOpen, label: "Logs de Correo", color: "from-pink-500 to-rose-500", href: "#" },
    { icon: Flag, label: "Denuncias y reportes", color: "from-pink-400 to-red-400", href: "#" },
  ]

  const activeModules = activeMenu === "principal" ? principalModules : sistemaModules

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fb923c] via-[#ec4899] to-[#22d3ee] opacity-50 blur-xl rounded-full" />
                  <Sparkles className="relative w-8 h-8 text-[#fb923c]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-[#fb923c] via-[#ec4899] to-[#22d3ee] bg-clip-text text-transparent">
                    MEGA RIFAS
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold">SuperAdmin Panel</p>
                </div>
              </div>
            </div>
            <button className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10 hover:bg-slate-700/50 transition-all">
              <HelpCircle className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Toggle */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex gap-3 bg-slate-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 max-w-md mx-auto">
          <button
            onClick={() => setActiveMenu("principal")}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeMenu === "principal"
                ? "bg-gradient-to-r from-[#fb923c] to-[#ec4899] text-white shadow-lg shadow-orange-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Menú Principal
          </button>
          <button
            onClick={() => setActiveMenu("sistema")}
            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
              activeMenu === "sistema"
                ? "bg-gradient-to-r from-[#22d3ee] to-[#ec4899] text-white shadow-lg shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sistema
          </button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {activeModules.map((module, index) => {
            const Icon = module.icon
            return (
              <Link
                key={index}
                href={module.href}
                className="group relative bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105 hover:shadow-2xl"
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-xl`}
                />

                <div className="relative flex flex-col items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white font-bold text-center text-sm leading-tight">{module.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link
              href="/rifas"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Tag className="w-6 h-6" />
              <span className="text-xs font-medium">Rifas</span>
            </Link>
            <Link
              href="/tickets"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Ticket className="w-6 h-6" />
              <span className="text-xs font-medium">Tickets</span>
            </Link>
            <Link
              href="/wallet"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <DollarSign className="w-6 h-6" />
              <span className="text-xs font-medium">Wallet</span>
            </Link>
            <Link
              href="/ganadores"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs font-medium">Ganadores</span>
            </Link>
            <Link
              href="/perfil"
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Perfil</span>
            </Link>
            <Link href="/superadmin" className="flex flex-col items-center gap-1 text-[#ec4899] relative">
              <div className="absolute -top-1 inset-x-0 h-1 bg-gradient-to-r from-[#fb923c] via-[#ec4899] to-[#22d3ee] rounded-full" />
              <Shield className="w-6 h-6" />
              <span className="text-xs font-medium">Superadmin</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
