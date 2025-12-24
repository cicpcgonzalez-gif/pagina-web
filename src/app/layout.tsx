import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Urbanist, Inter } from "next/font/google"
import "./globals.css"
import LogoutButton from "@/components/LogoutButton"
import { Zap, Trophy, Users } from "lucide-react"

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
  description: "Tus jugadas ahora serÃ¡n perfectas y seguras. Todas las rifas en un solo lugar.",
  other: { "x-build": "4f661fc-20251223-202210" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${sans.variable} antialiased text-foreground`}
        style={{
          background: "linear-gradient(135deg, #0a1929 0%, #0f172a 25%, #1e1b4b 50%, #1e3a8a 75%, #0c4a6e 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="min-h-screen">
          <header
            className="sticky top-0 z-50 backdrop-blur-xl border-b"
            style={{
              background: "rgba(15,23,42,0.75)",
              borderColor: "rgba(59, 130, 246, 0.25)",
            }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
                    boxShadow: "0 0 24px rgba(255, 107, 0, 0.5)",
                  }}
                >
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-[var(--font-display)] text-xl font-bold tracking-tight text-white">
                    MEGA RIFAS
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/60">La Nueva Era</span>
                </div>
              </Link>
              <nav className="flex items-center gap-3 text-sm font-medium">
                <Link
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  href="/rifas"
                >
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Rifas</span>
                </Link>
                <Link
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  href="/estado"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Ganadores</span>
                </Link>
                <Link
                  className="rounded-lg bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-lg px-4 py-2 font-semibold text-white transition hover:-translate-y-[1px]"
                  style={{
                    background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
                    boxShadow: "0 4px 20px rgba(255, 107, 0, 0.4)",
                  }}
                  href="/register"
                >
                  Registrarse
                </Link>
                <LogoutButton />
              </nav>
            </div>
          </header>
          {children}
          <footer
            className="backdrop-blur-xl border-t mt-20"
            style={{
              background: "rgba(15,23,42,0.75)",
              borderColor: "rgba(59, 130, 246, 0.25)",
            }}
          >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)" }}
                  >
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-[var(--font-display)] text-lg font-bold text-white">MEGA RIFAS</span>
                </div>
                <p className="text-sm text-white/60">Â© 2025 MegaRifas. La nueva era de las rifas.</p>
                <div className="flex gap-4 text-sm text-white/60">
                  <a href="#" className="hover:text-white">
                    TÃ©rminos
                  </a>
                  <a href="#" className="hover:text-white">
                    Privacidad
                  </a>
                  <a href="#" className="hover:text-white">
                    Contacto
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
