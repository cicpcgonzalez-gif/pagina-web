import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchSystemStatus } from "@/lib/api";

export const revalidate = 0;

const stateStyle: Record<string, string> = {
  operativo: "bg-emerald-500/25 text-emerald-50 border-emerald-200/40",
  degradado: "bg-amber-400/25 text-amber-50 border-amber-200/40",
  caido: "bg-rose-500/25 text-rose-50 border-rose-200/40",
};

export default async function EstadoPage() {
  const token = cookies().get("auth_token")?.value;
  if (!token) {
    redirect("/login?redirect=/estado");
  }

  const statuses = await fetchSystemStatus();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 bg-night-sky text-white">
      <div className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/70">Estado del sistema</p>
        <h1 className="font-[var(--font-display)] text-3xl text-white sm:text-4xl">
          Salud de servicios críticos.
        </h1>
        <p className="text-base text-white/80">
          Monitorea API, pasarela de pagos y validación de boletos. Usa tu
          endpoint `/status` o edita los mensajes.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {statuses.map((item) => (
          <article
            key={item.service}
            className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-lg shadow-black/30 backdrop-blur"
          >
            <div className="flex items-center justify-between text-sm text-white/85">
              <span className="font-semibold text-white">{item.service}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stateStyle[item.state]}`}>
                {item.state}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/80">{item.detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
