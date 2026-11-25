import type { Metadata } from "next";
import { Check } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Membresías | Pillarboxed",
  description:
    "Conoce la membresía de Pillarboxed y sus beneficios.",
};

const memberBenefits = [
  "Catálogo de películas, búsqueda y detalles",
  "Ver eventos y la cartelera",
  "Votar en ciclos con peso x1",
  "Recibir y responder invitaciones a butacas",
  "Notificaciones internas",
];

const collaboratorBenefits = [
  "Voto con peso x2",
  "Crear butacas compartidas",
  "Personalizar el perfil",
  "Insignia de verificación «Colaborador»",
];

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6">
          <Check
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function MembershipPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-250 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Membresías
          </h1>

          <aside className="mt-6 border-l-2 border-(--info) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
            El precio de Miembro colaborador es provisional. En este prototipo
            no se realizan cobros reales; para intentar un pago futuro primero
            deberás iniciar sesión.
          </aside>

          <section
            aria-label="Opciones de membresía"
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <article className="border border-border bg-(--surface) p-6 sm:p-8">
              <header>
                <h2 className="font-(family-name:--font-title) text-3xl font-semibold text-(--fg)">
                  Miembro
                </h2>
              </header>

              <dl className="mt-6 border-y border-border py-4">
                <div>
                  <dt className="text-xs text-(--fg-muted)">Precio</dt>
                  <dd className="mt-1 text-lg font-semibold text-(--fg)">
                    Gratis
                  </dd>
                </div>
              </dl>

              <BenefitList items={memberBenefits} />
              <p className="mt-5 text-xs leading-5 text-(--fg-muted)">
                El registro personal, las reseñas, el seguimiento y los foros
                están previstos para la Fase 2.
              </p>
            </article>

            <article className="border border-(--accent)/60 bg-(--surface) p-6 sm:p-8">
              <header>
                <h2 className="font-(family-name:--font-title) text-3xl font-semibold text-(--fg)">
                  Miembro colaborador
                </h2>
              </header>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4">
                <div>
                  <dt className="text-xs text-(--fg-muted)">
                    Precio provisional
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-(--fg)">
                    $20.000 COP
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-(--fg-muted)">Duración</dt>
                  <dd className="mt-1 text-sm text-(--fg)">
                    Un semestre
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-sm text-(--fg-secondary)">
                Además de los beneficios de Miembro:
              </p>
              <BenefitList items={collaboratorBenefits} />
              <p className="mt-5 text-xs leading-5 text-(--fg-muted)">
                Si cancelas, conservas estos beneficios hasta el final del
                periodo pagado. La cancelación no genera un reembolso
                automático.
              </p>
              <div className="mt-6">
                <AuthDialog
                  loginOnly
                  loginLabel="Inicia sesión para continuar"
                  loginButton
                />
              </div>
            </article>
          </section>

          <p className="mt-8 text-sm leading-6 text-(--fg-secondary)">
            Las funciones gratuitas se mantienen disponibles aunque no tengas
            una suscripción.
          </p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
