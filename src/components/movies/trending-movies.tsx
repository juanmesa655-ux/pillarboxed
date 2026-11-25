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

type TrendingMoviesLayout = "grid" | "horizontal" | "featured-poster";

function LoadingMovies({
  layout,
  source,
}: {
  layout: TrendingMoviesLayout;
  source: "trending" | "classics";
}) {
    const listClassName =
      layout === "featured-poster"
        ? "mx-auto w-full max-w-80 lg:mx-0"
        : layout === "horizontal"
        ? "flex gap-4 overflow-x-auto pb-2 sm:gap-6 lg:justify-center lg:gap-4 lg:overflow-x-visible"
        : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5";
  const skeletonCount =
    layout === "featured-poster" ? 1 : layout === "horizontal" ? 6 : 10;

  return (
      <ul
        className={listClassName}
      role="status"
      aria-label={
        source === "classics"
          ? "Cargando películas clásicas"
          : "Cargando películas populares"
      }
    >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <li
            key={index}
            className={`${
              layout === "featured-poster"
                ? ""
                : layout === "horizontal"
                  ? "w-36 shrink-0 sm:w-44 lg:w-[calc((100%_-_5rem)/6)] lg:max-w-44"
                  : ""
            } animate-pulse`}
          >
            <div className="aspect-2/3 border border-border bg-(--surface)" />
            {layout === "grid" && (
              <>
                <div className="mt-3 h-4 w-3/4 bg-(--surface)" />
                <div className="mt-2 h-3 w-1/2 bg-(--surface)" />
              </>
            )}
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
  source = "trending",
}: {
  layout?: TrendingMoviesLayout;
  limit?: number;
  source?: "trending" | "classics";
}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<CatalogState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const request =
      source === "classics"
        ? tmdbMovieRepository.getClassics(controller.signal)
        : tmdbMovieRepository.getTrending(controller.signal);

    void request.then((result) => {
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
  }, [attempt, source]);

  if (state.status === "loading") {
    return <LoadingMovies layout={layout} source={source} />;
  }

  if (state.status === "empty") {
    return (
      <p className="border-y border-border py-8 text-(--fg-secondary)" role="status">
        {source === "classics"
          ? "No hay películas clásicas disponibles en este momento."
          : "No hay películas populares disponibles en este momento."}
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
    layout === "featured-poster"
      ? "mx-auto w-full max-w-80 lg:mx-0"
      : layout === "horizontal"
      ? "flex gap-4 overflow-x-auto pb-2 sm:gap-6 lg:justify-center lg:gap-4 lg:overflow-x-visible"
      : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 2xl:grid-cols-5";
  const visibleMovies =
    layout === "featured-poster"
      ? [
          movies.find(
            (movie) =>
              movie.posterPath !== null && /odisea|odyssey/i.test(movie.title),
          ) ?? movies.find((movie) => movie.posterPath !== null),
        ].filter((movie): movie is MovieSummary => movie !== undefined)
      : movies;

  if (layout === "featured-poster" && visibleMovies.length === 0) {
    return (
      <p className="border-y border-border py-8 text-(--fg-secondary)" role="status">
        No hay pósteres disponibles en este momento.
      </p>
    );
  }

  return (
    <ul className={listClassName}>
      {visibleMovies.map((movie, index) => (
        <li
          key={movie.id}
          className={
            layout === "featured-poster"
              ? ""
              : layout === "horizontal"
                ? "w-36 shrink-0 sm:w-44 lg:w-[calc((100%_-_5rem)/6)] lg:max-w-44"
                : ""
          }
        >
          <MovieCard
            movie={movie}
            compact={layout === "horizontal"}
            priority={index === 0}
            posterOnly={layout === "featured-poster"}
            hideDetails={layout === "horizontal"}
          />
        </li>
      ))}
    </ul>
  );
}
