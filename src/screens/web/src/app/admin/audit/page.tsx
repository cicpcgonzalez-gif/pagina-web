export default function AdminAuditPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-white bg-night-sky">
      <h1 className="text-3xl font-bold">Auditoría</h1>
      <p className="mt-2 text-white/80">Revisar logs de seguridad y acciones críticas.</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        Expone aquí tus logs (acciones admin/superadmin) y filtros por severidad. Acceso reservado a superadmin.
      </div>
    </main>
  );
}
