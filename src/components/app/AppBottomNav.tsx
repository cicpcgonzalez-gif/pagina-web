"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserRole } from "@/lib/session";

type NavItem = {
  href: string;
  label: string;
};

export function AppBottomNav() {
  const pathname = usePathname();
  const role = (getUserRole() || "").toLowerCase();

  const items: NavItem[] = [
    { href: "/rifas", label: "Rifas" },
    { href: "/tickets", label: "Tickets" },
    { href: "/wallet", label: "Wallet" },
    { href: "/ganadores", label: "Ganadores" },
    { href: "/perfil", label: "Perfil" },
  ];

  if (role === "superadmin") items.push({ href: "/superadmin", label: "Super Admin" });
  else if (role === "admin" || role === "organizer") items.push({ href: "/admin", label: "Admin" });

  const isActive = (href: string) => {
    if (href === "/rifas") return pathname === "/rifas" || pathname?.startsWith("/rifas/");
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[rgba(15,23,42,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex flex-1 items-center justify-center rounded-xl px-2 py-2 text-xs font-semibold transition " +
                (active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
