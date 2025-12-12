"use client";

import { useMemo, useState } from "react";

type Template = { id: string; name: string; channel: "email" | "push"; active: boolean; subject?: string };

export default function AdminNotifsPage() {
  const [templates, setTemplates] = useState<Template[]>(
    () => [
      { id: "NT-01", name: "Pago recibido", channel: "email", active: true, subject: "Confirmación de pago" },
      { id: "NT-02", name: "Ticket validado", channel: "push", active: true },
      { id: "NT-03", name: "Recordatorio de sorteo", channel: "email", active: false, subject: "Tu sorteo es mañana" },
    ],
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const toggle = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const sendTest = (tpl: Template) => {
    const channel = tpl.channel === "email" ? "correo" : "push";
    setTestStatus(`Test enviado (${channel}) con plantilla "${tpl.name}" (mock).`);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Notificaciones</h1>
      <p className="mt-2 text-white/80">Activa/desactiva plantillas y envía test (mock).</p>

      <div className="mt-6 grid gap-3">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{tpl.name}</p>
                <p className="text-xs text-white/70">Canal: {tpl.channel}</p>
                {tpl.subject && <p className="text-xs text-white/60">Asunto: {tpl.subject}</p>}
              </div>
              <span
                className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${tpl.active ? "bg-emerald-500/15 text-emerald-100 border-emerald-200/30" : "bg-white/10 text-white/70 border-white/20"}`}
              >
                {tpl.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button onClick={() => toggle(tpl.id)} className="rounded-md border border-white/20 px-3 py-2 text-white transition hover:border-white/40">
                {tpl.active ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => sendTest(tpl)}
                className="rounded-md bg-[#3b82f6] px-3 py-2 font-semibold text-white shadow-sm shadow-black/30 transition hover:-translate-y-[1px]"
              >
                Enviar test
              </button>
            </div>
          </div>
        ))}
      </div>

      {testStatus && <p className="mt-4 text-sm text-white/85">{testStatus}</p>}
    </main>
  );
}
