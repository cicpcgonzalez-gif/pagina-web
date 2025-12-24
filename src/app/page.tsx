import Link from "next/link"
import { fetchRaffles } from "@/lib/api"
import { ProfileLinkButton } from "@/components/ProfileLinkButton"
import { HomeLoginCard } from "@/components/HomeLoginCard"
import { Zap, Shield, TrendingUp, Award, Sparkles, ArrowRight, Trophy, Star, Rocket, Target } from "lucide-react"

const banners = [
  {
    title: "Publicidad destacada",
    copy: "Lanza tu campaña y vende boletos en minutos.",
    badge: "Destacado",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80",
  },
]

const rifers = [
  { name: "Rifero Elite", handle: "@rifero.elite", color: "#3b82f6" },
  { name: "Megarifas Team", handle: "@megarifas.oficial", color: "#ff6b00" },
  { name: "Sorteos Plus", handle: "@sorteos.plus", color: "#06b6d4" },
]

const winners = [
  { name: "Mariana R.", prize: "iPhone 16 Pro", raffler: "@rifero.elite" },
  { name: "Carlos D.", prize: "Viaje Cancún", raffler: "@megarifas.oficial" },
  { name: "Lucía M.", prize: "Moto 150cc", raffler: "@sorteos.plus" },
]

export default async function Home() {
  const raffles = await fetchRaffles()
  const activeRaffles = raffles.filter((r) => r.status === "activa")

  return (
    <main className="relative min-h-screen bg-cyber-gradient">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-20 pt-12 sm:pt-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full glass-cyber border-neon-blue px-5 py-2.5 text-sm font-semibold text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6b00] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6b00]"></span>
              </span>
              La Nueva Era de las Rifas
            </div>

            <h1 className="font-[var(--font-display)] text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              MEGA <span className="neon-orange">RIFAS</span>
            </h1>

            <p className="font-[var(--font-display)] text-2xl font-semibold neon-blue sm:text-3xl text-balance">
              Tus jugadas ahora serán perfectas y seguras
            </p>

            <p className="max-w-2xl text-lg leading-relaxed text-white/80">
              Todas las rifas de tu preferencia en un solo lugar, a tan solo un clic. Conectamos riferos con compradores
              en la plataforma más innovadora de Venezuela.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                className="flex items-center gap-2 rounded-xl bg-neon-orange-gradient px-7 py-4 text-base font-bold text-white shadow-2xl transition hover-lift glow-neon-orange"
                href="/rifas"
              >
                <Rocket className="h-5 w-5" />
                Explorar Rifas
              </Link>
              <Link
                className="flex items-center gap-2 rounded-xl glass-cyber border-neon-blue px-7 py-4 text-base font-semibold text-white transition hover-lift hover:bg-white/5"
                href="/register"
              >
                Unirme Ahora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Zap, label: "Rifas activas", value: activeRaffles.length || "12", color: "#3b82f6" },
                { icon: TrendingUp, label: "Boletos vendidos", value: "4,320", color: "#ff6b00" },
                { icon: Award, label: "Ganadores", value: "1,105", color: "#06b6d4" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group relative overflow-hidden rounded-2xl glass-cyber border-neon-blue p-6 transition hover-lift"
                >
                  <div className="absolute right-2 top-2 opacity-10">
                    <item.icon className="h-16 w-16 text-white" />
                  </div>
                  <div className="relative">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">{item.label}</p>
                    <p className="mt-2 font-[var(--font-display)] text-3xl font-bold" style={{ color: item.color }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-20 top-0 h-48 w-48 animate-float-slow rounded-full bg-[#ff6b00]/15 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-48 w-48 animate-float-slow rounded-full bg-[#3b82f6]/20 blur-3xl" />

            <div className="relative space-y-4 rounded-3xl glass-cyber border-neon-blue p-6 shadow-2xl">
              <HomeLoginCard />

              {banners.map((banner) => (
                <div key={banner.title} className="overflow-hidden rounded-2xl glass-cyber-light border-neon-orange">
                  <div
                    className="h-32 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(59,130,246,0.6), rgba(255,107,0,0.5)), url(${banner.image})`,
                    }}
                  />
                  <div className="space-y-2 p-4">
                    <span className="inline-block rounded-full bg-[#ff6b00]/25 px-3 py-1 text-xs font-bold neon-orange">
                      {banner.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white">{banner.title}</h3>
                    <p className="text-sm text-white/70">{banner.copy}</p>
                  </div>
                </div>
              ))}

              <div className="grid gap-3 rounded-2xl glass-cyber-light border-neon-blue p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Ventas hoy</span>
                  <span className="font-bold neon-cyan">+$2,840</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tickets validados</span>
                  <span className="font-bold text-white">+58</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Nuevos usuarios</span>
                  <span className="font-bold neon-blue">+24</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl glass-cyber border-neon-blue p-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "100% Seguro",
              desc: "Tecnología de punta para proteger cada transacción",
            },
            {
              icon: Rocket,
              title: "Ultra Rápido",
              desc: "Tus tickets en segundos, sin esperas",
            },
            {
              icon: Target,
              title: "Preciso",
              desc: "Sistema verificado, sorteos transparentes",
            },
            {
              icon: Star,
              title: "Innovador",
              desc: "La plataforma más moderna del mercado",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl glass-cyber-light border-neon-blue p-6 transition hover-lift"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-orange-gradient glow-neon-orange">
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-[var(--font-display)] text-lg font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{card.desc}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider neon-orange">Rifas Activas</p>
              <h2 className="font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">Participa y Gana</h2>
            </div>
            <Link
              className="flex items-center gap-2 text-sm font-semibold neon-blue hover:text-[#3b82f6]/80"
              href="/rifas"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRaffles.slice(0, 6).map((raffle, idx) => {
              const sold = raffle.ticketsTotal - raffle.ticketsAvailable
              const progress = raffle.ticketsTotal
                ? Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)))
                : 0
              const rifero = rifers[idx % rifers.length]

              return (
                <article
                  key={raffle.id}
                  className="group flex flex-col gap-4 rounded-2xl glass-cyber border-neon-blue p-5 transition hover-lift"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white shadow-lg animate-pulse-neon"
                      style={{
                        background: rifero.color,
                        boxShadow: `0 0 20px ${rifero.color}80`,
                      }}
                    >
                      {rifero.name.charAt(0)}
                    </div>
                    <div className="flex-1 leading-tight">
                      <p className="font-semibold text-white">{rifero.name}</p>
                      <p className="text-xs text-white/60">{rifero.handle}</p>
                    </div>
                    <span className="rounded-full bg-[#06b6d4]/25 px-3 py-1 text-xs font-bold neon-cyan">
                      {raffle.status}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 rounded-xl glass-cyber-light border-neon-blue p-4">
                    <h3 className="font-[var(--font-display)] text-lg font-bold text-white">{raffle.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-[var(--font-display)] text-2xl font-bold neon-orange">
                        ${raffle.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-white/60">por boleto</span>
                    </div>
                    <p className="text-xs text-white/60">Sorteo: {raffle.drawDate}</p>

                    <div>
                      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="progress-neon h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Vendidos {sold}</span>
                        <span className="font-semibold text-white">{raffle.ticketsAvailable} disponibles</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/rifas"
                      className="flex-1 rounded-xl bg-neon-orange-gradient py-3 text-center font-bold text-white shadow-lg transition hover-lift animate-glow-pulse"
                    >
                      Comprar
                    </Link>
                    <ProfileLinkButton className="rounded-xl glass-cyber-light border-neon-blue px-4 py-3 text-white transition hover:bg-white/5">
                      Ver Perfil
                    </ProfileLinkButton>
                  </div>
                </article>
              )
            })}
            {activeRaffles.length === 0 && (
              <p className="col-span-full text-center text-white/60">No hay rifas activas en este momento.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl glass-cyber border-neon-blue p-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider neon-orange">Ganadores Recientes</p>
              <h2 className="font-[var(--font-display)] text-3xl font-bold text-white">Historias de Éxito</h2>
            </div>
            <Link className="text-sm font-semibold neon-blue hover:text-[#3b82f6]/80" href="/estado">
              Ver todos
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {winners.map((winner) => (
              <div
                key={winner.name}
                className="group relative overflow-hidden rounded-2xl glass-cyber-light border-neon-blue p-6 transition hover-lift"
              >
                <div className="absolute right-2 top-2">
                  <Trophy className="h-8 w-8 text-[#ff6b00]/20" />
                </div>
                <div className="relative">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff6b00]/25 glow-neon-orange">
                    <Trophy className="h-7 w-7 neon-orange" />
                  </div>
                  <p className="font-[var(--font-display)] text-lg font-bold text-white">{winner.name}</p>
                  <p className="mt-1 text-sm font-semibold neon-orange">{winner.prize}</p>
                  <p className="mt-2 text-xs text-white/60">Rifero: {winner.raffler}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl glass-cyber border-neon-blue p-12 text-center">
          <div className="absolute left-1/4 top-0 h-48 w-48 animate-float-slow rounded-full bg-[#ff6b00]/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 animate-float-slow rounded-full bg-[#3b82f6]/25 blur-3xl" />

          <div className="relative">
            <h2 className="font-[var(--font-display)] text-4xl font-bold text-white sm:text-5xl">
              Comienza tu Aventura Hoy
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Únete a miles de usuarios que ya disfrutan de la nueva era de las rifas. Rápido, seguro e innovador.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-neon-orange-gradient px-8 py-4 text-lg font-bold text-white shadow-2xl transition hover-lift animate-glow-pulse"
            >
              <Sparkles className="h-5 w-5" />
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
