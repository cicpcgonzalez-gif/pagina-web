"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/session"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      const next = pathname || "/rifas"
      router.replace(`/login?next=${encodeURIComponent(next)}`)
      return
    }
    setReady(true)
  }, [router, pathname])

  if (!ready) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-white">Cargando…</h1>
      </main>
    )
  }

  return <>{children}</>
}
