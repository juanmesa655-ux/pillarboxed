import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { SharedSeats } from "@/components/events/shared-seats";
import { CineFunctionList } from "@/components/events/cine-function-list";
import { VotingCycles } from "@/components/events/voting-cycles";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { getCineFunctions } from "@/lib/data/events";
import { getVotingCycles } from "@/lib/data/voting-cycles";

type Period = "upcoming" | "past" | "all";

function isPeriod(value: string | string[] | undefined): value is Period {
  return value === "upcoming" || value === "past" || value === "all";
}

export default async function EventsPage({
  searchParams,
}: PageProps<"/eventos">) {
  const params = await searchParams;
  const period = isPeriod(params.periodo) ? params.periodo : "upcoming";
  const date = typeof params.fecha === "string" ? params.fecha : "";
  const isVotingTab = params.tab === "votaciones";
  const isSeatsTab = params.tab === "butacas";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <h1 className="font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
              {isVotingTab
                ? "Votaciones"
                : isSeatsTab
                  ? "Mis butacas"
                  : "Funciones"}
            </h1>
            <p className="mt-4 max-w-160 text-sm leading-6 text-(--fg-secondary) sm:text-base sm:leading-7">
              {isVotingTab
                ? "Participa en los ciclos abiertos y consulta las próximas votaciones del cineclub."
                : isSeatsTab
                  ? "Consulta tus invitaciones y sigue las respuestas de los grupos que organizas."
                  : "Consulta las próximas proyecciones y encuentra un espacio para disfrutar y conversar sobre cine."}
            </p>
            {!isVotingTab && !isSeatsTab && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm leading-6 text-(--fg-secondary)">
                <CalendarDays
                  aria-hidden="true"
                  className="size-4 shrink-0 text-(--info)"
                />
                Cartelera de demostración: las funciones son simuladas.
              </p>
            )}
          </header>

          <nav
            className="flex flex-wrap gap-6 border-b border-border"
            aria-label="Secciones de eventos"
          >
            <Link
              href="/eventos"
              aria-current={!isVotingTab && !isSeatsTab ? "page" : undefined}
              className={
                !isVotingTab && !isSeatsTab
                  ? "border-b-2 border-accent py-4 text-sm font-medium text-(--fg)"
                  : "py-4 text-sm text-(--fg-secondary) hover:text-(--fg)"
              }
            >
              Funciones
            </Link>
            <Link
              href="/eventos?tab=votaciones"
              aria-current={isVotingTab ? "page" : undefined}
              className={
                isVotingTab
                  ? "border-b-2 border-accent py-4 text-sm font-medium text-(--fg)"
                  : "py-4 text-sm text-(--fg-secondary) hover:text-(--fg)"
              }
            >
              Votaciones
            </Link>
            <Link
              href="/eventos?tab=butacas"
              aria-current={isSeatsTab ? "page" : undefined}
              className={
                isSeatsTab
                  ? "border-b-2 border-accent py-4 text-sm font-medium text-(--fg)"
                  : "py-4 text-sm text-(--fg-secondary) hover:text-(--fg)"
              }
            >
              Mis butacas
            </Link>
          </nav>

          {isVotingTab ? (
            <VotingCycles cycles={getVotingCycles()} />
          ) : isSeatsTab ? (
            <SharedSeats />
          ) : (
            <>
              <section className="py-6 sm:py-8" aria-label="Filtrar funciones">
                <form
                  action="/eventos"
                  method="get"
                  className="grid gap-4 border-b border-border pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end"
                >
                  <div>
                    <label
                      htmlFor="event-period"
                      className="mb-2 block text-sm text-(--fg-secondary)"
                    >
                      Periodo
                    </label>
                    <select
                      id="event-period"
                      name="periodo"
                      defaultValue={period}
                      className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
                    >
                      <option value="upcoming">Próximas</option>
                      <option value="past">Anteriores</option>
                      <option value="all">Todas</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="event-date"
                      className="mb-2 block text-sm text-(--fg-secondary)"
                    >
                      Fecha
                    </label>
                    <input
                      id="event-date"
                      name="fecha"
                      type="date"
                      defaultValue={date}
                      className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-center)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 border border-accent bg-accent px-5 text-sm font-semibold text-(--accent-fg) hover:bg-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Aplicar filtros
                  </button>
                  {(date || period !== "upcoming") && (
                    <Link
                      href="/eventos"
                      className="inline-flex h-11 items-center justify-center px-3 text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg)"
                    >
                      Limpiar
                    </Link>
                  )}
                </form>
              </section>
              <CineFunctionList
                initialFunctions={getCineFunctions()}
                period={period}
                date={date}
              />
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
