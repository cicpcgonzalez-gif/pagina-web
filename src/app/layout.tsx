import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { BackButton } from "@/components/BackButton";
import { MainNav } from "@/components/MainNav";
import { SessionTimeoutGuard } from "@/components/SessionTimeoutGuard";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MEGARIFAS",
  description: "Plataforma de rifas, pagos y sorteos en línea.",
  icons: {
    icon: "/megarifas-icon.svg",
    shortcut: "/megarifas-icon.svg",
    apple: "/megarifas-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-[#0b1224] text-white">
      <body className={`${display.variable} ${sans.variable} antialiased bg-[#0b1224] text-white selection:bg-[#22d3ee]/30 selection:text-white`}>
        <div className="min-h-screen pb-20">
          <div className="border-b border-amber-300/50 bg-amber-100/90 text-amber-900">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <span className="rounded bg-amber-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide">Aviso</span>
              <p className="text-sm font-semibold sm:text-base">VERSION DE PRUEBA DEMO, NO COMERCIAL</p>
            </div>
          </div>
          {children}
          <MainNav />
          <BackButton />
          <SessionTimeoutGuard />
        </div>
      </body>
    </html>
  );
}
