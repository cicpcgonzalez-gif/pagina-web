export default function AdminReportsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Reportes</h1>
      <p className="mt-2 text-white/80">Ventas por fecha, estado de sorteos y liquidaciones.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Usa aquí GET /api/admin/reports para mostrar métricas y exportar datos.
      </div>
    </main>
  );
}
