"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { TrendingMovies } from "@/components/movies/trending-movies";

export function ProtectedMoviesPage() {
  const router = useRouter();
  const { state } = useSession();

  useEffect(() => {
    if (state.status === "ready" && state.user === null) {
      router.replace("/");
    }
  }, [router, state]);

  if (state.status === "loading" || (state.status === "ready" && !state.user)) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando tu sesión...
        </p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="max-w-lg text-center text-sm leading-6 text-(--error)" role="alert">
          No pudimos comprobar la sesión de prueba. Recarga la página para
          intentarlo de nuevo.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-10 sm:px-6 sm:py-14">
          <header className="mb-8 border-b border-border pb-7 sm:mb-9">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Catálogo
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Películas populares
            </h1>
            <p className="mt-4 max-w-152.5 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Historias que están marcando tendencia esta semana.
            </p>
          </header>
          <TrendingMovies />
        </main>
      </div>
      <Footer />
    </div>
  );
}
