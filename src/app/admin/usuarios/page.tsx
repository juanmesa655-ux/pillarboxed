import { AdminSection } from "@/components/admin/admin-section";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export default function AdminUsersPage() {
  return (
    <AdminSection
      active="users"
      title="Usuarios y roles"
      description="Asigna o retira el rol de curador a las cuentas activas."
    >
      <UserRoleManager />
    </AdminSection>
  );
}
