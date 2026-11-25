import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { TrendingMovies } from "@/components/movies/trending-movies";

export const metadata: Metadata = {
  title: "Películas populares | Pillarboxed",
  description:
    "Descubre las películas que están marcando tendencia en la comunidad.",
};

export default function MoviesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-300 px-6 py-12 md:py-16">
          <header className="mb-9 border-b border-border pb-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Catálogo
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) md:text-5xl">
              Películas populares
            </h1>
            <p className="mt-4 max-w-152.5 leading-7 text-(--fg-secondary)">
              Historias que están marcando tendencia esta semana.
            </p>
          </header>
          <TrendingMovies />
        </main>
      </div>
      <Footer />
    </div>
  );
}
