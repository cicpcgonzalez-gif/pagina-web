import { fetchSystemStatus } from "@/lib/api"

export const revalidate = 0

const stateStyle: Record<string, string> = {
  operativo: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
  degradado: "bg-amber-400/15 text-amber-100 border-amber-400/30",
  caido: "bg-red-500/15 text-red-100 border-red-400/30",
}

export default async function EstadoPage() {
  const statuses = await fetchSystemStatus()

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mega Rifas</p>
            <h1 className="text-2xl font-extrabold text-white">ESTADO</h1>
            <div className="mt-1 h-1 w-16 rounded-full bg-purple-500 mx-auto" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6 space-y-6 pb-24">
        <div className="rounded-3xl border border-purple-500/30 bg-linear-to-br from-slate-900 to-slate-950 p-5 shadow-xl shadow-purple-900/30">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Salud del sistema</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Servicios críticos</h2>
          <p className="mt-2 text-sm text-slate-200">API, base de datos y servicios relacionados.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {statuses.map((item) => (
            <article key={item.service} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/30">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-white">{item.service}</p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-extrabold ${stateStyle[item.state] || "bg-white/10 text-slate-100 border-slate-600"}`}
                >
                  {item.state}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-200">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
