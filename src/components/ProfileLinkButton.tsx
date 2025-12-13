"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/session";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function ProfileLinkButton({ className, children = "Perfil" }: Props) {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  if (!auth) return null;

  return (
    <Link href="/perfil" className={className}>
      {children}
    </Link>
  );
}
