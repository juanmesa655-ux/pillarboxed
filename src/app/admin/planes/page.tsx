import { AdminSection } from "@/components/admin/admin-section";
import { MembershipPlanManager } from "@/components/admin/membership-plan-manager";

export default function AdminPlansPage() {
  return (
    <AdminSection
      active="plans"
      title="Planes de membresía"
      description="Configura la oferta de Miembro colaborador y conserva el historial de sus versiones."
    >
      <MembershipPlanManager />
    </AdminSection>
  );
}
