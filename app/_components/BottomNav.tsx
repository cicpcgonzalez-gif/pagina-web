'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Wallet, Trophy, User, Shield } from 'lucide-react';
import { getAuthToken, getUserRole } from '@/lib/session';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/rifas', icon: Home, label: 'Rifas' },
  { href: '/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/wallet', icon: Wallet, label: 'Billetera' },
  { href: '/ganadores', icon: Trophy, label: 'Ganadores' },
  { href: '/perfil', icon: User, label: 'Perfil' },
];

const BottomNav = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("");

  const decodeJwtRole = (token: string | null): string => {
    try {
      if (!token) return "";
      const parts = token.split('.');
      if (parts.length < 2) return "";
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json);
      const r = String(payload?.role || "").toLowerCase();
      return r;
    } catch (_e) {
      return "";
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);

    const storageRole = (getUserRole() || "").toLowerCase();
    const jwtRole = decodeJwtRole(token);
    setRole(storageRole || jwtRole || "");

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_role' || e.key === 'refresh_token') {
        const t = getAuthToken();
        setIsLoggedIn(!!t);
        const r = (getUserRole() || "").toLowerCase();
        setRole(r || decodeJwtRole(t) || "");
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  // Nota: En la app móvil Admin/Superadmin es un tab más; mantenemos bottom-nav visible.

  const roleItem =
    role === 'superadmin'
      ? { href: '/superadmin', icon: Shield, label: 'Super Admin' }
      : (role === 'admin' || role === 'organizer')
        ? { href: '/admin', icon: Shield, label: 'Admin' }
        : null;

  const items = roleItem ? [...navItems, roleItem] : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-sm">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full flex-col items-center justify-center gap-1 py-2 text-xs font-semibold transition-colors ${
                active ? "text-amber-300" : "text-slate-400 hover:text-purple-200"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className={`h-6 w-6 ${active ? "drop-shadow-[0_0_10px_rgba(250,204,21,0.35)]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
