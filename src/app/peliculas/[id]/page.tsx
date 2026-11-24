import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProtectedMovieDetailPage } from "@/components/movies/protected-movie-detail-page";

export const metadata: Metadata = {
  title: "Detalle de película | Pillarboxed",
  description:
    "Consulta sinopsis, reparto, créditos y películas similares del catálogo.",
};

export default async function MovieDetailPage({
  params,
}: PageProps<"/peliculas/[id]">) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();

  const movieId = Number(id);
  if (!Number.isSafeInteger(movieId)) notFound();

  return <ProtectedMovieDetailPage key={movieId} movieId={movieId} />;
}
