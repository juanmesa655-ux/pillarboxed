import type { Metadata } from "next";
import { ProtectedSearchPage } from "@/components/movies/protected-search-page";

export const metadata: Metadata = {
  title: "Buscar películas | Pillarboxed",
  description: "Busca películas por título en el catálogo de Pillarboxed.",
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/buscar">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  return <ProtectedSearchPage key={query} initialQuery={query} />;
}
