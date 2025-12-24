
import React from 'react';
import BottomNav from '../_components/BottomNav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
