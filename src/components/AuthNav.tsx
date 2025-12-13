"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { getAuthToken } from "@/lib/session";

export default function AuthNav() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(!!getAuthToken());
  }, []);

  if (!isAuthed) return null;

  return (
    <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
      <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/rifas">
        Rifas
      </Link>
      <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/admin">
        Admin
      </Link>
      <Link className="rounded-md px-3 py-2 hover:bg-gray-100" href="/perfil">
        Perfil
      </Link>
      <LogoutButton />
    </nav>
  );
}
