"use client"

import { useState } from "react"
import { Search, Trophy, User } from "lucide-react"
import Link from "next/link"

export default function GanadoresPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - replace with real API data
  const ganadores = [
    // Empty for now to show empty state
  ]

  const filteredGanadores = ganadores.filter(
    (ganador: any) =>
      ganador.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ganador.rifa.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #0a0e1c 0%, #1a1f3a 50%, #0f1429 100%)",
      }}
    >
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          Muro de la Fama <Trophy className="w-8 h-8 text-yellow-400" />
        </h1>
        <p className="text-gray-400 text-sm">Nuestros ganadores reales y felices.</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ganador, premio o rifa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-24">
        {filteredGanadores.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron ganadores.</p>
          </div>
        ) : (
          // Winners List
          <div className="space-y-4">
            {filteredGanadores.map((ganador: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                      boxShadow: "0 0 30px rgba(249, 115, 22, 0.5)",
                    }}
                  >
                    {ganador.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{ganador.name}</h3>
                    <p className="text-gray-400 text-sm">{ganador.rifa}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Premio</p>
                    <p className="text-white font-semibold">{ganador.premio}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Fecha</p>
                    <p className="text-white font-semibold">{ganador.fecha}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Número ganador</p>
                  <p
                    className="text-2xl font-bold text-transparent bg-clip-text"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                    }}
                  >
                    {ganador.numeroGanador}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t px-6 py-4"
        style={{
          background: "rgba(10, 14, 28, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link
            href="/rifas"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="text-xs">Rifas</span>
          </Link>

          <Link
            href="/tickets"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span className="text-xs">Tickets</span>
          </Link>

          <Link
            href="/wallet"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-xs">Wallet</span>
          </Link>

          <Link href="/ganadores" className="flex flex-col items-center gap-1 text-purple-500 transition-colors">
            <Trophy className="w-6 h-6" fill="currentColor" />
            <span className="text-xs">Ganadores</span>
          </Link>

          <Link
            href="/perfil"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </Link>

          <Link
            href="/superadmin"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs">Superadmin</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
