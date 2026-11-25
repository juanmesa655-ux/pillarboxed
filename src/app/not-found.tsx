import { StatusScreen } from "@/components/errors/status-screen";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="No encontramos esta página"
      description="La dirección puede haber cambiado o la página ya no está disponible."
      header={<NavbarVisitante />}
    />
  );
}
