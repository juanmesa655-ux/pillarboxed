"use client";

import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { TrendingMovies } from "@/components/movies/trending-movies";
import type { AuthUser } from "@/lib/data/auth-repository";
import { getLandingEvent } from "@/lib/data/landing";
import { getVotingCycles } from "@/lib/data/voting-cycles";

const quietCardClass =
  "border border-border bg-(--surface)/60 p-5 sm:p-6";

export function HomeDashboard({ user }: { user: AuthUser }) {
  const event = getLandingEvent();
  const openVotingCycles = getVotingCycles().filter(
    (cycle) => cycle.status === "open",
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-8">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Tu comunidad cinéfila
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Hola, {user.firstName}
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Explora películas, descubre las actividades del cineclub y
              comparte tu mirada con la comunidad.
            </p>
          </header>

          <section className="py-8 sm:py-10" aria-labelledby="trending-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                  Para descubrir
                </p>
                <h2
                  id="trending-title"
                  className="mt-2 font-(family-name:--font-title) text-2xl font-semibold text-(--fg) sm:text-3xl"
                >
                  Películas populares
                </h2>
              </div>
              <Link
                href="/peliculas"
                className="shrink-0 text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
              >
                Ver todas
              </Link>
            </div>
            <TrendingMovies layout="horizontal" limit={5} />
          </section>

          <div className="grid gap-8 border-t border-border py-8 sm:py-10 lg:grid-cols-2">
            <section aria-labelledby="event-title">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                Próxima función
              </p>
              <div className={`${quietCardClass} mt-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-(--fg-muted)">
                    {event.simulated ? "Actividad de ejemplo" : "Cineclub"}
                  </p>
                  {event.simulated && (
                    <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-(--fg-muted)">
                      Simulada
                    </span>
                  )}
                </div>
                <h2
                  id="event-title"
                  className="mt-4 font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                >
                  {event.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
                  {event.startsAt ?? "Fecha y lugar por anunciar."}
                </p>
              </div>
            </section>

            <section aria-labelledby="voting-title">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                Participa
              </p>
              <div className={`${quietCardClass} mt-4`}>
                <h2
                  id="voting-title"
                  className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                >
                  Votaciones abiertas
                </h2>
                <p className="mt-3 text-sm leading-6 text-(--fg-secondary)">
                  {openVotingCycles.length === 0
                    ? "Aún no hay ciclos de votación abiertos. Vuelve pronto para elegir la próxima película del cineclub."
                    : `Hay ${openVotingCycles.length} ${
                        openVotingCycles.length === 1
                          ? "ciclo abierto"
                          : "ciclos abiertos"
                      } para votar.`}
                </p>
                {openVotingCycles.length > 0 && (
                  <>
                    <ul className="mt-3 space-y-1 text-sm text-(--fg)">
                      {openVotingCycles.map((cycle) => (
                        <li key={cycle.id}>{cycle.title}</li>
                      ))}
                    </ul>
                    <Link
                      href="/eventos?tab=votaciones"
                      className="mt-4 inline-block text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                    >
                      Ver votaciones
                    </Link>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-2 sm:gap-6 sm:py-10">
            <section className={quietCardClass} aria-labelledby="lists-title">
              <h2
                id="lists-title"
                className="font-(family-name:--font-title) text-xl font-semibold text-(--fg)"
              >
                Listas populares
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
                Todavía no hay listas de la comunidad.
              </p>
            </section>
            <section className={quietCardClass} aria-labelledby="forum-title">
              <h2
                id="forum-title"
                className="font-(family-name:--font-title) text-xl font-semibold text-(--fg)"
              >
                Conversaciones
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
                El foro aún no tiene publicaciones. Pronto podrás compartir tus
                recomendaciones.
              </p>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
