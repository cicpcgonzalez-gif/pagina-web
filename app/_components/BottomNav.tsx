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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="flex justify-around max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200 ${pathname === item.href ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
            
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
