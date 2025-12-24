"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Heart, Share2, ThumbsUp, Search, Sparkles, RefreshCw } from "lucide-react"

export default function RifasPage() {
  const [activeFilter, setActiveFilter] = useState<"todas" | "proximas" | "menor">("todas")
  const [searchQuery, setSearchQuery] = useState("")
  const [likedRaffles, setLikedRaffles] = useState<Set<string>>(new Set())
  const [favoriteRaffles, setFavoriteRaffles] = useState<Set<string>>(new Set())

  // Mock data - Replace with actual API call
  const mockRaffles = [
    {
      id: "MR-CKS9-T",
      rifero: {
        name: "Super Admin",
        avatar: "/images/icon.png",
        id: "MR-CKS9-T",
      },
      title: "Rifas Guajiro",
      banner: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      price: 1500,
      currency: "Bs.",
      progress: 100,
      likes: 1,
      favorites: 0,
      luckyNumbers: ["2345", "6789", "9876", "1267"],
      moreNumbers: 1,
    },
    // Add more mock raffles here
  ]

  const toggleLike = (id: string) => {
    setLikedRaffles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleFavorite = (id: string) => {
    setFavoriteRaffles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <main className="min-h-screen bg-[#0a0e1c] text-white pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b border-white/10 px-4 py-4"
        style={{
          background: "rgba(10, 14, 28, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center">MEGA RIFAS</h1>
          <div className="h-1 w-32 mx-auto mt-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sorteos Activos Card */}
        <div
          className="rounded-3xl border border-purple-500/30 p-6"
          style={{
            background: "rgba(139, 92, 246, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-white">Sorteos Activos</span>
            </div>
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <RefreshCw className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-2">Tu oportunidad de ganar hoy.</h2>
          <p className="text-white/70 mb-4">Participa en los sorteos más exclusivos con total seguridad.</p>

          <button className="flex items-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition">
            <span className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center text-xs">
              i
            </span>
            Cómo participar
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Buscar rifas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-white/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { id: "todas", label: "Todas" },
            { id: "proximas", label: "Próximas a cerrar" },
            { id: "menor", label: "Menor precio" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`rounded-full px-6 py-2.5 font-semibold whitespace-nowrap transition ${
                activeFilter === filter.id
                  ? "bg-purple-600 text-white"
                  : "border border-white/20 bg-white/5 text-white/70"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Novedades Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Novedades</h2>

          <div className="space-y-6">
            {mockRaffles.map((raffle) => (
              <article
                key={raffle.id}
                className="rounded-3xl border border-white/10 overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Rifero Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50">
                      <Image
                        src={raffle.rifero.avatar || "/placeholder.svg"}
                        alt={raffle.rifero.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{raffle.rifero.name}</p>
                      <p className="text-sm text-white/60">ID: {raffle.rifero.id}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full transition">
                    <div className="flex flex-col gap-1">
                      <div className="w-1 h-1 rounded-full bg-white/70" />
                      <div className="w-1 h-1 rounded-full bg-white/70" />
                      <div className="w-1 h-1 rounded-full bg-white/70" />
                    </div>
                  </button>
                </div>

                {/* Banner Image */}
                <div className="relative aspect-[16/10] w-full">
                  <Image src={raffle.banner || "/placeholder.svg"} alt={raffle.title} fill className="object-cover" />
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-6 px-4 py-3 border-b border-white/10">
                  <button
                    onClick={() => toggleLike(raffle.id)}
                    className="flex items-center gap-2 hover:scale-110 transition"
                  >
                    <ThumbsUp
                      className={`w-6 h-6 ${likedRaffles.has(raffle.id) ? "fill-blue-500 text-blue-500" : "text-white/70"}`}
                    />
                    <span className="text-sm text-white/70">
                      {raffle.likes + (likedRaffles.has(raffle.id) ? 1 : 0)}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(raffle.id)}
                    className="flex items-center gap-2 hover:scale-110 transition"
                  >
                    <Heart
                      className={`w-6 h-6 ${favoriteRaffles.has(raffle.id) ? "fill-red-500 text-red-500" : "text-white/70"}`}
                    />
                    <span className="text-sm text-white/70">
                      {raffle.favorites + (favoriteRaffles.has(raffle.id) ? 1 : 0)}
                    </span>
                  </button>

                  <button className="hover:scale-110 transition">
                    <Share2 className="w-6 h-6 text-white/70" />
                  </button>

                  <button className="ml-auto rounded-full bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-2.5 font-bold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition">
                    Jugar
                  </button>
                </div>

                {/* Raffle Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{raffle.title}</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">
                        {raffle.currency} {raffle.price}
                      </p>
                    </div>
                  </div>

                  {/* Lucky Numbers */}
                  <div>
                    <p className="text-sm text-yellow-400 font-semibold mb-2">Bendecidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {raffle.luckyNumbers.map((num) => (
                        <span
                          key={num}
                          className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white"
                        >
                          {num}
                        </span>
                      ))}
                      {raffle.moreNumbers > 0 && (
                        <span className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/70">
                          +{raffle.moreNumbers}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">Progreso</span>
                      <span className="text-xs font-semibold text-green-400">{raffle.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${raffle.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t border-white/10 px-4 py-3"
        style={{
          background: "rgba(10, 14, 28, 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-around">
          {[
            { icon: "🎟️", label: "Rifas", href: "/rifas", active: true },
            { icon: "🎫", label: "Tickets", href: "/verificar", active: false },
            { icon: "💰", label: "Wallet", href: "/wallet", active: false },
            { icon: "🏆", label: "Ganadores", href: "/ganadores", active: false },
            { icon: "👤", label: "Perfil", href: "/perfil", active: false },
            { icon: "⚙️", label: "Admin", href: "/admin", active: false },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition ${
                item.active ? "text-purple-400" : "text-white/50 hover:text-white/80"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  )
}
