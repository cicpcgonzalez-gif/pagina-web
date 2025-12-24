"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Download, X, Ticket, Trophy, WalletIcon, User, Shield } from "lucide-react"

export default function TicketsPage() {
  const [showCerrados, setShowCerrados] = useState(false)
  const [activeTab, setActiveTab] = useState<"activos" | "cerrados">("activos")

  // Datos de ejemplo
  const ticketsActivos = [
    {
      id: "FA08EF12",
      rifa: "Rifas Guajiro",
      vendedor: "Super Admin",
      vendedorId: "MR-CKS9-T",
      fecha: "23/12/2025 18:51",
      numeros: ["0516", "6687", "9484", "4319"],
      cantidad: 4,
      metodoPago: "Zelle",
      precioUnitario: 1500.0,
      total: 6000.0,
      estado: "ACTIVA",
      mensaje: "Tu número tiene energía positiva.",
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1629 100%)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(10, 14, 39, 0.8)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(251, 146, 60, 0.2)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/rifas" className="hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Mis Tickets</h1>
            </div>
            <button
              onClick={() => setShowCerrados(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "rgba(168, 85, 247, 0.2)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                color: "#a855f7",
              }}
            >
              Cerrados
            </button>
          </div>
          <p className="text-gray-400 mt-2">Aquí ves tus compras y rifas.</p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {ticketsActivos.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl p-6 shadow-xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,250,0.95) 100%)",
                boxShadow: "0 8px 32px rgba(251, 146, 60, 0.3)",
              }}
            >
              {/* Header del ticket */}
              <div className="text-center mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image src="/images/icon.png" alt="MEGA RIFAS" width={32} height={32} className="rounded-full" />
                  <h2 className="text-2xl font-bold text-gray-900">MEGARIFAS</h2>
                </div>
                <p className="text-sm text-gray-500">{ticket.fecha}</p>
              </div>

              {/* Nombre de la rifa */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{ticket.rifa}</h3>
                <span
                  className="px-4 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#16a34a",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                  }}
                >
                  {ticket.estado}
                </span>
              </div>

              {/* Vendedor */}
              <p className="text-sm text-gray-600 mb-6">
                Vendedor: <span className="font-semibold">{ticket.vendedor}</span> ({ticket.vendedorId})
              </p>

              {/* Números */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">NÚMEROS</h4>
                <div className="flex flex-wrap gap-3">
                  {ticket.numeros.map((num, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-3 rounded-xl text-lg font-bold"
                      style={{
                        background: "rgba(168, 85, 247, 0.1)",
                        color: "#7c3aed",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalles de pago */}
              <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cantidad</span>
                  <span className="font-bold text-gray-900">{ticket.cantidad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Método de pago</span>
                  <span className="font-bold text-gray-900">{ticket.metodoPago}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Precio unitario</span>
                  <span className="font-bold text-gray-900">{ticket.precioUnitario.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2">
                  <span className="font-bold text-gray-900">TOTAL</span>
                  <span className="font-bold text-gray-900">{ticket.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Serial */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">SERIAL</p>
                <p className="text-lg font-bold text-gray-900">{ticket.id}</p>
                <p className="text-xs text-gray-500 mt-2">Conserva este comprobante. No requiere QR.</p>
              </div>

              {/* Mensaje motivador */}
              <p className="text-center text-gray-700 font-medium mb-4">{ticket.mensaje}</p>

              {/* Botón ver detalles */}
              <Link
                href={`/tickets/${ticket.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(168, 85, 247, 0.4)",
                }}
              >
                Ver detalles →
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Tickets Cerrados */}
      {showCerrados && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowCerrados(false)}
        >
          <div
            className="w-full max-w-2xl rounded-t-3xl p-6"
            style={{
              background: "linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Tickets cerrados</h3>
              <button
                onClick={() => setShowCerrados(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">Respaldo guardado en este teléfono</p>

            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "rgba(168, 85, 247, 0.2)",
                  border: "2px solid rgba(168, 85, 247, 0.4)",
                }}
              >
                <Download className="w-10 h-10 text-purple-400" />
              </div>
              <p className="text-gray-400 text-center">No hay tickets cerrados guardados aún.</p>
            </div>

            <button
              className="w-full py-3 rounded-xl font-bold transition-all mt-4"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
              }}
            >
              Borrar todo
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t"
        style={{
          background: "rgba(10, 14, 39, 0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(251, 146, 60, 0.2)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link href="/rifas" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <Ticket className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Rifas</span>
            </Link>
            <Link href="/tickets" className="flex flex-col items-center gap-1">
              <Ticket className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400 font-bold">Tickets</span>
            </Link>
            <Link href="/wallet" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <WalletIcon className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Wallet</span>
            </Link>
            <Link href="/ganadores" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <Trophy className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Ganadores</span>
            </Link>
            <Link href="/perfil" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <User className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Perfil</span>
            </Link>
            <Link href="/superadmin" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
              <Shield className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Superadmin</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
