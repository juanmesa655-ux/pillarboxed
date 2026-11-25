"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  tmdbMovieRepository,
  type MovieSummary,
  type TrendingMoviesResult,
} from "@/lib/data/movies";

type CatalogState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; movies: MovieSummary[] }
  | {
      status: "error";
      reason: Exclude<Extract<TrendingMoviesResult, { ok: false }>["reason"], "aborted">;
    };

function LoadingGrid() {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5"
      role="status"
      aria-label="Cargando películas populares"
    >
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-2/3 border border-border bg-(--surface)" />
          <div className="mt-3 h-4 w-3/4 bg-(--surface)" />
          <div className="mt-2 h-3 w-1/2 bg-(--surface)" />
        </div>
      ))}
    </div>
  );
}

function MovieCard({ movie }: { movie: MovieSummary }) {
  const year = movie.releaseDate?.match(/^\d{4}/)?.[0];
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-2/3 overflow-hidden border border-border bg-(--surface)">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`Póster de ${movie.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center px-4 text-center text-sm text-(--fg-muted)"
            role="img"
            aria-label={`Póster no disponible para ${movie.title}`}
          >
            Sin póster disponible
          </div>
        )}
      </div>
      <h2 className="mt-3 line-clamp-2 font-(family-name:--font-title) text-lg font-semibold leading-tight text-(--fg)">
        {movie.title}
      </h2>
      <p className="mt-2 flex flex-wrap gap-x-2 font-mono text-xs text-(--fg-secondary)">
        <span>{year ?? "Año no disponible"}</span>
        <span aria-hidden="true">·</span>
        <span>
          {movie.voteAverage === null
            ? "Sin puntuación"
            : `${movie.voteAverage.toFixed(1)} / 10`}
        </span>
      </p>
      {movie.overview ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-(--fg-secondary)">
          {movie.overview}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-(--fg-muted)">
          Sin sinopsis disponible.
        </p>
      )}
    </article>
  );
}

function errorMessage(
  reason: Exclude<Extract<TrendingMoviesResult, { ok: false }>["reason"], "aborted">,
) {
  if (reason === "not-configured") {
    return "El catálogo aún no está configurado. Intenta de nuevo más tarde.";
  }
  if (reason === "invalid-data") {
    return "No pudimos interpretar la respuesta del catálogo. Intenta de nuevo.";
  }
  return "No pudimos cargar las películas. Intenta de nuevo.";
}

export function TrendingMovies() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<CatalogState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    void tmdbMovieRepository.getTrending(controller.signal).then((result) => {
      if (controller.signal.aborted) return;

      if (result.ok) {
        setState(
          result.movies.length === 0
            ? { status: "empty" }
            : { status: "ready", movies: result.movies },
        );
        return;
      }

      if (result.reason !== "aborted") {
        setState({ status: "error", reason: result.reason });
      }
    });

    return () => controller.abort();
  }, [attempt]);

  if (state.status === "loading") {
    return <LoadingGrid />;
  }

  if (state.status === "empty") {
    return (
      <p className="border-y border-border py-8 text-(--fg-secondary)" role="status">
        No hay películas populares disponibles en este momento.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="border-y border-border py-8" role="alert">
        <p className="text-(--fg-secondary)">{errorMessage(state.reason)}</p>
        <Button
          className="mt-5"
          type="button"
          variant="outline"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
        >
          Volver a intentar
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5">
      {state.movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
