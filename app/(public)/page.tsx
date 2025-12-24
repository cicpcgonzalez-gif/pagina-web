import Link from "next/link"
import {
  Zap,
  Shield,
  Trophy,
  TrendingUp,
  Sparkles,
  Target,
  Star,
  CheckCircle,
  Lock,
  Eye,
  Smartphone,
  Apple,
  Play,
} from "lucide-react"

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
              <span className="text-white">Cada boleto es una oportunidad</span>
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
                ¡Juega con confianza!
              </span>
            </h1>

            <p className="mx-auto mb-4 max-w-2xl text-xl text-cyan-300/90 sm:text-2xl font-semibold">
              Tus jugadas ahora serán perfectas y seguras
            </p>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-white/60">
              Todas las rifas de tu preferencia en un solo lugar, a tan solo un clic.
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

      <section className="px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-3">
            <div
              className="p-6 text-center rounded-xl backdrop-blur-xl border"
              style={{
                background: "rgba(251, 146, 60, 0.05)",
                borderColor: "rgba(251, 146, 60, 0.2)",
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: "#fb923c" }}>
                1,247
              </div>
              <div className="text-white/60 text-sm">Rifas Activas</div>
            </div>
            <div
              className="p-6 text-center rounded-xl backdrop-blur-xl border"
              style={{
                background: "rgba(34, 211, 238, 0.05)",
                borderColor: "rgba(34, 211, 238, 0.2)",
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: "#22d3ee" }}>
                8,532
              </div>
              <div className="text-white/60 text-sm">Usuarios Conectados</div>
            </div>
            <div
              className="p-6 text-center rounded-xl backdrop-blur-xl border"
              style={{
                background: "rgba(236, 72, 153, 0.05)",
                borderColor: "rgba(236, 72, 153, 0.2)",
              }}
            >
              <div className="text-4xl font-bold mb-2" style={{ color: "#ec4899" }}>
                $2.4M
              </div>
              <div className="text-white/60 text-sm">Premios Entregados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              Riferos Destacados
            </h2>
            <p className="text-white/60 text-lg">Los mejores riferos de nuestra plataforma</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              { name: "Carlos M.", rifas: 145, total: "$580K", rating: 4.9 },
              { name: "María G.", rifas: 128, total: "$420K", rating: 4.8 },
              { name: "José R.", rifas: 112, total: "$390K", rating: 4.9 },
              { name: "Ana P.", rifas: 98, total: "$310K", rating: 4.7 },
              { name: "Luis F.", rifas: 87, total: "$270K", rating: 4.8 },
            ].map((rifero, i) => (
              <div
                key={i}
                className="group p-6 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 rounded-2xl backdrop-blur-xl border cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(34, 211, 238, 0.05) 100%)",
                  borderColor: "rgba(251, 146, 60, 0.2)",
                }}
              >
                <div className="mb-4 flex justify-center">
                  <div
                    className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                    }}
                  >
                    {rifero.name.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">{rifero.name}</h3>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-semibold">{rifero.rating}</span>
                </div>
                <div className="text-white/60 text-sm space-y-1">
                  <div>{rifero.rifas} rifas</div>
                  <div className="font-semibold text-cyan-400">{rifero.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              Ganadores Recientes
            </h2>
            <p className="text-white/60 text-lg">¡Celebramos cada victoria!</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Pedro S***", rifa: "iPhone 15 Pro Max", date: "Hace 2 horas", amount: "$1,200" },
              { name: "Laura M***", rifa: "PlayStation 5", date: "Hace 5 horas", amount: "$550" },
              { name: "Miguel A***", rifa: "MacBook Pro", date: "Hace 8 horas", amount: "$2,400" },
              { name: "Carmen R***", rifa: 'Smart TV 65"', date: "Hace 12 horas", amount: "$800" },
              { name: "Roberto F***", rifa: "AirPods Pro", date: "Hace 1 día", amount: "$250" },
              { name: "Sofia L***", rifa: "iPad Air", date: "Hace 1 día", amount: "$650" },
            ].map((winner, i) => (
              <div
                key={i}
                className="p-5 rounded-xl backdrop-blur-xl border transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%)",
                  borderColor: "rgba(34, 211, 238, 0.2)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
                    }}
                  >
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white mb-1">{winner.name}</div>
                    <div className="text-sm text-cyan-400 mb-1">{winner.rifa}</div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{winner.date}</span>
                      <span className="font-semibold text-orange-400">{winner.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              Seguridad y Confianza
            </h2>
            <p className="text-white/60 text-lg">Tu tranquilidad es nuestra prioridad</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div
              className="p-8 text-center transition-all duration-300 hover:scale-105 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "rgba(34, 211, 238, 0.05)",
                borderColor: "rgba(34, 211, 238, 0.2)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
                  boxShadow: "0 0 40px rgba(34, 211, 238, 0.3)",
                }}
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-bold text-white text-lg">Verificación de Identidad</h3>
              <p className="text-white/60 text-sm">Todos los riferos pasan por un proceso de verificación riguroso</p>
            </div>

            <div
              className="p-8 text-center transition-all duration-300 hover:scale-105 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "rgba(251, 146, 60, 0.05)",
                borderColor: "rgba(251, 146, 60, 0.2)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                  boxShadow: "0 0 40px rgba(251, 146, 60, 0.3)",
                }}
              >
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-bold text-white text-lg">Auditoría en Tiempo Real</h3>
              <p className="text-white/60 text-sm">
                Cada transacción es monitoreada y registrada de forma transparente
              </p>
            </div>

            <div
              className="p-8 text-center transition-all duration-300 hover:scale-105 rounded-2xl backdrop-blur-xl border"
              style={{
                background: "rgba(236, 72, 153, 0.05)",
                borderColor: "rgba(236, 72, 153, 0.2)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
                  boxShadow: "0 0 40px rgba(236, 72, 153, 0.3)",
                }}
              >
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-bold text-white text-lg">Datos Cifrados</h3>
              <p className="text-white/60 text-sm">
                Tecnología de encriptación de nivel bancario protege tu información
              </p>
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

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                text: "La mejor plataforma de rifas que he usado. Transparente, rápida y segura. ¡Gané mi primer premio en la segunda semana!",
                author: "María González",
                role: "Compradora activa",
              },
              {
                text: "Como rifero, MEGA RIFAS me ha permitido llegar a miles de personas. El sistema es confiable y mis clientes están felices.",
                author: "Carlos Martínez",
                role: "Rifero verificado",
              },
              {
                text: "La seguridad que ofrecen es increíble. Me siento tranquilo sabiendo que mis datos y pagos están protegidos.",
                author: "José Rodríguez",
                role: "Usuario frecuente",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl backdrop-blur-xl border"
                style={{
                  background: "linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(34, 211, 238, 0.05) 100%)",
                  borderColor: "rgba(251, 146, 60, 0.2)",
                }}
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <div className="border-t pt-4" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-white/50">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-6xl">
          <div
            className="p-12 rounded-3xl backdrop-blur-xl border relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)",
              borderColor: "rgba(251, 146, 60, 0.3)",
            }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <h2 className="mb-4 font-[var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
                  Lleva MEGA RIFAS en tu bolsillo
                </h2>
                <p className="text-white/70 text-lg mb-6">
                  Descarga nuestra app y participa en rifas desde cualquier lugar. Tu próximo premio está a un tap de
                  distancia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                      color: "white",
                    }}
                  >
                    <Apple className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-xs">Descargar en</div>
                      <div className="text-base font-bold">App Store</div>
                    </div>
                  </button>
                  <button
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                      color: "white",
                    }}
                  >
                    <Play className="h-6 w-6 fill-current" />
                    <div className="text-left">
                      <div className="text-xs">Disponible en</div>
                      <div className="text-base font-bold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className="h-64 w-64 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%)",
                  }}
                >
                  <Smartphone className="h-32 w-32 text-white/40" />
                </div>
              </div>
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
