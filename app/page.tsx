import Link from "next/link"
import { Zap, Shield, Trophy, TrendingUp, Sparkles, Target } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-gentle"
            style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{
              background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
              animation: "float-gentle 8s ease-in-out infinite",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(251, 146, 60, 0.5) 0%, rgba(34, 211, 238, 0.3) 50%, transparent 70%)",
                  }}
                />
                <img
                  src="/images/icon.png"
                  alt="MEGA RIFAS"
                  className="relative h-32 w-32 object-cover rounded-full p-2 animate-float-gentle group-hover:scale-110 transition-transform duration-500"
                  style={{
                    filter:
                      "drop-shadow(0 0 30px rgba(251, 146, 60, 0.8)) drop-shadow(0 0 60px rgba(34, 211, 238, 0.4))",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(34, 211, 238, 0.15))",
                  }}
                />
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl border"
                style={{
                  background: "rgba(251, 146, 60, 0.1)",
                  borderColor: "rgba(251, 146, 60, 0.3)",
                  color: "#fb923c",
                }}
              >
                <Sparkles className="h-4 w-4" />
                La Nueva Era de las Rifas
              </div>
            </div>

            <h1 className="mb-6 font-[var(--font-display)] text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              <span className="text-white">Tus jugadas ahora serán</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                className="animate-glow-pulse"
              >
                perfectas y seguras
              </span>
            </h1>

            <p className="mx-auto mb-4 max-w-2xl text-xl text-cyan-300/90 sm:text-2xl font-semibold">
              Todas las rifas de tu preferencia en un solo lugar
            </p>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-white/60">
              A tan solo un clic. La plataforma más innovadora para conectar riferos y compradores.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                  boxShadow: "0 8px 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)",
                }}
              >
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Comenzar Ahora
              </Link>
              <Link
                href="/rifas"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold transition-all duration-300 hover:scale-105 backdrop-blur-xl border"
                style={{
                  background: "rgba(34, 211, 238, 0.1)",
                  borderColor: "rgba(34, 211, 238, 0.3)",
                  color: "#22d3ee",
                }}
              >
                <Trophy className="h-5 w-5" />
                Explorar Rifas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div
              className="group p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)",
                borderColor: "rgba(251, 146, 60, 0.2)",
                boxShadow: "0 8px 32px rgba(251, 146, 60, 0.1)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform duration-300"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                  boxShadow: "0 0 40px rgba(251, 146, 60, 0.5), 0 8px 16px rgba(251, 146, 60, 0.3)",
                }}
              >
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-[var(--font-display)] text-xl font-bold text-white">Seguridad Total</h3>
              <p className="text-white/70">
                Sistema encriptado de última generación. Tus transacciones son 100% seguras y verificadas
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="group p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                borderColor: "rgba(34, 211, 238, 0.2)",
                boxShadow: "0 8px 32px rgba(34, 211, 238, 0.1)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform duration-300"
                style={{
                  background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
                  boxShadow: "0 0 40px rgba(34, 211, 238, 0.5), 0 8px 16px rgba(34, 211, 238, 0.3)",
                }}
              >
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-[var(--font-display)] text-xl font-bold text-white">Jugadas Perfectas</h3>
              <p className="text-white/70">
                Selección inteligente de números, estadísticas en tiempo real y recomendaciones personalizadas
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="group p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)",
                borderColor: "rgba(236, 72, 153, 0.2)",
                boxShadow: "0 8px 32px rgba(236, 72, 153, 0.1)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform duration-300"
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                  boxShadow: "0 0 40px rgba(236, 72, 153, 0.5), 0 8px 16px rgba(236, 72, 153, 0.3)",
                }}
              >
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-[var(--font-display)] text-xl font-bold text-white">Todo en un Lugar</h3>
              <p className="text-white/70">
                Miles de rifas actualizadas al instante. Encuentra tu premio ideal sin complicaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div
            className="overflow-hidden p-12 text-center rounded-2xl backdrop-blur-xl border relative"
            style={{
              background: "linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%)",
              borderColor: "rgba(251, 146, 60, 0.3)",
              boxShadow: "0 20px 60px rgba(251, 146, 60, 0.2), 0 0 100px rgba(34, 211, 238, 0.1)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, #fb923c 0%, transparent 70%)" }}
            />
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl relative z-10">
              ¿Listo para la nueva era?
            </h2>
            <p className="mb-8 text-lg text-white/70 relative z-10">
              Únete a miles de usuarios que ya viven la experiencia del futuro de las rifas
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-105 relative z-10"
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                boxShadow: "0 8px 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)",
              }}
            >
              <Zap className="h-5 w-5" />
              Empezar Gratis Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
