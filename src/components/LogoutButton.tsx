"use client";

import { clearAuthToken } from "@/lib/session";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
    // Opcional: forzar un refresh para limpiar cualquier estado en memoria
    // window.location.href = "/login";
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Cerrar Sesión
    </Button>
  );
}
