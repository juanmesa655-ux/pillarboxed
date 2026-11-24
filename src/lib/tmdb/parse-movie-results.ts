import type { MovieSummary } from "@/lib/data/movies";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMovie(value: unknown): MovieSummary | null {
  if (!isRecord(value)) return null;

  const { id, title, overview, poster_path, release_date, vote_average } = value;

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    (overview !== undefined &&
      overview !== null &&
      typeof overview !== "string") ||
    (poster_path !== undefined &&
      poster_path !== null &&
      typeof poster_path !== "string") ||
    (release_date !== undefined &&
      release_date !== null &&
      typeof release_date !== "string") ||
    (vote_average !== undefined &&
      vote_average !== null &&
      (typeof vote_average !== "number" || !Number.isFinite(vote_average)))
  ) {
    return null;
  }

  const posterPath = typeof poster_path === "string" ? poster_path : null;
  if (posterPath !== null && !posterPath.startsWith("/")) return null;

  return {
    id,
    title,
    overview: typeof overview === "string" ? overview : "",
    posterPath,
    releaseDate: typeof release_date === "string" ? release_date : null,
    voteAverage: typeof vote_average === "number" ? vote_average : null,
  };
}

export function parseTmdbMovieResults(
  payload: unknown,
): MovieSummary[] | null {
  if (!isRecord(payload) || !Array.isArray(payload.results)) return null;

  const movies: MovieSummary[] = [];
  for (const result of payload.results) {
    const movie = parseMovie(result);
    if (movie === null) return null;
    movies.push(movie);
  }

  return movies;
}
