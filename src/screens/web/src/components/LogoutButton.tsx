"use client";

import { removeAuthToken, removeUserRole } from "@/lib/session";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    removeUserRole();
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
