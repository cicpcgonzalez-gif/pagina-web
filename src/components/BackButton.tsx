"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";

export function BackButton({ label = "Volver" }: { label?: string }) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 bottom-24 z-50 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur transition hover:-translate-y-[1px] hover:bg-white/15"
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
