import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Ayuda | Pillarboxed",
  description:
    "Guías para usar Pillarboxed y conocer las funciones disponibles en este prototipo.",
};

const helpSections = [
  {
    id: "cuenta-acceso",
    title: "Cuenta y acceso",
    items: [
      {
        question: "¿Cómo creo una cuenta?",
        answer: (
          <>
            En el{" "}
            <Link
              href="/"
              className="text-(--fg) underline decoration-(--border-strong) underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              inicio
            </Link>
            , selecciona «Crear cuenta» y completa el formulario. La cuenta se
            guarda como demostración en este navegador; no se envía un correo
            real. Después puedes simular la verificación e iniciar sesión. No
            uses una contraseña que tengas en otros servicios.
          </>
        ),
      },
      {
        question: "¿No tienes correo institucional?",
        answer: (
          <>
            Si eres egresado/a o trabajador/a y no tienes correo institucional,
            puedes{" "}
            <Link
              href="/solicitar-acceso"
              className="text-(--fg) underline decoration-(--border-strong) underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              solicitar acceso
            </Link>
            . Si tienes correo institucional, regístrate o inicia sesión con
            esa dirección. Por ahora, la solicitud queda guardada únicamente en
            este navegador: no se envía al administrador ni recibirás una
            respuesta desde la plataforma.
          </>
        ),
      },
      {
        question: "¿Puedo iniciar sesión o recuperar mi contraseña?",
        answer:
          "Puedes iniciar sesión con una cuenta de demostración creada en el mismo navegador. La recuperación de contraseña todavía no está disponible y no envía correos.",
      },
    ],
  },
  {
    id: "peliculas-eventos",
    title: "Películas y eventos",
    items: [
      {
        question: "¿Dónde puedo consultar películas, votaciones, funciones o butacas?",
        answer: (
          <>
            Puedes consultar películas, funciones y ciclos de votación de
            demostración. En{" "}
            <Link
              href="/eventos?tab=butacas"
              className="text-(--fg) underline decoration-(--border-strong) underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Mis butacas
            </Link>
            , puedes revisar y responder invitaciones de ejemplo; las respuestas
            se guardan en este navegador y no generan notificaciones reales.
            Todavía no se registran votos; la acción de votar estará disponible
            al habilitar el detalle de cada ciclo.
          </>
        ),
      },
    ],
  },
  {
    id: "membresia-pagos",
    title: "Membresía y pagos",
    items: [
      {
        question: "¿Qué beneficios tendría la membresía?",
        answer:
          "La propuesta contempla personalización del perfil, una insignia y participación prioritaria, como el voto ponderado y la creación de butacas compartidas. Crear butacas está disponible para Miembros colaboradores con beneficios vigentes, desde el detalle de una función próxima. Desde Ajustes de la cuenta puedes consultar tu suscripción, iniciar una simulación de pago y revisar las transacciones de prueba. No se realizan cobros reales ni se solicitan datos financieros.",
      },
      {
        question: "¿Se realiza algún cobro?",
        answer:
          "No. En esta versión de prueba no se realiza ningún cobro real; los flujos de pago son simulados.",
      },
    ],
  },
  {
    id: "problemas-contacto",
    title: "Problemas y contacto",
    items: [
      {
        question: "¿Cómo puedo contactar con soporte?",
        answer:
          "Por ahora no hay un canal de soporte activo. El correo que aparece en el footer es demostrativo y puede no estar atendido; evita enviar información personal o contraseñas.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-190 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Ayuda
          </h1>
          <p className="mt-4 leading-7 text-(--fg-secondary)">
            Guías sobre las funciones disponibles y las limitaciones de esta
            versión de prueba.
          </p>

          <div className="mt-8 space-y-10">
            {helpSections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2
                  id={section.id}
                  className="mb-3 font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                >
                  {section.title}
                </h2>
                <div className="border-t border-border">
                  {section.items.map((item) => (
                    <details
                      key={item.question}
                      name="ayuda-pillarboxed"
                      className="group border-b border-border"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                        {item.question}
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-xl text-accent"
                        >
                          <span className="group-open:hidden">+</span>
                          <span className="hidden group-open:inline">−</span>
                        </span>
                      </summary>
                      <p className="pb-5 pr-8 leading-7 text-(--fg-secondary)">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
