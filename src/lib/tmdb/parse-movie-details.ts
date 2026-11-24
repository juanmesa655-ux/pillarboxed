import type {
  MovieCastMember,
  MovieCrewCredit,
  MovieDetails,
  MovieGenre,
} from "@/lib/data/movies";
import { parseTmdbMovieResults } from "@/lib/tmdb/parse-movie-results";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidImagePath(value: unknown): value is string | null {
  return value === undefined || value === null ||
    (typeof value === "string" && value.startsWith("/"));
}

function parseGenres(value: unknown): MovieGenre[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;

  const genres: MovieGenre[] = [];
  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      !Number.isSafeInteger(item.id) ||
      item.id <= 0 ||
      typeof item.name !== "string"
    ) {
      return null;
    }
    genres.push({ id: item.id, name: item.name });
  }
  return genres;
}

function parseCast(value: unknown): MovieCastMember[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;

  const cast: MovieCastMember[] = [];
  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      !Number.isSafeInteger(item.id) ||
      item.id <= 0 ||
      typeof item.name !== "string" ||
      (item.character !== undefined &&
        item.character !== null &&
        typeof item.character !== "string") ||
      !isValidImagePath(item.profile_path)
    ) {
      return null;
    }
    cast.push({
      id: item.id,
      name: item.name,
      character:
        typeof item.character === "string" && item.character.length > 0
          ? item.character
          : null,
      profilePath:
        typeof item.profile_path === "string" ? item.profile_path : null,
    });
  }
  return cast;
}

function parseCrew(value: unknown): MovieCrewCredit[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;

  const crew: MovieCrewCredit[] = [];
  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      !Number.isSafeInteger(item.id) ||
      item.id <= 0 ||
      typeof item.name !== "string" ||
      typeof item.job !== "string" ||
      !isValidImagePath(item.profile_path)
    ) {
      return null;
    }
    crew.push({
      id: item.id,
      name: item.name,
      job: item.job,
      profilePath:
        typeof item.profile_path === "string" ? item.profile_path : null,
    });
  }
  return crew;
}

function parseSimilar(value: unknown) {
  if (value === undefined || value === null) return [];
  if (!isRecord(value) || value.results === undefined) return null;
  return parseTmdbMovieResults({ results: value.results });
}

export function parseTmdbMovieDetails(payload: unknown): MovieDetails | null {
  if (!isRecord(payload)) return null;

  const summary = parseTmdbMovieResults({ results: [payload] })?.[0];
  if (
    !summary ||
    !isValidImagePath(payload.backdrop_path) ||
    (payload.tagline !== undefined &&
      payload.tagline !== null &&
      typeof payload.tagline !== "string") ||
    (payload.runtime !== undefined &&
      payload.runtime !== null &&
      (typeof payload.runtime !== "number" ||
        !Number.isSafeInteger(payload.runtime) ||
        payload.runtime < 0))
  ) {
    return null;
  }

  const credits = payload.credits;
  if (credits !== undefined && credits !== null && !isRecord(credits)) {
    return null;
  }

  const genres = parseGenres(payload.genres);
  const cast = parseCast(isRecord(credits) ? credits.cast : undefined);
  const crew = parseCrew(isRecord(credits) ? credits.crew : undefined);
  const similar = parseSimilar(payload.similar);

  if (genres === null || cast === null || crew === null || similar === null) {
    return null;
  }

  return {
    ...summary,
    backdropPath:
      typeof payload.backdrop_path === "string" ? payload.backdrop_path : null,
    tagline: typeof payload.tagline === "string" ? payload.tagline : null,
    runtime: typeof payload.runtime === "number" ? payload.runtime : null,
    genres,
    cast,
    crew,
    similar,
  };
}
