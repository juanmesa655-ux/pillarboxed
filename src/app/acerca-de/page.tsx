import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | Pillarboxed",
  description:
    "Conoce Pillarboxed, cómo solicitar acceso y de dónde provienen los datos de películas.",
};

const faqItems = [
  {
    question: "¿Qué es Pillarboxed?",
    answer:
      "Pillarboxed es un proyecto de plataforma para reunir a la comunidad cinéfila de la IU Pascual Bravo: descubrir películas, votar por posibles proyecciones y participar en actividades del cineclub.",
  },
  {
    question: "¿Quiénes desarrollaron Pillarboxed?",
    answer:
      "Pillarboxed fue desarrollado por Juan y Jesús. Esta versión es un prototipo.",
  },
  {
    question: "¿Es gratis?",
    answer:
      "El acceso base está planteado como gratuito. La membresía opcional puede ofrecer beneficios adicionales; en este prototipo los pagos son simulados y no se realizan cobros reales.",
  },
  {
    question: "¿Cómo solicitar acceso?",
    answer: (
      <>
        Puedes registrarte con tu correo institucional de la IU Pascual Bravo.
        Si eres egresado/a o trabajas en la institución, puedes{" "}
        <Link
          href="/solicitar-acceso"
          className="text-(--fg) underline decoration-(--border-strong) underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          solicitar acceso
        </Link>
        . En este prototipo, la solicitud solo se guarda en tu navegador y no se
        envía a un administrador.
      </>
    ),
  },
  {
    question: "¿De dónde vienen los datos de las películas?",
    answer:
      "Los datos de películas se consultan mediante la API de TMDB (The Movie Database). Este producto utiliza la API de TMDB, pero no está respaldado ni certificado por TMDB.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-190 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Preguntas frecuentes
          </h1>

          <section
            aria-label="Preguntas frecuentes"
            className="mt-8 border-t border-border"
          >
            {faqItems.map((item) => (
              <details
                key={item.question}
                name="acerca-pillarboxed"
                className="group border-b border-border"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
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
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
