import type React from "react"
import type { Metadata } from "next"
import { Urbanist, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Link from "next/link"

const display = Urbanist({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "MEGA RIFAS | La Nueva Era de las Rifas",
  description: "Tus jugadas ahora serán perfectas y seguras. Todas las rifas en un solo lugar, a tan solo un clic.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${sans.variable} font-sans antialiased`}
        style={{
          background: "linear-gradient(180deg, #0a0e1e 0%, #1e2a4a 50%, #0f1419 100%)",
          color: "white",
        }}
      >
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
                  className="font-[var(--font-display)] text-xl font-bold tracking-tight"
                  style={{
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
            <div className="flex items-center gap-3">
              <Link
                className="hidden sm:block rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                }}
                href="/login"
              >
                Iniciar Sesión
              </Link>
              <Link
                className="rounded-lg px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px]"
                style={{
                  background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
                  boxShadow: "0 4px 20px rgba(251, 146, 60, 0.4), 0 0 40px rgba(251, 146, 60, 0.2)",
                }}
                href="/register"
              >
                Registrarse
              </Link>
            </div>
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
                <span className="font-[var(--font-display)] text-lg font-bold text-white">MEGA RIFAS</span>
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
        <Analytics />
      </body>
    </html>
  )
}
