"use client";

import Link from "next/link";
import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getAuthToken, getUserRole } from "@/lib/session";
import { Crown, Shield, Star, Ticket, Trophy, User, Wallet as WalletIcon } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();
  const token = getAuthToken();
  const role = getUserRole()?.toLowerCase();
  const [showNavMobile, setShowNavMobile] = useState(true);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFormElement = useCallback((el: Element | null) => {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    const editable = (el as HTMLElement).isContentEditable;
    return editable || tag === "input" || tag === "textarea" || tag === "select" || tag === "button";
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: FocusEvent) => {
      if (window.innerWidth >= 768) return; // desktop no oculta
      if (isFormElement(e.target as Element)) {
        setShowNavMobile(false);
      }
    };

    const handleFocusOut = () => {
      if (window.innerWidth >= 768) return;
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
      blurTimeout.current = setTimeout(() => {
        const active = document.activeElement;
        if (!isFormElement(active as Element)) {
          setShowNavMobile(true);
        }
      }, 120);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, [isFormElement]);

  const links = useMemo(() => {
    const base = [
      { href: "/rifas", label: "Rifas", icon: Ticket },
      { href: "/mis-rifas", label: "Mis rifas", icon: Star },
      { href: "/wallet", label: "Wallet", icon: WalletIcon },
      { href: "/ganadores", label: "Ganadores", icon: Trophy },
      { href: "/perfil", label: "Perfil", icon: User },
    ];

    if (role === "superadmin") {
      base.push({ href: "/superadmin", label: "Superadmin", icon: Crown });
    } else if (role === "admin") {
      base.push({ href: "/admin", label: "Admin", icon: Shield });
    }
    return base;
  }, [role]);

  if (!token) return null;

  return (
    <nav
      className={`fixed right-4 bottom-28 z-40 ${showNavMobile ? "flex" : "hidden"} flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#0b1224]/90 px-2 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-[#0b1224]/80 md:flex`}
    >
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-full border text-white transition hover:-translate-y-[1px] hover:border-white/40 hover:bg-white/10 ${active ? "border-[#22d3ee]/70 bg-[#22d3ee]/15 text-[#e0f6ff]" : "border-white/15 bg-white/5 text-white/85"}`}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </nav>
  );
}
