import { AdminSection } from "@/components/admin/admin-section";
import { AdminTransactionList } from "@/components/admin/admin-transaction-list";

export default function AdminTransactionsPage() {
  return (
    <AdminSection
      active="transactions"
      title="Todas las transacciones"
      description="Consulta los registros simulados de las cuentas, sus estados y vigencias."
    >
      <AdminTransactionList />
    </AdminSection>
  );
}
