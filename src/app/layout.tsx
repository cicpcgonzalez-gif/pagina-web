import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Urbanist, Inter } from "next/font/google"
import "./globals.css"
import Image from "next/image"
import { TopNav } from "@/components/app/TopNav"

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
  description: "Tus jugadas ahora serán perfectas y seguras. Todas las rifas en un solo lugar.",
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
              <Link href="/" className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{
                      background: "radial-gradient(circle, rgba(255,107,0,0.4) 0%, transparent 70%)",
                    }}
                  />
                  <Image
                    src="/images/icon.png"
                    alt="MEGA RIFAS"
                    width={48}
                    height={48}
                    className="relative rounded-full"
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(255,107,0,0.5))",
                    }}
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-bold tracking-tight text-white">
                    MEGA RIFAS
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/60">La Nueva Era</span>
                </div>
              </Link>
              <nav className="flex items-center gap-3 text-sm font-medium">
                <TopNav />
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
                  <Image
                    src="/images/icon.png"
                    alt="MEGA RIFAS"
                    width={32}
                    height={32}
                    className="rounded-full"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,107,0,0.4))",
                    }}
                  />
                  <span className="text-lg font-bold text-white">MEGA RIFAS</span>
                </div>
                <p className="text-sm text-white/60">© 2025 MegaRifas. La nueva era de las rifas.</p>
                <div className="flex gap-4 text-sm text-white/60">
                  <a href="#" className="hover:text-white">
                    Términos
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
