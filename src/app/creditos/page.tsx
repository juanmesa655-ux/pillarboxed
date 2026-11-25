import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { TmdbAttribution } from "@/components/layout/tmdb-attribution";

export const metadata: Metadata = {
  title: "Créditos | Pillarboxed",
  description:
    "Consulta la atribución de TMDB y el origen de los datos de películas usados por Pillarboxed.",
};

export default function CreditsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-220 px-6 py-12 md:py-16">
          <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg)">
            Créditos
          </h1>
          <p className="mt-4 max-w-170 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
            Reconocemos las fuentes que hacen posible consultar información
            sobre películas en Pillarboxed.
          </p>

          <section
            aria-labelledby="tmdb-credit-heading"
            className="mt-9 border border-border bg-(--surface) p-6 sm:p-8"
          >
            <h2
              id="tmdb-credit-heading"
              className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
            >
              The Movie Database (TMDB)
            </h2>
            <TmdbAttribution
              className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              logoClassName="h-10 w-auto"
            />
            <p className="mt-6 max-w-170 text-sm leading-6 text-(--fg-secondary)">
              Los datos y las imágenes de películas se consultan mediante la API
              de TMDB. Pillarboxed no aloja ni reproduce películas y no está
              respaldado ni certificado por TMDB.
            </p>
          </section>

          <Link
            href="/acerca-de"
            className="mt-7 inline-flex text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Volver a preguntas frecuentes
          </Link>
        </main>
      </div>
      <Footer />
    </div>
  );
}
