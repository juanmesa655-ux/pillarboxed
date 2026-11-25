import type { Metadata } from "next";
import { AccessRequestForm } from "@/components/access/access-request-form";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Solicitar acceso | Pillarboxed",
  description:
    "Solicita acceso a Pillarboxed si no tienes correo institucional de la IU Pascual Bravo.",
};

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-190 px-6 py-12 md:py-16">
          <h1 className="mt-4 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Solicitar acceso
          </h1>
          <p className="mt-4 mb-8 leading-7 text-(--fg-secondary)">
            Si eres egresado/a o trabajas en la IU Pascual Bravo, cuéntanos un
            poco sobre ti. Un administrador revisaría tu solicitud antes de
            habilitar el acceso.
          </p>
          <AccessRequestForm />
        </main>
      </div>
      <Footer />
    </div>
  );
}
