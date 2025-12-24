"use client"

import { useState } from "react"
import { Search, Heart, Share2, ThumbsUp, Sparkles, RefreshCw } from "lucide-react"
import Image from "next/image"

export default function RifasPage() {
  const [activeTab, setActiveTab] = useState("todas")
  const [searchQuery, setSearchQuery] = useState("")

  const rifas = [
    {
      id: "MR-CKS9-T",
      rifero: "Super Admin",
      avatar: "/images/icon.png",
      imagen: "/rifas-premios-iphone.jpg",
      nombre: "Rifas Guajiro",
      precio: 1500,
      likes: 1,
      favoritos: 0,
      progreso: 100,
      bendecidos: ["2345", "6789", "9876", "1267"],
      masNumeros: 1,
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0a1628 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(10, 22, 40, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(251, 146, 60, 0.2)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white">MEGA RIFAS</h1>
          </div>
          <div
            className="h-1 w-24 mx-auto mt-2"
            style={{ background: "linear-gradient(90deg, #a855f7, #ec4899)" }}
          ></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Sorteos Activos Card */}
        <div
          className="mb-6 rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
            backdropFilter: "blur(10px)",
            borderColor: "rgba(168, 85, 247, 0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Sorteos Activos</h2>
            </div>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Tu oportunidad de ganar hoy.</h3>
          <p className="text-gray-400 mb-3">Participa en los sorteos más exclusivos con total seguridad.</p>
          <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <span className="text-sm font-medium">Cómo participar</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar rifas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 border outline-none focus:border-orange-500 transition-all"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(71, 85, 105, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {["todas", "proximas", "menor"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab ? "linear-gradient(135deg, #a855f7, #ec4899)" : "rgba(15, 23, 42, 0.6)",
                color: activeTab === tab ? "white" : "#94a3b8",
                border: `1px solid ${activeTab === tab ? "transparent" : "rgba(71, 85, 105, 0.5)"}`,
                boxShadow: activeTab === tab ? "0 0 20px rgba(168, 85, 247, 0.5)" : "none",
              }}
            >
              {tab === "todas" && "Todas"}
              {tab === "proximas" && "Próximas a cerrar"}
              {tab === "menor" && "Menor precio"}
            </button>
          ))}
        </div>

        {/* Novedades Section */}
        <h2 className="text-xl font-bold text-white mb-4">Novedades</h2>

        {/* Rifas Cards */}
        <div className="space-y-6">
          {rifas.map((rifa) => (
            <div
              key={rifa.id}
              className="rounded-2xl overflow-hidden border"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(71, 85, 105, 0.5)",
              }}
            >
              {/* Rifero Info */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: "#fb923c" }}>
                    <Image
                      src={rifa.avatar || "/placeholder.svg"}
                      alt={rifa.rifero}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{rifa.rifero}</h3>
                    <p className="text-sm text-gray-400">ID: {rifa.id}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <span className="text-gray-400">⋮</span>
                </button>
              </div>

              {/* Rifa Image */}
              <div className="relative aspect-video">
                <Image src={rifa.imagen || "/placeholder.svg"} alt={rifa.nombre} fill className="object-cover" />
              </div>

              {/* Interaction Buttons */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm font-medium">{rifa.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{rifa.favoritos}</span>
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                  }}
                >
                  Jugar
                </button>
              </div>

              {/* Rifa Details */}
              <div className="px-4 pb-4">
                <h4 className="font-bold text-white mb-2">{rifa.nombre}</h4>
                <p className="text-2xl font-bold mb-3" style={{ color: "#fb923c" }}>
                  Bs. {rifa.precio.toLocaleString()}
                </p>

                <p className="text-sm text-yellow-400 font-medium mb-2">Bendecidos:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {rifa.bendecidos.map((num) => (
                    <span
                      key={num}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ background: "rgba(148, 163, 184, 0.2)", color: "#e2e8f0" }}
                    >
                      {num}
                    </span>
                  ))}
                  {rifa.masNumeros > 0 && (
                    <span
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{ background: "rgba(148, 163, 184, 0.2)", color: "#e2e8f0" }}
                    >
                      +{rifa.masNumeros}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(15, 23, 42, 0.8)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${rifa.progreso}%`,
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                    }}
                  ></div>
                </div>
                <p className="text-right text-sm font-bold mt-1" style={{ color: "#10b981" }}>
                  {rifa.progreso}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
