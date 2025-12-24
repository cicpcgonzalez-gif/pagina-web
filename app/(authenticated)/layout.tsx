
import React from 'react';
import BottomNav from '../_components/BottomNav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white">
      <main className="flex-grow pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
