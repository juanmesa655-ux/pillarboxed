import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { TransactionHistory } from "@/components/payments/transaction-history";

export const metadata: Metadata = {
  title: "Mis transacciones | Pillarboxed",
  description: "Consulta el historial de transacciones simuladas de tu cuenta.",
};

export default function TransactionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Mis transacciones
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Consulta los resultados de las pruebas de compra y renovación de
              membresía.
            </p>
          </header>

          <div className="py-7 sm:py-9">
            <TransactionHistory />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
