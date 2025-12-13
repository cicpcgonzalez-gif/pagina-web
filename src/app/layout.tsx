import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { BackButton } from "@/components/BackButton";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rifas Web",
  description: "Version web de respaldo para ventas y sorteos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable} antialiased bg-gray-50 text-gray-800`}>
        <div className="min-h-screen">
          <div className="bg-amber-100 border-b border-amber-300 text-amber-900">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <span className="rounded bg-amber-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide">Aviso</span>
              <p className="text-sm font-semibold sm:text-base">VERSION DE PRUEBA DEMO, NO COMERCIAL</p>
            </div>
          </div>
          {children}
          <BackButton />
        </div>
      </body>
    </html>
  );
}
