"use client";

import { CreateRaffleModal } from "@/components/admin/CreateRaffleModal";

export default function AdminRafflesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Rifas</h1>
          <p className="text-white/80">Crear, editar, subir flyer y galería.</p>
        </div>
        <CreateRaffleModal />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30">
        <p className="text-sm text-white/80">Conecta tu backend para listar rifas creadas. Usa el botón “Crear rifa” para enviar los datos reales al endpoint /raffles.</p>
        <p className="text-xs text-white/60">Cuando el API devuelva el listado, reemplaza este bloque con la tabla/lista proveniente de /raffles.</p>
      </div>
    </main>
  );
}
