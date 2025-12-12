export default function AdminRafflesPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Rifas</h1>
      <p className="mt-2 text-white/80">Listado y gestión de rifas (activas, próximas, finalizadas).</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Conecta aquí tu tabla de rifas (GET /api/admin/raffles) y acciones de edición/eliminación.
      </div>
    </main>
  );
}
