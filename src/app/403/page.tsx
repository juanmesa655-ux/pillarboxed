import type { Metadata } from "next";
import { StatusScreen } from "@/components/errors/status-screen";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Acceso denegado | Pillarboxed",
  description: "No tienes permisos para acceder a esta sección.",
};

export default function ForbiddenPage() {
  return (
    <StatusScreen
      code="403"
      title="No tienes acceso a esta sección"
      description="Esta sección está disponible solo para las personas autorizadas. Si crees que deberías tener acceso, consulta con el equipo administrador."
      header={<NavbarVisitante />}
    />
  );
}
