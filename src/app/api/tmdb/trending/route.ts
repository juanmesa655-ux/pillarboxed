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

function parseMovies(payload: unknown): MovieSummary[] | null {
  if (!isRecord(payload) || !Array.isArray(payload.results)) return null;

  const movies: MovieSummary[] = [];
  for (const result of payload.results) {
    const movie = parseMovie(result);
    if (movie === null) return null;
    movies.push(movie);
  }

  return movies;
}

function errorResponse(code: string, status: number) {
  return Response.json({ code }, { status });
}

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("TMDB_NOT_CONFIGURED", 503);
  }

  const url = new URL(
    "https://api.themoviedb.org/3/trending/movie/week",
  );
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "es-CO");

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse("TMDB_UNAVAILABLE", 502);
    }
    if (error instanceof TypeError) {
      return errorResponse("TMDB_UNAVAILABLE", 502);
    }
    throw error;
  }

  if (!response.ok) {
    return errorResponse("TMDB_UPSTREAM_ERROR", 502);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("TMDB_INVALID_RESPONSE", 502);
    }
    throw error;
  }

  const movies = parseMovies(payload);
  if (movies === null) {
    return errorResponse("TMDB_INVALID_RESPONSE", 502);
  }

  return Response.json({ movies });
}
