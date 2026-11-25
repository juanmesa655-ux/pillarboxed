import type { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function CurationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["curador", "administrador"]}>
      {children}
    </RoleGuard>
  );
}
