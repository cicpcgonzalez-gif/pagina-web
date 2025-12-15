import Link from "next/link";
import { fetchRaffles } from "@/lib/api";
import { ProfileLinkButton } from "@/components/ProfileLinkButton";
import { HomeLoginCard } from "@/components/HomeLoginCard";

export const dynamic = "force-dynamic";

const banners = [
  {
    title: "Publicidad destacada",
    copy: "Lanza tu campaña y vende boletos en minutos.",
    badge: "Patrocinado",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
];

const rifers = [
  { name: "Rifero Elite", handle: "@rifero.elite", color: "#ff8c6f" },
  { name: "Megarifas Team", handle: "@megarifas.oficial", color: "#4078d1" },
  { name: "Sorteos Plus", handle: "@sorteos.plus", color: "#2fbf71" },
];

const winners = [
  { name: "Mariana R.", prize: "iPhone 16 Pro", raffler: "@rifero.elite" },
  { name: "Carlos D.", prize: "Viaje Cancún", raffler: "@megarifas.oficial" },
  { name: "Lucía M.", prize: "Moto 150cc", raffler: "@sorteos.plus" },
];

export default async function Home() {
  const raffles = await fetchRaffles();
  const activeRaffles = raffles.filter((r) => r.status === "activa");

  return (
    <main className="relative min-h-screen bg-night-sky text-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-10 px-4 pb-24 pt-12 sm:pt-16 md:max-w-6xl md:gap-14">
        <section className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-black/20">
              <span className="h-2 w-2 rounded-full bg-[#facc15]" />
              Somos Megarifas
            </div>
            <h1 className="font-[var(--font-display)] text-3xl leading-tight text-white sm:text-4xl">
              Un portal vibrante para rifas reales: publicidad, perfil y premios en un solo lugar.
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              Desde la landing hasta el feed tipo Instagram: campañas destacadas, rifas activas, perfiles de rifieros y top de ganadores.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:-translate-y-[1px] glow-primary"
                href="/rifas"
              >
                Ver rifas activas
              </Link>
              <Link
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:border-white/40"
                href="/login"
              >
                Entrar como rifero
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{ label: "Rifas activas", value: activeRaffles.length || "12" }, { label: "Boletos en venta", value: "4,320" }, { label: "Ganadores", value: "1,105" }].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-sm shadow-black/30"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">{item.label}</p>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-[#3b82f6]/30 blur-3xl" />
            <div className="absolute -right-12 bottom-0 h-24 w-24 rounded-full bg-[#22d3ee]/25 blur-3xl" />
            <div className="relative space-y-4 text-sm text-white">
              <HomeLoginCard />
              {banners.map((banner) => (
                <div key={banner.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div
                    className="h-32 w-full bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(120deg, rgba(10,14,28,0.5), rgba(10,14,28,0.1)), url(${banner.image})` }}
                  />
                  <div className="space-y-2 p-4">
                    <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold text-white">{banner.badge}</span>
                    <h3 className="text-lg font-semibold text-white">{banner.title}</h3>
                    <p className="text-sm text-white/75">{banner.copy}</p>
                  </div>
                </div>
              ))}
              <div className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between text-xs text-white/80">
                  <span>Ventas hoy</span>
                  <span>+$2,840</span>
                </div>
                <div className="flex justify-between text-xs text-white/80">
                  <span>Tickets validados</span>
                  <span>+58</span>
                </div>
                <div className="flex justify-between text-xs text-white/80">
                  <span>Nuevos usuarios</span>
                  <span>+24</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 sm:grid-cols-2 lg:grid-cols-4">
          {[{
            title: "Landing + publicidad",
            desc: "Destaca campañas y sponsors en un hero editorial.",
          },
          {
            title: "Feed tipo IG",
            desc: "Rifas activas con cards, progreso y CTA directos.",
          },
          {
            title: "Perfiles",
            desc: "Muestra rifero, handle y enlaces sociales.",
          },
          {
            title: "Top ganadores",
            desc: "Historias recientes para ganar confianza.",
          }].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <h3 className="text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-white/75">{card.desc}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Feed activo</p>
              <h2 className="font-[var(--font-display)] text-2xl text-white">Rifas al estilo Instagram</h2>
            </div>
            <Link className="text-sm font-semibold text-[#22d3ee]" href="/rifas">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRaffles.slice(0, 6).map((raffle, idx) => {
              const sold = raffle.ticketsTotal - raffle.ticketsAvailable;
              const progress = raffle.ticketsTotal
                ? Math.min(100, Math.max(0, Math.round((sold / raffle.ticketsTotal) * 100)))
                : 0;
              const rifero = rifers[idx % rifers.length];
              return (
                <article
                  key={raffle.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full" style={{ background: rifero.color }} />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-white">{rifero.name}</p>
                      <p className="text-xs text-white/70">{rifero.handle}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">{raffle.status}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">{raffle.title}</h3>
                    <p className="text-sm text-white/75">${raffle.price.toFixed(2)} por boleto • Sorteo {raffle.drawDate}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/20">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-white/70">
                      <span>Vendidos {sold}</span>
                      <span>Disponibles {raffle.ticketsAvailable}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Link
                      href={`/rifas/${raffle.id}`}
                      className="flex-1 rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] px-3 py-2 text-center font-semibold text-white shadow-md shadow-black/30 transition hover:-translate-y-[1px]"
                    >
                      Comprar
                    </Link>
                    <ProfileLinkButton className="rounded-lg border border-white/20 px-3 py-2 text-white transition hover:border-white/40">
                      Perfil
                    </ProfileLinkButton>
                  </div>
                </article>
              );
            })}
            {activeRaffles.length === 0 && (
              <p className="text-sm text-white/75">No hay rifas activas disponibles en la API.</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Quiénes somos</p>
            <h2 className="font-[var(--font-display)] text-2xl text-white">Megarifas, comunidad de sorteos seguros</h2>
            <p className="text-sm text-white/80">Validación de boletos, pagos en línea y panel admin. Replica la app móvil con la misma confianza, ahora en web.</p>
            <div className="flex flex-wrap gap-2 text-xs text-white/75">
              <span className="rounded-full bg-white/10 px-3 py-1">Pagos verificados</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Boletos con serial</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Roles y seguridad</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {rifers.map((rifer) => (
              <div
                key={rifer.handle}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm shadow-black/20"
              >
                <div className="h-10 w-10 rounded-full" style={{ background: rifer.color }} />
                <p className="mt-3 text-sm font-semibold text-white">{rifer.name}</p>
                <p className="text-xs text-white/70">{rifer.handle}</p>
                <p className="mt-2 text-xs text-white/65">Rifas verificadas y visibles en el feed.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">Ganadores</p>
                <h2 className="font-[var(--font-display)] text-2xl text-white">Top de confianza</h2>
              </div>
              <Link className="text-sm font-semibold text-[#22d3ee]" href="/estado">Ver validaciones</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {winners.map((winner) => (
                <div key={winner.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{winner.name}</p>
                  <p className="text-xs text-white/70">Ganó: {winner.prize}</p>
                  <p className="mt-2 text-xs text-white/60">Rifero {winner.raffler}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
