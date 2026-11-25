export type MovieSummary = {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
};

export type MovieGenre = {
  id: number;
  name: string;
};

export type MovieCastMember = {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
};

export type MovieCrewCredit = {
  id: number;
  name: string;
  job: string;
  profilePath: string | null;
};

export type MovieDetails = MovieSummary & {
  backdropPath: string | null;
  tagline: string | null;
  runtime: number | null;
  genres: MovieGenre[];
  cast: MovieCastMember[];
  crew: MovieCrewCredit[];
  similar: MovieSummary[];
};

export type TrendingMoviesResult =
  | { ok: true; movies: MovieSummary[] }
  | {
      ok: false;
      reason: "aborted" | "invalid-data" | "not-configured" | "unavailable";
    };

export type MovieDetailsResult =
  | { ok: true; movie: MovieDetails }
  | {
      ok: false;
      reason:
        | "aborted"
        | "invalid-data"
        | "invalid-id"
        | "not-configured"
        | "not-found"
        | "unavailable";
    };

export type SearchMoviesResult =
  | { ok: true; movies: MovieSummary[]; totalResults: number }
  | {
      ok: false;
      reason:
        | "aborted"
        | "invalid-data"
        | "invalid-query"
        | "not-configured"
        | "unavailable";
    };

export interface MovieRepository {
  getTrending(signal: AbortSignal): Promise<TrendingMoviesResult>;
  getClassics(signal: AbortSignal): Promise<TrendingMoviesResult>;
  getMovieDetails(
    id: number,
    signal: AbortSignal,
  ): Promise<MovieDetailsResult>;
  searchMovies(query: string, signal: AbortSignal): Promise<SearchMoviesResult>;
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

function hasMovieSummaryShape(value: Record<string, unknown>): boolean {
  return isMovieSummary(value);
}

function isMovieGenre(value: unknown): value is MovieGenre {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string"
  );
}

function isMovieCastMember(value: unknown): value is MovieCastMember {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string" &&
    (typeof value.character === "string" || value.character === null) &&
    (typeof value.profilePath === "string" || value.profilePath === null)
  );
}

function isMovieCrewCredit(value: unknown): value is MovieCrewCredit {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string" &&
    typeof value.job === "string" &&
    (typeof value.profilePath === "string" || value.profilePath === null)
  );
}

function isMovieDetails(value: unknown): value is MovieDetails {
  if (!isRecord(value)) return false;

  const details: Record<string, unknown> = value;
  const validSummary = hasMovieSummaryShape(details);
  if (!validSummary) return false;

  return (
    (typeof details.backdropPath === "string" ||
      details.backdropPath === null) &&
    (typeof details.tagline === "string" || details.tagline === null) &&
    (typeof details.runtime === "number" || details.runtime === null) &&
    (details.runtime === null ||
      (Number.isSafeInteger(details.runtime) && details.runtime >= 0)) &&
    Array.isArray(details.genres) &&
    details.genres.every(isMovieGenre) &&
    Array.isArray(details.cast) &&
    details.cast.every(isMovieCastMember) &&
    Array.isArray(details.crew) &&
    details.crew.every(isMovieCrewCredit) &&
    Array.isArray(details.similar) &&
    details.similar.every(isMovieSummary)
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

async function getMovieList(
  path: string,
  signal: AbortSignal,
): Promise<TrendingMoviesResult> {
  let response: Response;

  try {
    response = await fetch(path, {
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
}

function isSearchMoviesPayload(
  value: unknown,
): value is { movies: MovieSummary[]; totalResults: number } {
  return (
    isRecord(value) &&
    Array.isArray(value.movies) &&
    value.movies.every(isMovieSummary) &&
    typeof value.totalResults === "number" &&
    Number.isSafeInteger(value.totalResults) &&
    value.totalResults >= 0
  );
}

export const tmdbMovieRepository: MovieRepository = {
  getTrending(signal) {
    return getMovieList("/api/tmdb/trending", signal);
  },

  getClassics(signal) {
    return getMovieList("/api/tmdb/classics", signal);
  },

  async getMovieDetails(id, signal) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      return { ok: false, reason: "invalid-id" };
    }

    let response: Response;
    try {
      response = await fetch(`/api/tmdb/movie/${id}`, {
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

    if (response.status === 400) {
      return { ok: false, reason: "invalid-id" };
    }
    if (response.status === 404) {
      return { ok: false, reason: "not-found" };
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

    if (!isRecord(payload) || !isMovieDetails(payload.movie)) {
      return { ok: false, reason: "invalid-data" };
    }

    return { ok: true, movie: payload.movie };
  },

  async searchMovies(query, signal) {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length === 0 || normalizedQuery.length > 100) {
      return { ok: false, reason: "invalid-query" };
    }

    let response: Response;
    try {
      response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(normalizedQuery)}`,
        {
          signal,
          cache: "no-store",
          headers: { Accept: "application/json" },
        },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { ok: false, reason: "aborted" };
      }
      if (error instanceof TypeError) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    if (response.status === 400) {
      return { ok: false, reason: "invalid-query" };
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

    if (!isSearchMoviesPayload(payload)) {
      return { ok: false, reason: "invalid-data" };
    }

    return {
      ok: true,
      movies: payload.movies,
      totalResults: payload.totalResults,
    };
  },
};
