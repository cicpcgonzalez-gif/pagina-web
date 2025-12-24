import type React from "react"
import type { Metadata } from "next"
import { Urbanist, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
