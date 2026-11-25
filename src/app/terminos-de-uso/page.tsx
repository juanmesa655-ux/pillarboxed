import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Términos de uso | Pillarboxed",
  description:
    "Borrador de términos de uso de Pillarboxed, pendiente de validación institucional.",
};

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-190 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Términos de uso
          </h1>
          <p className="mt-4 text-sm text-(--fg-muted)">
            Estado: borrador pendiente de revisión institucional.
          </p>

          <aside className="mt-6 border-l-2 border-(--info) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
            Este borrador no es un acuerdo vigente. Las condiciones definitivas
            deben ser revisadas y aprobadas por la IU Pascual Bravo antes de
            habilitar el servicio.
          </aside>

          <div className="mt-8 space-y-8 leading-7 text-(--fg-secondary)">
            <section aria-labelledby="terms-project">
              <h2
                id="terms-project"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Sobre el servicio
              </h2>
              <p className="mt-3">
                Pillarboxed es un prototipo para la comunidad cinéfila de la IU
                Pascual Bravo. Sus formularios y flujos pueden ser
                demostrativos; actualmente no se crean cuentas funcionales ni
                se habilitan todas las funciones descritas en el proyecto.
              </p>
            </section>

            <section aria-labelledby="terms-accounts">
              <h2
                id="terms-accounts"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Cuentas y acceso
              </h2>
              <p className="mt-3">
                El acceso previsto es para personas de la comunidad
                institucional y para egresados/as o trabajadores/as autorizados.
                Los criterios definitivos, el proceso de verificación y las
                responsabilidades de las cuentas deben ser confirmados por la
                institución.
              </p>
            </section>

            <section aria-labelledby="terms-payments">
              <h2
                id="terms-payments"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Membresías y pagos
              </h2>
              <p className="mt-3">
                En el prototipo no se realizan cobros reales. Antes de habilitar
                pagos, deberán publicarse las condiciones del plan, precio,
                vigencia, cancelaciones, reembolsos y canal de reclamos. La
                aplicación no debe almacenar datos de tarjetas.
              </p>
            </section>

            <section aria-labelledby="terms-copyright">
              <h2
                id="terms-copyright"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Películas y derechos de autor
              </h2>
              <p className="mt-3">
                Pillarboxed no aloja, almacena ni distribuye películas. La
                gestión de licencias para proyecciones corresponde a la
                institución o al grupo organizador.
              </p>
            </section>

            <section aria-labelledby="terms-content">
              <h2
                id="terms-content"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Contenido y convivencia
              </h2>
              <p className="mt-3">
                Las reseñas y los foros todavía no están disponibles. Las reglas
                de publicación, moderación y retiro de contenido deberán
                definirse antes de habilitar esas funciones.
              </p>
            </section>

            <section aria-labelledby="terms-pending">
              <h2
                id="terms-pending"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Información pendiente
              </h2>
              <p className="mt-3">
                La entidad responsable, el canal de contacto, el procedimiento
                de reclamos, la fecha de vigencia y las condiciones completas
                del servicio están pendientes de revisión y aprobación
                institucional.
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
