import Image from "next/image";
import Link from "next/link";
import type { MovieSummary } from "@/lib/data/movies";

export function MovieCard({
  movie,
  compact = false,
  priority = false,
}: {
  movie: MovieSummary;
  compact?: boolean;
  priority?: boolean;
}) {
  const year = movie.releaseDate?.match(/^\d{4}/)?.[0];
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  return (
    <article className="group min-w-0">
      <Link
        href={`/peliculas/${movie.id}`}
        className="block rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <div className="relative aspect-2/3 overflow-hidden border border-border bg-(--surface)">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={`Póster de ${movie.title}`}
              fill
              loading={priority ? "eager" : "lazy"}
              sizes={
                compact
                  ? "(max-width: 640px) 40vw, 190px"
                  : "(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 20vw"
              }
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
        <h2
          className={`mt-3 line-clamp-2 font-(family-name:--font-title) font-semibold leading-tight text-(--fg) group-hover:text-accent ${
            compact ? "text-base" : "text-lg"
          }`}
        >
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
      </Link>
      {!compact &&
        (movie.overview ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-(--fg-secondary)">
            {movie.overview}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-(--fg-muted)">
            Sin sinopsis disponible.
          </p>
        ))}
    </article>
  );
}
