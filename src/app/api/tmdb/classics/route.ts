import { parseTmdbMovieResults } from "@/lib/tmdb/parse-movie-results";

function errorResponse(code: string, status: number) {
  return Response.json({ code }, { status });
}

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("TMDB_NOT_CONFIGURED", 503);
  }

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "es-CO");
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("primary_release_date.lte", "1980-12-31");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("vote_count.gte", "100");
  url.searchParams.set("vote_average.gte", "6");

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
  if (movies === null) {
    return errorResponse("TMDB_INVALID_RESPONSE", 502);
  }

  return Response.json({ movies });
}
