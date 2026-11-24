"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Star } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { MovieCard } from "@/components/movies/movie-card";
import { Button } from "@/components/ui/button";
import {
  tmdbMovieRepository,
  type MovieCrewCredit,
  type MovieDetails,
  type MovieDetailsResult,
} from "@/lib/data/movies";

type DetailState =
  | { status: "loading" }
  | { status: "ready"; movie: MovieDetails }
  | {
      status: "error";
      reason: Exclude<
        Extract<MovieDetailsResult, { ok: false }>["reason"],
        "aborted"
      >;
    };

const crewJobLabels: Record<string, string> = {
  Director: "Dirección",
  Writer: "Guion",
  Screenplay: "Guion",
  Story: "Historia",
  Producer: "Producción",
  "Executive Producer": "Producción ejecutiva",
  "Original Music Composer": "Música",
  "Director of Photography": "Fotografía",
};

function getErrorMessage(
  reason: Exclude<
    Extract<MovieDetailsResult, { ok: false }>["reason"],
    "aborted"
  >,
) {
  if (reason === "not-found") return "No encontramos esta película.";
  if (reason === "not-configured") {
    return "El catálogo aún no está configurado. Intenta de nuevo más tarde.";
  }
  if (reason === "invalid-data") {
    return "No pudimos interpretar la información de esta película.";
  }
  if (reason === "invalid-id") {
    return "El identificador de la película no es válido.";
  }
  return "No pudimos cargar la película. Intenta de nuevo.";
}

function formatRuntime(runtime: number | null) {
  if (runtime === null) return "Duración no disponible";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function getVisibleCredits(crew: MovieCrewCredit[]) {
  const priorityJobs = new Set(Object.keys(crewJobLabels));
  const selected = crew.filter((credit) => priorityJobs.has(credit.job));
  return (selected.length > 0 ? selected : crew).slice(0, 8);
}

function DetailLoadingState() {
  return (
    <div role="status" aria-label="Cargando detalle de película">
      <div className="grid gap-8 border-b border-border py-8 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div className="mx-auto aspect-2/3 w-full max-w-56 animate-pulse bg-(--surface)" />
        <div className="animate-pulse space-y-4 py-2">
          <div className="h-4 w-32 bg-(--surface)" />
          <div className="h-10 w-3/4 bg-(--surface)" />
          <div className="h-4 w-1/2 bg-(--surface)" />
          <div className="mt-8 h-4 w-full bg-(--surface)" />
          <div className="h-4 w-5/6 bg-(--surface)" />
          <div className="h-4 w-2/3 bg-(--surface)" />
        </div>
      </div>
      <div className="grid gap-4 py-8 sm:grid-cols-2">
        <div className="h-36 animate-pulse bg-(--surface)" />
        <div className="h-36 animate-pulse bg-(--surface)" />
      </div>
    </div>
  );
}

function CastMemberCard({
  name,
  character,
  profilePath,
}: {
  name: string;
  character: string | null;
  profilePath: string | null;
}) {
  return (
    <li className="min-w-0">
      <div className="relative aspect-2/3 overflow-hidden border border-border bg-(--surface)">
        {profilePath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w185${profilePath}`}
            alt={`Fotografía de ${name}`}
            fill
            sizes="(max-width: 640px) 40vw, 160px"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center px-3 text-center text-xs text-(--fg-muted)"
            role="img"
            aria-label={`Fotografía no disponible para ${name}`}
          >
            Sin fotografía
          </div>
        )}
      </div>
      <p className="mt-3 truncate text-sm font-medium text-(--fg)">{name}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--fg-secondary)">
        {character ?? "Personaje no disponible"}
      </p>
    </li>
  );
}

export function ProtectedMovieDetailPage({ movieId }: { movieId: number }) {
  const router = useRouter();
  const { state: session } = useSession();
  const isAuthenticated =
    session.status === "ready" && session.user !== null;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    if (session.status === "ready" && session.user === null) {
      router.replace("/");
    }
  }, [router, session]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();
    void tmdbMovieRepository
      .getMovieDetails(movieId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        if (result.ok) {
          setState({ status: "ready", movie: result.movie });
        } else if (result.reason !== "aborted") {
          setState({ status: "error", reason: result.reason });
        }
      });

    return () => controller.abort();
  }, [attempt, isAuthenticated, movieId]);

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

  const movie = state.status === "ready" ? state.movie : null;
  const year = movie?.releaseDate?.match(/^\d{4}/)?.[0];
  const posterUrl = movie?.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;
  const backdropUrl = movie?.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
    : null;
  const visibleCredits = movie ? getVisibleCredits(movie.crew) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-7 sm:px-6 sm:py-10">
          <Link
            href="/peliculas"
            className="inline-flex items-center gap-2 text-sm text-(--fg-secondary) hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Volver a películas
          </Link>

          {state.status === "loading" && (
            <div className="mt-5">
              <DetailLoadingState />
            </div>
          )}

          {state.status === "error" && (
            <div className="mt-8 border-y border-border py-8" role="alert">
              <p className="text-(--fg-secondary)">
                {getErrorMessage(state.reason)}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {state.reason !== "not-found" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setState({ status: "loading" });
                      setAttempt((current) => current + 1);
                    }}
                  >
                    Volver a intentar
                  </Button>
                )}
                <Link
                  href="/peliculas"
                  className="inline-flex h-10 items-center px-3 text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                >
                  Ir al catálogo
                </Link>
              </div>
            </div>
          )}

          {movie && (
            <>
              <header className="relative isolate mt-5 overflow-hidden border-b border-border bg-(--surface)">
                {backdropUrl && (
                  <Image
                    src={backdropUrl}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover opacity-30"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(0deg,#131418_0%,rgba(19,20,24,0.78)_58%,rgba(19,20,24,0.24)_100%)]"
                />
                <div className="relative flex min-h-64 items-end px-5 py-7 sm:min-h-80 sm:px-8 sm:py-9">
                  <div className="max-w-4xl">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                      Detalle de película
                    </p>
                    <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl lg:text-6xl">
                      {movie.title}
                    </h1>
                    {movie.tagline && (
                      <p className="mt-3 max-w-2xl text-sm italic leading-6 text-(--fg-secondary) sm:text-base">
                        {movie.tagline}
                      </p>
                    )}
                  </div>
                </div>
              </header>

              <div className="grid gap-7 border-b border-border py-7 sm:gap-9 sm:py-9 md:grid-cols-[minmax(0,15rem)_1fr]">
                <div className="mx-auto w-full max-w-60">
                  <div className="relative aspect-2/3 overflow-hidden border border-border bg-(--surface)">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={`Póster de ${movie.title}`}
                        fill
                        priority
                        sizes="(max-width: 640px) 80vw, 240px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center px-4 text-center text-sm text-(--fg-muted)"
                        role="img"
                        aria-label={`Póster no disponible para ${movie.title}`}
                      >
                        Póster no disponible
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-5 font-mono text-xs text-(--fg-secondary) sm:text-sm">
                    <span>{year ?? "Año no disponible"}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 aria-hidden="true" size={15} />
                      {formatRuntime(movie.runtime)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star aria-hidden="true" size={15} />
                      {movie.voteAverage === null
                        ? "Sin puntuación"
                        : `${movie.voteAverage.toFixed(1)} / 10`}
                    </span>
                  </div>

                  <section className="border-b border-border py-5" aria-labelledby="genres-title">
                    <h2
                      id="genres-title"
                      className="font-mono text-xs uppercase tracking-[0.14em] text-(--fg-muted)"
                    >
                      Géneros
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
                      {movie.genres.length > 0
                        ? movie.genres.map((genre) => genre.name).join(" · ")
                        : "Géneros no disponibles."}
                    </p>
                  </section>

                  <section className="pt-5" aria-labelledby="synopsis-title">
                    <h2
                      id="synopsis-title"
                      className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                    >
                      Sinopsis
                    </h2>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-(--fg-secondary) sm:text-base">
                      {movie.overview || "Sinopsis no disponible."}
                    </p>
                  </section>
                </div>
              </div>

              <section className="border-b border-border py-7 sm:py-9" aria-labelledby="cast-title">
                <div className="mb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                    En pantalla
                  </p>
                  <h2
                    id="cast-title"
                    className="mt-2 font-(family-name:--font-title) text-2xl font-semibold text-(--fg) sm:text-3xl"
                  >
                    Reparto
                  </h2>
                </div>
                {movie.cast.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                    {movie.cast.slice(0, 8).map((person) => (
                      <CastMemberCard
                        key={`${person.id}-${person.character ?? ""}`}
                        name={person.name}
                        character={person.character}
                        profilePath={person.profilePath}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="border-y border-border py-6 text-sm text-(--fg-secondary)" role="status">
                    Reparto no disponible.
                  </p>
                )}
              </section>

              <section className="border-b border-border py-7 sm:py-9" aria-labelledby="credits-title">
                <div className="mb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                    Detrás de cámara
                  </p>
                  <h2
                    id="credits-title"
                    className="mt-2 font-(family-name:--font-title) text-2xl font-semibold text-(--fg) sm:text-3xl"
                  >
                    Créditos principales
                  </h2>
                </div>
                {visibleCredits.length > 0 ? (
                  <ul className="grid gap-x-8 sm:grid-cols-2">
                    {visibleCredits.map((credit, index) => (
                      <li
                        key={`${credit.id}-${credit.job}-${index}`}
                        className="flex items-start justify-between gap-4 border-t border-border py-3"
                      >
                        <span className="text-sm text-(--fg)">{credit.name}</span>
                        <span className="shrink-0 text-right text-xs text-(--fg-secondary)">
                          {crewJobLabels[credit.job] ?? credit.job}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-y border-border py-6 text-sm text-(--fg-secondary)" role="status">
                    Créditos no disponibles.
                  </p>
                )}
              </section>

              <section className="py-7 sm:py-9" aria-labelledby="similar-title">
                <div className="mb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                    Sigue explorando
                  </p>
                  <h2
                    id="similar-title"
                    className="mt-2 font-(family-name:--font-title) text-2xl font-semibold text-(--fg) sm:text-3xl"
                  >
                    Películas similares
                  </h2>
                </div>
                {movie.similar.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5">
                    {movie.similar.slice(0, 10).map((similarMovie, index) => (
                      <li key={similarMovie.id}>
                        <MovieCard
                          movie={similarMovie}
                          compact
                          priority={index === 0}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-y border-border py-6 text-sm text-(--fg-secondary)" role="status">
                    No hay películas similares disponibles.
                  </p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
