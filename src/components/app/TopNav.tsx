"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken, getUserRole } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

export function TopNav() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setIsAuthed(Boolean(getAuthToken()));
      setRole(getUserRole());
    };

    sync();

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return sync();
      if (e.key === "auth_token" || e.key === "user_role" || e.key === "refresh_token") sync();
    };

    window.addEventListener("storage", onStorage);
    // También sincroniza al volver al tab.
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const items = useMemo(() => {
    const base: NavItem[] = [
      { href: "/rifas", label: "Rifas" },
      { href: "/ganadores", label: "Ganadores" },
    ];

    if (!isAuthed) return base;

    const internal: NavItem[] = [
      { href: "/tickets", label: "Tickets" },
      { href: "/wallet", label: "Wallet" },
      { href: "/perfil", label: "Perfil" },
    ];

    const normalized = String(role || "").toLowerCase();
    if (normalized === "superadmin") internal.push({ href: "/superadmin", label: "Superadmin" });
    else if (normalized === "admin" || normalized === "organizer") internal.push({ href: "/admin", label: "Admin" });

    return [...base, ...internal];
  }, [isAuthed, role]);

  return (
    <nav className="flex items-center gap-2 text-sm font-medium">
      {items.map((item) => {
        return (
          <Link
            key={item.href}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            href={item.href}
          >
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}

      {!isAuthed ? (
        <>
          <Link className="rounded-lg bg-white/10 px-4 py-2 text-white transition hover:bg-white/20" href="/login">
            Login
          </Link>
          <Link
            className="rounded-lg px-4 py-2 font-semibold text-white transition hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
              boxShadow: "0 4px 20px rgba(255, 107, 0, 0.4)",
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
  );
}
