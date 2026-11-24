"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movies/movie-card";
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

function LoadingMovies({ layout }: { layout: "grid" | "horizontal" }) {
    const listClassName =
      layout === "horizontal"
        ? "flex gap-4 overflow-x-auto pb-2 sm:gap-6"
        : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5";

  return (
      <ul
        className={listClassName}
      role="status"
      aria-label="Cargando películas populares"
    >
        {Array.from({ length: layout === "horizontal" ? 5 : 10 }, (_, index) => (
          <li
            key={index}
            className={`${layout === "horizontal" ? "w-36 shrink-0 sm:w-44" : ""} animate-pulse`}
          >
            <div className="aspect-2/3 border border-border bg-(--surface)" />
            <div className="mt-3 h-4 w-3/4 bg-(--surface)" />
            <div className="mt-2 h-3 w-1/2 bg-(--surface)" />
          </li>
      ))}
      </ul>
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

export function TrendingMovies({
  layout = "grid",
  limit,
}: {
  layout?: "grid" | "horizontal";
  limit?: number;
}) {
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
    return <LoadingMovies layout={layout} />;
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

  const movies = limit === undefined ? state.movies : state.movies.slice(0, limit);
  const listClassName =
    layout === "horizontal"
      ? "flex gap-4 overflow-x-auto pb-2 sm:gap-6"
      : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5";

  return (
    <ul className={listClassName}>
      {movies.map((movie, index) => (
        <li
          key={movie.id}
          className={layout === "horizontal" ? "w-36 shrink-0 sm:w-44" : ""}
        >
          <MovieCard
            movie={movie}
            compact={layout === "horizontal"}
            priority={index === 0}
          />
        </li>
      ))}
    </ul>
  );
}
