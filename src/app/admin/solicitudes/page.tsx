import { AccessRequestManager } from "@/components/admin/access-request-manager";
import { AdminSection } from "@/components/admin/admin-section";

export default function AdminAccessRequestsPage() {
  return (
    <AdminSection
      active="requests"
      title="Solicitudes de acceso"
      description="Revisa las solicitudes locales de egresados y trabajadores sin correo institucional."
    >
      <AccessRequestManager />
    </AdminSection>
  );
}
