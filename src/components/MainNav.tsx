"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getAuthToken, getUserRole } from "@/lib/session";

export function MainNav() {
  const pathname = usePathname();
  const token = getAuthToken();
  const role = getUserRole()?.toLowerCase();

  const links = useMemo(() => {
    const base = [
      { href: "/rifas", label: "Rifas" },
      { href: "/mis-rifas", label: "Mis rifas" },
      { href: "/wallet", label: "Wallet" },
      { href: "/ganadores", label: "Ganadores" },
      { href: "/perfil", label: "Perfil" },
    ];

    if (role === "admin" || role === "superadmin") {
      base.push({ href: "/admin", label: "Admin" });
    }
    if (role === "superadmin") {
      base.push({ href: "/superadmin", label: "Superadmin" });
    }
    return base;
  }, [role]);

  if (!token) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b1224]/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0))] shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-[#0b1224]/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 min-w-0 rounded-xl px-2 py-2 text-center transition hover:-translate-y-[1px] hover:border-white/30 ${active ? "border border-[#22d3ee]/60 bg-[#22d3ee]/15 text-[#e0f6ff]" : "border border-white/10 bg-white/5 text-white/85"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
