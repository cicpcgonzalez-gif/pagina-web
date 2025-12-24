
import Link from "next/link"
import { TopNav } from "../_components/TopNav"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header
          className="sticky top-0 z-50 backdrop-blur-xl border-b"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            borderColor: "rgba(251, 146, 60, 0.2)",
            boxShadow: "0 4px 30px rgba(251, 146, 60, 0.1)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src="/images/icon.png"
                  alt="MEGA RIFAS Logo"
                  className="h-12 w-12 object-cover rounded-full p-1 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    filter:
                      "drop-shadow(0 0 20px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 40px rgba(251, 146, 60, 0.3))",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(34, 211, 238, 0.1))",
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #fb923c 0%, #22d3ee 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  MEGA RIFAS
                </span>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400/80">La Nueva Era</span>
              </div>
            </Link>
            <TopNav />
          </div>
        </header>
        {children}
        <footer
          className="backdrop-blur-xl border-t mt-20"
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            borderColor: "rgba(34, 211, 238, 0.2)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <img
                  src="/images/icon.png"
                  alt="MEGA RIFAS"
                  className="h-8 w-8 object-cover rounded-full p-0.5"
                  style={{
                    filter: "drop-shadow(0 0 15px rgba(251, 146, 60, 0.5))",
                    background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(34, 211, 238, 0.1))",
                  }}
                />
                <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MEGA RIFAS</span>
              </div>
              <p className="text-sm text-white/60">© 2025 MegaRifas. Todos los derechos reservados.</p>
              <div className="flex gap-4 text-sm text-white/60">
                <a href="#" className="hover:text-orange-400 transition">
                  Términos
                </a>
                <a href="#" className="hover:text-cyan-400 transition">
                  Privacidad
                </a>
                <a href="#" className="hover:text-white transition">
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </footer>
    </>
  )
}
