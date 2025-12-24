"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeLoginCard } from "@/components/HomeLoginCard";
import { isAuthenticated } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/rifas");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-night-sky text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-20 pt-16 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Login</p>
          <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">Ingresa a tu cuenta</h1>
          <p className="text-base text-white/80">Usa el mismo correo y contraseña de la app.</p>
          <div className="text-sm text-white/70">
            <span>¿No tienes cuenta? </span>
            <Link className="text-[#93c5fd] underline hover:text-white" href="/register">
              Regístrate o recupera tu contraseña
            </Link>
          </div>
        </div>

        <HomeLoginCard />
      </div>
    </main>
  );
}
