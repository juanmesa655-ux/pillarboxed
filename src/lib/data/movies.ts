export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

export type TrendingMoviesResult =
  | { ok: true; movies: MovieSummary[] }
  | {
      ok: false;
      reason: "aborted" | "invalid-data" | "not-configured" | "unavailable";
    };

export interface MovieRepository {
  getTrending(signal: AbortSignal): Promise<TrendingMoviesResult>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMovieSummary(value: unknown): value is MovieSummary {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.title === "string" &&
    typeof value.overview === "string" &&
    (typeof value.posterPath === "string" || value.posterPath === null) &&
    (typeof value.releaseDate === "string" || value.releaseDate === null) &&
    (typeof value.voteAverage === "number" || value.voteAverage === null) &&
    (value.voteAverage === null || Number.isFinite(value.voteAverage))
  );
}

function isTrendingMoviesPayload(
  value: unknown,
): value is { movies: MovieSummary[] } {
  return (
    isRecord(value) &&
    Array.isArray(value.movies) &&
    value.movies.every(isMovieSummary)
  );
}

export const tmdbMovieRepository: MovieRepository = {
  async getTrending(signal) {
    let response: Response;

    try {
      response = await fetch("/api/tmdb/trending", {
        signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { ok: false, reason: "aborted" };
      }
      if (error instanceof TypeError) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    if (response.status === 503) {
      return { ok: false, reason: "not-configured" };
    }
    if (!response.ok) {
      return { ok: false, reason: "unavailable" };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, reason: "invalid-data" };
      }
      throw error;
    }

    if (!isTrendingMoviesPayload(payload)) {
      return { ok: false, reason: "invalid-data" };
    }

    return { ok: true, movies: payload.movies };
  },
};
