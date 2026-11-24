import { parseTmdbMovieDetails } from "@/lib/tmdb/parse-movie-details";

function errorResponse(code: string, status: number) {
  return Response.json({ code }, { status });
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/tmdb/movie/[id]">,
) {
  const { id: rawId } = await params;
  if (!/^[1-9]\d*$/.test(rawId)) {
    return errorResponse("INVALID_MOVIE_ID", 400);
  }

  const movieId = Number(rawId);
  if (!Number.isSafeInteger(movieId)) {
    return errorResponse("INVALID_MOVIE_ID", 400);
  }

  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse("TMDB_NOT_CONFIGURED", 503);
  }

  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "es-CO");
  url.searchParams.set("append_to_response", "credits,similar");

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

  if (response.status === 404) {
    return errorResponse("MOVIE_NOT_FOUND", 404);
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

  const movie = parseTmdbMovieDetails(payload);
  if (movie === null) {
    return errorResponse("TMDB_INVALID_RESPONSE", 502);
  }

  return Response.json({ movie });
}
