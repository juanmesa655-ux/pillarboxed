"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/footer";
import { NavbarSesion } from "@/components/layout/navbar-sesion";
import { TrendingMovies } from "@/components/movies/trending-movies";
import type { AuthUser } from "@/lib/data/auth-repository";
import { getLandingEvent } from "@/lib/data/landing";
import { getVotingCycles } from "@/lib/data/voting-cycles";
import { curationRepository } from "@/lib/data/curation-repository";

const dashboardCardClass =
  "rounded-lg border border-(--border-strong) bg-(--surface)/60 p-5 sm:p-6";

export function HomeDashboard({ user }: { user: AuthUser }) {
  const [event, setEvent] = useState(getLandingEvent());
  const [openVotingCycles, setOpenVotingCycles] = useState(
    getVotingCycles().filter((cycle) => cycle.status === "open"),
  );
  const [curationError, setCurationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const eventsResult = curationRepository.getPublicEvents();
      const cyclesResult = curationRepository.getPublicCycles();
      if (!eventsResult.ok || !cyclesResult.ok) {
        setCurationError(
          "No pudimos actualizar los eventos y ciclos. Revisa el almacenamiento local e inténtalo de nuevo.",
        );
        return;
      }

      const nextEvent = eventsResult.events
        .filter((item) => item.period === "upcoming")
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        )[0];
      setEvent(
        nextEvent
          ? {
              title: nextEvent.title,
              startsAt: new Intl.DateTimeFormat("es-CO", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Bogota",
              }).format(new Date(nextEvent.startsAt)),
              simulated: true,
            }
          : {
              title: "No hay próximas funciones publicadas.",
              startsAt: null,
              simulated: true,
            },
      );
      setOpenVotingCycles(
        cyclesResult.cycles.filter((cycle) => cycle.status === "open"),
      );
      setCurationError("");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarSesion />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-8 text-center">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              Hola, {user.firstName} ¡Volviste!
            </h1>
            <p className="mx-auto mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              Explora películas, descubre las actividades del cineclub y
              comparte tu mirada con la comunidad.
            </p>
          </header>

          <section className="py-8 sm:py-10" aria-labelledby="trending-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2
                  id="trending-title"
                  className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg) sm:text-3xl"
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
            <TrendingMovies layout="horizontal" limit={6} />
          </section>

          {curationError && (
            <p className="mb-6 text-sm text-(--error)" role="alert">
              {curationError}
            </p>
          )}
          <div className="grid gap-5 border-t border-border py-8 sm:py-10">
            <section aria-labelledby="event-section-title">
              <div className={dashboardCardClass}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2
                    id="event-section-title"
                    className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                  >
                    {event.simulated ? "Actividad de ejemplo" : "Cineclub"}
                  </h2>
                  {event.simulated && (
                    <span className="border border-border px-2 py-1 text-xs text-(--fg-muted)">
                      Simulada
                    </span>
                  )}
                </div>
                <h3
                  id="event-title"
                  className="mt-4 font-(family-name:--font-title) text-xl font-semibold text-(--fg)"
                >
                  {event.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
                  {event.startsAt ?? "Fecha y lugar por anunciar."}
                </p>
              </div>
            </section>

            <section aria-labelledby="voting-title">
              <div className={dashboardCardClass}>
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

          <section
            className="border-t border-border py-8 sm:py-10"
            aria-labelledby="classics-title"
          >
            <div className="mb-5">
              <h2
                id="classics-title"
                className="font-(family-name:--font-title) text-xl font-semibold text-(--fg)"
              >
                Lista de clásicos
              </h2>
              <p className="mt-2 text-sm text-(--fg-secondary)">
                Películas estrenadas hasta 1980.
              </p>
            </div>
            <TrendingMovies
              source="classics"
              layout="horizontal"
              limit={6}
            />
          </section>

          <section
            className="border-t border-border py-8 text-center sm:py-10"
            aria-labelledby="forum-title"
          >
            <h2
              id="forum-title"
              className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
            >
              Próximamente un foro en este espacio
            </h2>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
