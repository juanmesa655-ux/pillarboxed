"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { MovieCard } from "@/components/movies/movie-card";
import {
  tmdbMovieRepository,
  type MovieSummary,
  type SearchMoviesResult,
} from "@/lib/data/movies";
import { useSession } from "@/components/auth/session-provider";

type SearchResultsState =
  | { status: "idle" | "loading" }
  | { status: "empty" }
  | { status: "ready"; movies: MovieSummary[]; totalResults: number }
  | {
      status: "error";
      reason: Exclude<Extract<SearchMoviesResult, { ok: false }>["reason"], "aborted">;
    };

function errorMessage(
  reason: Exclude<Extract<SearchMoviesResult, { ok: false }>["reason"], "aborted">,
) {
  if (reason === "not-configured") {
    return "El catálogo aún no está configurado. Intenta de nuevo más tarde.";
  }
  if (reason === "invalid-query") {
    return "La búsqueda no tiene un título válido. Intenta de nuevo.";
  }
  if (reason === "invalid-data") {
    return "No pudimos interpretar los resultados de búsqueda.";
  }
  return "No pudimos cargar la búsqueda. Intenta de nuevo.";
}

function SearchLoadingState() {
  return (
    <ul
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5"
      role="status"
      aria-label="Cargando resultados de búsqueda"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <li key={index} className="animate-pulse">
          <div className="aspect-2/3 border border-border bg-(--surface)" />
          <div className="mt-3 h-4 w-3/4 bg-(--surface)" />
          <div className="mt-2 h-3 w-1/2 bg-(--surface)" />
        </li>
      ))}
    </ul>
  );
}

export function ProtectedSearchPage({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const { state: session } = useSession();
  const query = initialQuery.trim();
  const isAuthenticated =
    session.status === "ready" && session.user !== null;
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState<SearchResultsState>(
    query ? { status: "loading" } : { status: "idle" },
  );

  useEffect(() => {
    if (session.status === "ready" && session.user === null) {
      router.replace("/");
    }
  }, [router, session]);

  useEffect(() => {
    if (!isAuthenticated || !query) return;

    const controller = new AbortController();
    void tmdbMovieRepository
      .searchMovies(query, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        if (result.ok) {
          setResults(
            result.movies.length === 0
              ? { status: "empty" }
              : {
                  status: "ready",
                  movies: result.movies,
                  totalResults: result.totalResults,
                },
          );
          return;
        }

        if (result.reason !== "aborted") {
          setResults({ status: "error", reason: result.reason });
        }
      });

    return () => controller.abort();
  }, [attempt, isAuthenticated, query]);

  if (session.status === "loading" || (session.status === "ready" && !session.user)) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando tu sesión...
        </p>
      </main>
    );
  }

  if (session.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="max-w-lg text-center text-sm leading-6 text-(--error)" role="alert">
          No pudimos comprobar la sesión de prueba. Recarga la página para
          intentarlo de nuevo.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Catálogo
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Resultados de búsqueda
            </h1>
            <form
              action="/buscar"
              method="get"
              role="search"
              className="mt-6 flex max-w-160 gap-2"
            >
              <label htmlFor="movie-search-results" className="sr-only">
                Buscar películas por título
              </label>
              <input
                id="movie-search-results"
                name="q"
                type="search"
                defaultValue={query}
                maxLength={100}
                placeholder="Nombre de la película"
                className="h-11 min-w-0 flex-1 rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none placeholder:text-(--fg-muted) focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
              />
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-[3px] bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-(--accent-hover) sm:px-6"
              >
                Buscar
              </Button>
            </form>
            {query && (
              <p className="mt-4 text-sm text-(--fg-secondary)">
                Resultados para{" "}
                <span className="font-medium text-(--fg)">“{query}”</span>
              </p>
            )}
          </header>

          <section className="py-7 sm:py-9" aria-live="polite">
            {results.status === "idle" && (
              <p className="border-y border-border py-8 text-(--fg-secondary)" role="status">
                Busca una película por título para ver los resultados.
              </p>
            )}
            {results.status === "loading" && <SearchLoadingState />}
            {results.status === "empty" && (
              <p className="border-y border-border py-8 text-(--fg-secondary)" role="status">
                No encontramos películas con ese título.
              </p>
            )}
            {results.status === "error" && (
              <div className="border-y border-border py-8" role="alert">
                <p className="text-(--fg-secondary)">
                  {errorMessage(results.reason)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setResults({ status: "loading" });
                    setAttempt((current) => current + 1);
                  }}
                >
                  Volver a intentar
                </Button>
              </div>
            )}
            {results.status === "ready" && (
              <>
                <p className="mb-6 font-mono text-xs text-(--fg-muted)">
                  {new Intl.NumberFormat("es-CO").format(results.totalResults)}{" "}
                  {results.totalResults === 1 ? "resultado" : "resultados"}
                </p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5">
                  {results.movies.map((movie, index) => (
                    <li key={movie.id}>
                      <MovieCard movie={movie} priority={index === 0} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
