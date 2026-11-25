import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { PaymentCheckout } from "@/components/payments/payment-checkout";

export const metadata: Metadata = {
  title: "Pago simulado | Pillarboxed",
  description:
    "Prueba el flujo de compra o renovación de membresía sin realizar cobros.",
};

export default function PaymentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Pago simulado
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Revisa las condiciones y prueba los posibles resultados del flujo
              de membresía.
            </p>
          </header>

          <div className="py-7 sm:py-9">
            <PaymentCheckout />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
