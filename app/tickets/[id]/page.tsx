"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronRight } from "lucide-react"

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Datos de ejemplo
  const ticketDetail = {
    id: "FA08EF12",
    rifa: "Rifas Guajiro",
    vendedor: {
      nombre: "Super Admin",
      id: "MR-CKS9-T",
      avatar: "/images/icon.png",
    },
    tickets: [
      { numero: 1, valor: "0516" },
      { numero: 2, valor: "6687" },
      { numero: 3, valor: "9484" },
      { numero: 4, valor: "4319" },
    ],
  }

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
          <div className="flex items-center gap-4">
            <Link href="/tickets" className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">Detalle de Rifa</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Título */}
          <h2 className="text-3xl font-bold text-white text-center mb-8">{ticketDetail.rifa}</h2>

          {/* Card Rifero */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(26, 31, 58, 0.6)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Rifero</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={ticketDetail.vendedor.avatar || "/placeholder.svg"}
                  alt={ticketDetail.vendedor.nombre}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="font-bold text-white">{ticketDetail.vendedor.nombre}</p>
                  <p className="text-sm text-gray-400">ID: {ticketDetail.vendedor.id}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Card Tickets comprados */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(26, 31, 58, 0.6)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Tickets comprados</h3>
            <div className="space-y-4">
              {ticketDetail.tickets.map((ticket) => (
                <div
                  key={ticket.numero}
                  className="flex items-center justify-between py-3 px-4 rounded-lg"
                  style={{
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                  }}
                >
                  <span className="text-gray-400">#{ticket.numero.toString().padStart(2, "0")}</span>
                  <span className="text-xl font-bold text-white">{ticket.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
