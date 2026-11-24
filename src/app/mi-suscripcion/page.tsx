import type { Metadata } from "next";
import { DemoMembershipControl } from "@/components/membership/demo-membership-control";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Mi suscripción | Pillarboxed",
  description:
    "Consulta tu nivel de membresía y cambia el estado de prueba de tu cuenta.",
};

export default function MySubscriptionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Cuenta · Demostración
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Mi suscripción
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Consulta el nivel de esta cuenta y prueba las funciones
              disponibles para Miembro colaborador.
            </p>
          </header>

          <div className="py-7">
            <DemoMembershipControl />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
