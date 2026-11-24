import { parseTmdbMovieResults } from "@/lib/tmdb/parse-movie-results";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(code: string, status: number) {
  return Response.json({ code }, { status });
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (query.length === 0 || query.length > 100) {
    return errorResponse("INVALID_QUERY", 400);
  }

  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("TMDB_NOT_CONFIGURED", 503);
  }

  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");
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

  const movies = parseTmdbMovieResults(payload);
  const totalResults =
    isRecord(payload) &&
    typeof payload.total_results === "number" &&
    Number.isSafeInteger(payload.total_results) &&
    payload.total_results >= 0
      ? payload.total_results
      : null;

  if (movies === null || totalResults === null) {
    return errorResponse("TMDB_INVALID_RESPONSE", 502);
  }

  return Response.json({ movies, totalResults });
}
