"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function BackButton({ label = "Volver" }: { label?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const sameOriginReferrer = document.referrer.startsWith(origin);
    const hasHistory = () => window.history.length > 1 && sameOriginReferrer;

    const update = () => setCanGoBack(hasHistory());
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  const hideOnMain = pathname === "/" || pathname === "/rifas" || pathname.startsWith("/rifas/");
  if (!canGoBack || hideOnMain) return null;

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 bottom-24 z-50 hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur transition hover:-translate-y-[1px] hover:bg-white/15 md:inline-flex"
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
