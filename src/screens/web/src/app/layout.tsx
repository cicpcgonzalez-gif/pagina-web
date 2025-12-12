import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton";

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
          <header className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
                Portal de Rifas
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
                <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/rifas">
                  Rifas
                </Link>
                <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/login">
                  Login
                </Link>
                <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/register">
                  Registro
                </Link>
                <LogoutButton />
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
