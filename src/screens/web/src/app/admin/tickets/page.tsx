export default function AdminTicketsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Validar boletos</h1>
      <p className="mt-2 text-white/80">Escanea o ingresa el código del boleto para redimirlo.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Integra aquí la validación (POST /api/admin/tickets/validate) y feedback al operador.
      </div>
    </main>
  );
}
