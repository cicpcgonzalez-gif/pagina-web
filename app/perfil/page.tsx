"use client"

import { useState } from "react"
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

      <main className="container mx-auto px-4 py-6 pb-32 max-w-4xl">
        {/* Profile Card */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(251, 146, 60, 0.2)",
            boxShadow: "0 8px 32px rgba(251, 146, 60, 0.15)",
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Image
                src="/images/icon.png"
                alt="Super Admin"
                width={80}
                height={80}
                className="rounded-full ring-4"
                style={{ ringColor: "#fb923c" }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Super Admin</h2>
              <p className="text-slate-400">ID: —</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(251, 146, 60, 0.1)",
              }}
            >
              <div className="text-3xl font-bold" style={{ color: "#fb923c" }}>
                4
              </div>
              <div className="text-sm text-slate-400">Tickets</div>
            </div>
            <div
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(34, 211, 238, 0.1)",
              }}
            >
              <div className="text-3xl font-bold" style={{ color: "#22d3ee" }}>
                0
              </div>
              <div className="text-sm text-slate-400">Referidos</div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">Promociona tus rifas • Más alcance • Más ventas</p>
        </div>

        {/* Role Card */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(251, 146, 60, 0.2)",
            boxShadow: "0 8px 32px rgba(251, 146, 60, 0.15)",
          }}
        >
          <p className="text-center text-slate-300 mb-4">
            Administrador Global del sistema MegaRifas, app y página web
          </p>

          <button
            className="w-full mb-4 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)",
              border: "1px solid rgba(251, 146, 60, 0.3)",
            }}
          >
            <Zap className="w-5 h-5" style={{ color: "#fbbf24" }} />
            <span>Explorador</span>
          </button>

          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="p-3 rounded-xl transition-all hover:scale-110"
              style={{
                background: "rgba(34, 197, 94, 0.2)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <svg className="w-6 h-6" fill="#25D366" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
            <a
              href="#"
              className="p-3 rounded-xl transition-all hover:scale-110"
              style={{
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
              }}
            >
              <svg className="w-6 h-6" fill="#E4405F" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Mis Publicaciones - Expandible */}
        <div
          className="rounded-3xl mb-6 overflow-hidden transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(251, 146, 60, 0.2)",
            boxShadow: "0 8px 32px rgba(251, 146, 60, 0.15)",
            maxHeight: expandPublicaciones ? "600px" : "80px",
          }}
        >
          <button
            onClick={() => setExpandPublicaciones(!expandPublicaciones)}
            className="w-full p-6 flex items-center justify-between"
          >
            <h3 className="text-xl font-bold">Mis publicaciones</h3>
            <ChevronRight
              className="w-6 h-6 transition-transform"
              style={{
                transform: expandPublicaciones ? "rotate(90deg)" : "rotate(0deg)",
                color: "#fb923c",
              }}
            />
          </button>

          {expandPublicaciones && (
            <div className="px-6 pb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab(activeTab === "activos" ? "cerrados" : "activos")}
                  className="px-4 py-2 rounded-xl font-semibold transition-all"
                  style={{
                    background:
                      activeTab === "activos"
                        ? "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)"
                        : "rgba(15, 23, 42, 0.6)",
                  }}
                >
                  Activas: 1
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === "cerrados" ? "activos" : "cerrados")}
                  className="px-4 py-2 rounded-xl font-semibold transition-all"
                  style={{
                    background:
                      activeTab === "cerrados"
                        ? "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)"
                        : "rgba(15, 23, 42, 0.6)",
                  }}
                >
                  Cerradas: 0
                </button>
              </div>

              {activeTab === "activos" && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image src="/images/icon.png" alt="Super Admin" width={40} height={40} className="rounded-full" />
                    <div className="flex-1">
                      <div className="font-bold">Super Admin</div>
                    </div>
                  </div>
                  <Image
                    src="/app/WhatsApp-20Image-202025-12-23-20at-2010.01.14-20-281-29.jpeg"
                    alt="Rifas Guajiro"
                    width={400}
                    height={300}
                    className="rounded-xl w-full mb-3"
                  />
                  <div className="font-bold text-lg mb-1">Rifas Guajiro</div>
                  <div className="text-sm text-slate-400 mb-2">Camioneta</div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: "0.04%",
                        background: "linear-gradient(90deg, #fb923c 0%, #ec4899 100%)",
                      }}
                    />
                  </div>
                  <div className="text-sm text-slate-400 mt-1">9996 tickets restantes</div>
                </div>
              )}

              {activeTab === "cerrados" && (
                <div className="text-center py-8 text-slate-400">No tienes publicaciones cerradas.</div>
              )}
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["personal", "legal", "kyc", "plan"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all capitalize"
              style={{
                background:
                  activeTab === tab ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)" : "rgba(30, 41, 59, 0.6)",
                border: `1px solid ${activeTab === tab ? "rgba(168, 85, 247, 0.5)" : "rgba(251, 146, 60, 0.2)"}`,
              }}
            >
              {tab === "kyc" ? "KYC" : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(251, 146, 60, 0.2)",
            boxShadow: "0 8px 32px rgba(251, 146, 60, 0.15)",
          }}
        >
          {activeTab === "personal" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Información Pública</h2>

              <button
                className="w-full text-center py-3 rounded-xl font-semibold transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  color: "white",
                }}
              >
                Cambiar Logo / Foto
              </button>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Nombre Visible</label>
                <input
                  type="text"
                  defaultValue="Super Admin"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Bio / Descripción</label>
                <textarea
                  rows={4}
                  defaultValue="Administrador Global del sistema MegaRifas, app y página web"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Teléfono Contacto</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">WhatsApp (Solo números)</label>
                <input
                  type="tel"
                  defaultValue="04227930168"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Instagram (@usuario)</label>
                <input
                  type="text"
                  defaultValue="megarifas"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">TikTok (@usuario)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Telegram (@usuario o usuario)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <button
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                }}
              >
                Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Información para recibos y facturación.</h2>
              <h3 className="text-xl font-bold mb-6">Nombre Legal / Razón Social</h3>

              <div>
                <input
                  type="text"
                  placeholder="Ej: Inversiones MegaRifas C.A."
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">RIF / Cédula</h3>
                <input
                  type="text"
                  placeholder="J-12345678-9"
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Dirección Fiscal</h3>
                <textarea
                  rows={3}
                  placeholder="Av. Principal..."
                  className="w-full px-4 py-3 rounded-xl font-medium"
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    color: "white",
                  }}
                />
              </div>

              <button
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                }}
              >
                Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="space-y-6">
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(180, 83, 9, 0.3)",
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245, 158, 11, 0.2)" }}
                >
                  <svg className="w-6 h-6" fill="#f59e0b" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-amber-400">Estado: PENDIENTE</div>
                  <div className="text-sm text-amber-200">Sube tus documentos para activar pagos</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Documento de Identidad (Frente)</h3>
                <button
                  className="w-full rounded-2xl border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-all hover:border-solid"
                  style={{
                    borderColor: "rgba(251, 146, 60, 0.3)",
                    background: "rgba(15, 23, 42, 0.4)",
                  }}
                >
                  <Upload className="w-12 h-12" style={{ color: "#fb923c" }} />
                  <span className="font-semibold">Subir Foto</span>
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Documento de Identidad (Dorso)</h3>
                <button
                  className="w-full rounded-2xl border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-all hover:border-solid"
                  style={{
                    borderColor: "rgba(251, 146, 60, 0.3)",
                    background: "rgba(15, 23, 42, 0.4)",
                  }}
                >
                  <Upload className="w-12 h-12" style={{ color: "#fb923c" }} />
                  <span className="font-semibold">Subir Foto</span>
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Selfie con Cédula</h3>
                <button
                  className="w-full rounded-2xl border-2 border-dashed py-12 flex flex-col items-center gap-3 transition-all hover:border-solid"
                  style={{
                    borderColor: "rgba(251, 146, 60, 0.3)",
                    background: "rgba(15, 23, 42, 0.4)",
                  }}
                >
                  <Camera className="w-12 h-12" style={{ color: "#fb923c" }} />
                  <span className="font-semibold">Tomar Selfie</span>
                </button>
              </div>

              <button
                className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                }}
              >
                <Upload className="w-5 h-5" />
                Enviar verificación
              </button>

              <button
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                }}
              >
                Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === "plan" && (
            <div className="space-y-6">
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                }}
              >
                <div className="text-sm font-semibold mb-2" style={{ color: "#22d3ee" }}>
                  PLAN ACTUAL
                </div>
                <div className="text-4xl font-bold mb-2">GRATUITO</div>
                <div className="text-slate-300">Tienes acceso básico para crear rifas limitadas.</div>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(180, 83, 9, 0.3)",
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8" style={{ color: "#fbbf24" }} />
                  <h3 className="text-xl font-bold" style={{ color: "#fbbf24" }}>
                    BOOST SEMANAL
                  </h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Destaca tu perfil en la página principal por 24 horas. Tienes 1 boost gratis cada semana.
                </p>
                <button
                  className="w-full py-3 rounded-xl font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                    boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                  }}
                >
                  Activar Boost Gratis
                </button>
              </div>

              <h3 className="text-2xl font-bold">Mejorar mi Plan</h3>

              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(251, 146, 60, 0.2)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-bold" style={{ color: "#fbbf24" }}>
                    Plan PRO
                  </h4>
                  <div className="text-2xl font-bold">$29/mes</div>
                </div>
                <p className="text-slate-400 mb-4">Rifas ilimitadas + Menor comisión</p>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(168, 85, 247, 0.2)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-2xl font-bold" style={{ color: "#a855f7" }}>
                    Plan EMPRESA
                  </h4>
                  <div className="text-2xl font-bold">$99/mes</div>
                </div>
                <p className="text-slate-400 mb-4">Marca Blanca + Soporte Prioritario</p>
              </div>

              <button
                className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(168, 85, 247, 0.3)",
                }}
              >
                Guardar Cambios
              </button>
            </div>
          )}
        </div>

        {/* Drawer lateral */}
        <button
          onClick={() => setShowDrawer(true)}
          className="fixed top-20 right-0 p-3 rounded-l-xl"
          style={{
            background: "linear-gradient(135deg, #fb923c 0%, #ec4899 100%)",
            boxShadow: "-4px 4px 16px rgba(251, 146, 60, 0.3)",
          }}
        >
          <ChevronRight className="w-5 h-5" style={{ transform: "rotate(180deg)" }} />
        </button>

        {showDrawer && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowDrawer(false)} />
            <div
              className="fixed right-0 top-0 h-full w-80 z-50 p-6"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(20px)",
                boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
              }}
            >
              <button onClick={() => setShowDrawer(false)} className="absolute top-4 right-4 p-2">
                <X className="w-6 h-6" style={{ color: "#fb923c" }} />
              </button>

              <div className="flex items-center gap-3 mb-6 pt-8">
                <Image src="/images/icon.png" alt="Super Admin" width={50} height={50} className="rounded-full" />
                <div>
                  <div className="font-bold">Super Admin</div>
                  <div className="text-sm text-slate-400">rifa@megarifasapp.com</div>
                </div>
              </div>

              <div
                className="rounded-2xl p-4 mb-4"
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(251, 146, 60, 0.2)",
                }}
              >
                <div className="flex items-center gap-3 text-slate-300">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34, 211, 238, 0.2)" }}
                  >
                    <RefreshCw className="w-6 h-6" style={{ color: "#22d3ee" }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Transacciones / Movimientos</div>
                    <div className="text-sm text-slate-400">Ver tus últimos movimientos</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: "#fb923c" }} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t"
        style={{
          background: "rgba(10, 14, 28, 0.95)",
          borderColor: "rgba(251, 146, 60, 0.2)",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="flex justify-around items-center h-20 px-4 max-w-screen-lg mx-auto">
          <Link href="/rifas" className="flex flex-col items-center gap-1 transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-xs text-slate-400">Rifas</span>
          </Link>

          <Link href="/tickets" className="flex flex-col items-center gap-1 transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span className="text-xs text-slate-400">Tickets</span>
          </Link>

          <Link href="/wallet" className="flex flex-col items-center gap-1 transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-xs text-slate-400">Wallet</span>
          </Link>

          <Link href="/ganadores" className="flex flex-col items-center gap-1 transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <span className="text-xs text-slate-400">Ganadores</span>
          </Link>

          <Link href="/perfil" className="flex flex-col items-center gap-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="#a855f7" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs font-semibold" style={{ color: "#a855f7" }}>
              Perfil
            </span>
          </Link>

          <Link href="/superadmin" className="flex flex-col items-center gap-1 transition-all hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs text-slate-400">Superadmin</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
