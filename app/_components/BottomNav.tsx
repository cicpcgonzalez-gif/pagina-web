'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, Wallet, Trophy, User } from 'lucide-react';
import { getAuthToken } from '@/lib/session';
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

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  // Panels administrativos se manejan sin bottom-nav (como en la app).
  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname.startsWith("/usuarios")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-screen-sm">
        {navItems.map((item) => {
          const active = pathname === item.href
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
