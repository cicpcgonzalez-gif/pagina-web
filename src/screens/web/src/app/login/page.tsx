"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "@/lib/api";
import { setAuthToken, setUserRole } from "@/lib/session";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await login({ email, password });
      const token = result.token || result.accessToken;
      if (token) {
        setAuthToken(token);
        const role = result.user?.role || "sin-rol";
        setUserRole(role);
        // Redirección basada en el rol
        if (role.toLowerCase() === "superadmin" || role.toLowerCase() === "admin") {
          router.push("/admin");
        } else {
          router.push("/perfil"); // O a la página principal para usuarios normales
        }
      } else {
        setMessage("Inicio de sesión sin token en la respuesta.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : null;
      setMessage(msg || "No se pudo iniciar sesión. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Inicia sesión en tu cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            o{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              crea una cuenta nueva
            </Link>
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-xl">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Usuario o email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Usuario o email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/recuperar" className="font-medium text-indigo-600 hover:text-indigo-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              >
                {loading ? "Verificando..." : "Entrar"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 rounded-md border border-gray-300 bg-gray-50 p-3 text-center text-sm text-gray-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
