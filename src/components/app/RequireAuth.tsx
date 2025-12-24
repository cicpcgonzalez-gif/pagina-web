"use client";

import type React from "react";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/session";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthed = useMemo(() => {
    return Boolean(getAuthToken());
  }, []);

  useEffect(() => {
    if (getAuthToken()) return;
    const next = pathname && pathname !== "/" ? pathname : "/rifas";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [router, pathname]);

  if (!isAuthed) return null;
  return <>{children}</>;
}
