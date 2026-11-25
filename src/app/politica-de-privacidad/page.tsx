import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Política de privacidad | Pillarboxed",
  description:
    "Borrador de política de privacidad de Pillarboxed, pendiente de validación institucional.",
};

const draftNotice =
  "Borrador de trabajo pendiente de validación institucional. No es una política vigente ni debe usarse como texto legal definitivo.";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-190 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Política de privacidad
          </h1>
          <p className="mt-4 text-sm text-(--fg-muted)">
            Estado: borrador pendiente de revisión institucional.
          </p>

          <aside className="mt-6 border-l-2 border-(--info) bg-(--surface) px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
            {draftNotice}
          </aside>

          <div className="mt-8 space-y-8 leading-7 text-(--fg-secondary)">
            <section aria-labelledby="privacy-controller">
              <h2
                id="privacy-controller"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Responsable del tratamiento
              </h2>
              <p className="mt-3">
                Pendiente de definir con la IU Pascual Bravo: la persona o
                entidad responsable del tratamiento, sus datos de contacto y el
                canal oficial para consultas y reclamos.
              </p>
            </section>

            <section aria-labelledby="privacy-data">
              <h2
                id="privacy-data"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Datos y funcionamiento actual
              </h2>
              <p className="mt-3">
                El formulario de registro es demostrativo: solicita nombre,
                apellidos, correo institucional, carrera, semestre y
                contraseña, pero no crea una cuenta ni guarda esos datos en un
                servidor.
              </p>
              <p className="mt-3">
                El formulario de solicitud de acceso pide nombre, correo,
                relación con la institución y motivo. En esta versión, esos
                datos se guardan únicamente en el almacenamiento local de este
                navegador; no se envían a un administrador ni a un servidor de
                Pillarboxed. No hay un plazo automático de eliminación: la
                solicitud permanece en el navegador hasta que se borren sus
                datos locales.
              </p>
            </section>

            <section aria-labelledby="privacy-purpose">
              <h2
                id="privacy-purpose"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Finalidades y conservación
              </h2>
              <p className="mt-3">
                Las finalidades del tratamiento, la base aplicable y los plazos
                de conservación para una futura versión deben ser definidos y
                aprobados por la institución antes de habilitar cuentas o
                trasladar solicitudes a un servidor.
              </p>
            </section>

            <section aria-labelledby="privacy-rights">
              <h2
                id="privacy-rights"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Tus derechos y cómo ejercerlos
              </h2>
              <p className="mt-3">
                El proyecto contempla mecanismos para consultar, corregir y
                solicitar la eliminación de datos. El procedimiento, los
                tiempos de respuesta y el canal oficial para hacerlo están
                pendientes de definición institucional.
              </p>
            </section>

            <section aria-labelledby="privacy-security">
              <h2
                id="privacy-security"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Seguridad y versión de prueba
              </h2>
              <p className="mt-3">
                Pillarboxed está en fase de prototipo y no ofrece garantías de
                seguridad para datos reales. Evita ingresar información
                personal o contraseñas que uses en otros servicios. Las
                medidas de seguridad de una versión operativa deben ser
                definidas antes de su lanzamiento.
              </p>
            </section>

            <section aria-labelledby="privacy-validity">
              <h2
                id="privacy-validity"
                className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
              >
                Vigencia y cambios
              </h2>
              <p className="mt-3">
                La fecha de entrada en vigor y el historial de versiones se
                definirán cuando la política sea revisada y aprobada por la
                institución.
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
