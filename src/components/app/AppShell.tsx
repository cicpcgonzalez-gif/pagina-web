import type React from "react";

import { AppBottomNav } from "@/components/app/AppBottomNav";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-cyber-gradient text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-24 pt-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Mega Rifas</p>
          <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">{title}</h1>
          {subtitle ? <p className="text-white/75">{subtitle}</p> : null}
        </header>
        {children}
      </div>
      <AppBottomNav />
    </main>
  );
}
