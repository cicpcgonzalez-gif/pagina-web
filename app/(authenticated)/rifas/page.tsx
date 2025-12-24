import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchRaffles } from "@/lib/api"
import { Calendar, Ticket, DollarSign, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import Stories from "@/app/_components/Stories"

type Raffle = {
  id: string
  title: string
  price: number
  ticketsAvailable: number
  ticketsTotal: number
  drawDate: string
  status: string
  imageUrl?: string
  description?: string
}

export default function RifasPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Raffle[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchRaffles()
        if (!mounted) return
        setItems(Array.isArray(data) ? (data as any) : [])
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "No se pudieron cargar las rifas.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Mobile Style */}
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <img src="/images/icon.png" alt="Logo" className="w-8 h-8 rounded-full" />
           <h1 className="text-xl font-bold font-[var(--font-display)] bg-gradient-to-r from-orange-500 to-cyan-500 bg-clip-text text-transparent">MEGA RIFAS</h1>
        </div>
        <div className="flex gap-4">
            <Heart className="w-6 h-6 text-gray-800" />
            <MessageCircle className="w-6 h-6 text-gray-800" />
        </div>
      </header>

      <main className="max-w-md mx-auto md:max-w-2xl">
        {/* Stories Section */}
        <Stories />

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : null}

        {error ? (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
            {error}
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             No hay rifas activas en este momento.
           </div>
        ) : null}

        <div className="space-y-4 pb-4">
        {!loading && !error && items.map((r) => (
          <article key={r.id} className="bg-white border-b border-gray-200 md:border md:rounded-xl md:shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-white p-[1px]">
                            <img src="/images/icon.png" className="w-full h-full rounded-full object-cover" alt="Avatar" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">megarifas_oficial</p>
                        <p className="text-xs text-gray-500">Caracas, Venezuela</p>
                    </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </div>

            {/* Post Image */}
            <Link href={`/rifas/${r.id}`} className="block relative aspect-square bg-gray-100">
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <span className="text-4xl font-bold mb-2">{r.title}</span>
                    <span className="text-2xl font-light text-cyan-400">${Number(r.price).toFixed(2)}</span>
                    <div className="mt-4 px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm">
                        Sorteo: {new Date(r.drawDate).toLocaleDateString()}
                    </div>
                 </div>
            </Link>

            {/* Action Buttons */}
            <div className="p-3">
                <div className="flex justify-between mb-3">
                    <div className="flex gap-4">
                        <Heart className="w-7 h-7 text-gray-800 hover:text-red-500 transition-colors cursor-pointer" />
                        <MessageCircle className="w-7 h-7 text-gray-800 cursor-pointer" />
                        <Send className="w-7 h-7 text-gray-800 cursor-pointer" />
                    </div>
                    <Bookmark className="w-7 h-7 text-gray-800 cursor-pointer" />
                </div>

                {/* Likes/Sales Info */}
                <div className="font-semibold text-sm mb-1">
                    {r.ticketsTotal - r.ticketsAvailable} tickets vendidos
                </div>

                {/* Caption */}
                <div className="text-sm mb-2">
                    <span className="font-semibold mr-2">megarifas_oficial</span>
                    {r.description || `¡Participa en la gran rifa de ${r.title}! No te pierdas la oportunidad de ganar.`}
                </div>

                {/* Comments Link */}
                <div className="text-gray-500 text-sm mb-2 cursor-pointer">
                    Ver los 12 comentarios
                </div>

                {/* Time */}
                <div className="text-gray-400 text-[10px] uppercase">
                    HACE 2 HORAS
                </div>

                {/* CTA Button */}
                <Link href={`/rifas/${r.id}`} className="block mt-3 w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
                    Comprar Ticket - ${Number(r.price).toFixed(2)}
                </Link>
            </div>
          </article>
        ))}
        </div>
      </main>
    </div>
  )
}
