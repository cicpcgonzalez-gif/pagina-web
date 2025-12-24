"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getAuthToken, getUserRole } from "@/lib/session"
import LogoutButton from "@/components/LogoutButton"

type NavItem = {
  href: string
  label: string
  requiresAuth?: boolean
  roles?: Array<string>
}

export function TopNav() {
  const [authed, setAuthed] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => {
      setAuthed(Boolean(getAuthToken()))
      setRole(getUserRole())
    }

    sync()

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return sync()
      if (e.key === "auth_token" || e.key === "user_role" || e.key === "refresh_token") sync()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("focus", sync)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", sync)
    }
  }, [])

  const items = useMemo(() => {
    const normalizedRole = String(role || "").toLowerCase()
    const all: NavItem[] = [
      { href: "/", label: "Inicio" },
      { href: "/rifas", label: "Rifas" },
      { href: "/ganadores", label: "Ganadores" },
      { href: "/tickets", label: "Tickets", requiresAuth: true },
      { href: "/wallet", label: "Wallet", requiresAuth: true },
      { href: "/perfil", label: "Perfil", requiresAuth: true },
      { href: "/admin", label: "Admin", requiresAuth: true, roles: ["admin", "organizer", "superadmin"] },
      { href: "/superadmin", label: "Superadmin", requiresAuth: true, roles: ["superadmin"] },
      { href: "/usuarios", label: "Usuarios", requiresAuth: true, roles: ["superadmin"] },
    ]

    return all.filter((item) => {
      if (item.requiresAuth && !authed) return false
      if (!item.roles) return true
      return item.roles.includes(normalizedRole)
    })
  }, [authed, role])

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-white/90 hover:bg-white/10 transition">
          {item.label}
        </Link>
      ))}

      {!authed ? (
        <>
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
            className="rounded-lg px-4 py-2 font-semibold text-white transition hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
              boxShadow: "0 4px 20px rgba(251, 146, 60, 0.4), 0 0 40px rgba(251, 146, 60, 0.2)",
            }}
            href="/register"
          >
            Registrarse
          </Link>
        </>
      ) : (
        <LogoutButton />
      )}
    </nav>
  )
}
