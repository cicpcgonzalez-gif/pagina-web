import Link from "next/link"

export default function RifasPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-3">Rifas</h1>
      <p className="text-white/70 mb-6">
        Esta ruta ya está activa. Si quieres, aquí conectamos el listado real de rifas del backend.
      </p>
      <div className="flex gap-3">
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/login">
          Iniciar sesión
        </Link>
        <Link className="rounded-lg px-4 py-2 bg-white/10 hover:bg-white/20 transition" href="/register">
          Registrarse
        </Link>
      </div>
    </main>
  )
}
