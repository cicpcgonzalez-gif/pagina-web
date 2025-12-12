export default function AdminFraudPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Riesgos y fraude</h1>
      <p className="mt-2 text-white/80">Alertas, listas negras y scoring de riesgo.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Integra aquí tu motor de fraude/alertas y la gestión de listas negras. Acceso reservado a superadmin.
      </div>
    </main>
  );
}
