import type { Metadata } from "next";
import { ProtectedMoviesPage } from "@/components/movies/protected-movies-page";

export const metadata: Metadata = {
  title: "Películas populares | Pillarboxed",
  description:
    "Descubre las películas que están marcando tendencia en la comunidad.",
};

export default function MoviesPage() {
  return <ProtectedMoviesPage />;
}
