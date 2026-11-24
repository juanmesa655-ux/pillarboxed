import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { SharedSeats } from "@/components/events/shared-seats";
import { VotingCycles } from "@/components/events/voting-cycles";
import { Footer } from "@/components/layout/footer";
import { NavbarVisitante } from "@/components/layout/navbar-visitante";
import { getCineFunctions } from "@/lib/data/events";
import { getVotingCycles } from "@/lib/data/voting-cycles";

type Period = "upcoming" | "past" | "all";

function isPeriod(value: string | string[] | undefined): value is Period {
  return value === "upcoming" || value === "past" || value === "all";
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-CO", {
    ...options,
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}

function formatLongDate(value: string) {
  return formatDate(value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateParts(value: string) {
  return {
    day: formatDate(value, { day: "2-digit" }),
    month: formatDate(value, { month: "short" }).replace(".", ""),
  };
}

export default async function EventsPage({
  searchParams,
}: PageProps<"/eventos">) {
  const params = await searchParams;
  const period = isPeriod(params.periodo) ? params.periodo : "upcoming";
  const date = typeof params.fecha === "string" ? params.fecha : "";
  const isVotingTab = params.tab === "votaciones";
  const isSeatsTab = params.tab === "butacas";

  const filteredFunctions = getCineFunctions()
    .filter((cineFunction) => {
      const matchesPeriod =
        period === "all" ||
        cineFunction.period === period;
      const matchesDate =
        !date || cineFunction.startsAt.slice(0, 10) === date;

      return matchesPeriod && matchesDate;
    })
    .sort((a, b) => {
      const difference =
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      return period === "past" ? -difference : difference;
    });

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-frame flex-1">
        <NavbarVisitante />
        <main className="mx-auto max-w-300 px-4 py-9 sm:px-6 sm:py-12">
          <header className="border-b border-border pb-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Cineclub · IU Pascual Bravo
            </p>
            <h1 className="mt-3 font-(family-name:--font-title) text-4xl font-semibold leading-tight text-(--fg) sm:text-5xl">
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
              <p className="mt-4 inline-flex items-center gap-2 border border-(--info)/30 bg-(--info)/10 px-3 py-2 text-xs leading-5 text-(--fg-secondary)">
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
              <section aria-labelledby="functions-heading" aria-live="polite">
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    id="functions-heading"
                    className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                  >
                    {period === "past"
                      ? "Funciones anteriores"
                      : period === "all"
                        ? "Todas las funciones"
                        : "Próximas funciones"}
                  </h2>
                  <p className="font-mono text-xs tabular-nums text-(--fg-muted)">
                    {filteredFunctions.length}{" "}
                    {filteredFunctions.length === 1 ? "función" : "funciones"}
                  </p>
                </div>

                {filteredFunctions.length === 0 ? (
                  <div className="border-y border-border py-10 text-center">
                    <CalendarDays
                      aria-hidden="true"
                      className="mx-auto size-6 text-(--fg-muted)"
                    />
                    <p className="mt-3 font-(family-name:--font-title) text-xl text-(--fg)">
                      No encontramos funciones para estos filtros.
                    </p>
                    <p className="mt-2 text-sm text-(--fg-secondary)">
                      Prueba con otra fecha o consulta todas las funciones.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border border-y border-border">
                    {filteredFunctions.map((cineFunction) => {
                      const dateParts = formatDateParts(cineFunction.startsAt);
                      const isUpcoming = cineFunction.period === "upcoming";

                      return (
                        <li
                          key={cineFunction.id}
                          className="grid gap-4 py-5 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-6"
                        >
                          <div
                            className="flex h-16 w-16 flex-col items-center justify-center border border-border bg-(--surface)"
                            aria-label={formatLongDate(cineFunction.startsAt)}
                          >
                            <span className="font-mono text-2xl leading-none tabular-nums text-(--fg)">
                              {dateParts.day}
                            </span>
                            <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-(--accent)">
                              {dateParts.month}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="text-xs uppercase tracking-[0.12em] text-(--fg-muted)">
                                Función de ejemplo
                              </p>
                              <span
                                className={
                                  isUpcoming
                                    ? "border border-(--success)/30 bg-(--success)/10 px-2 py-0.5 text-xs text-(--success)"
                                    : "border border-border bg-(--surface) px-2 py-0.5 text-xs text-(--fg-muted)"
                                }
                              >
                                {isUpcoming ? "Próxima" : "Realizada"}
                              </span>
                            </div>
                            <h3 className="mt-2 font-(family-name:--font-title) text-xl font-semibold text-(--fg) sm:text-2xl">
                              {cineFunction.title}
                            </h3>
                            <p className="mt-2 max-w-180 text-sm leading-6 text-(--fg-secondary)">
                              {cineFunction.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--fg-secondary)">
                              <span className="inline-flex items-center gap-2">
                                <CalendarDays
                                  aria-hidden="true"
                                  className="size-3.5 text-(--fg-muted)"
                                />
                                {formatLongDate(cineFunction.startsAt)}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <Clock3
                                  aria-hidden="true"
                                  className="size-3.5 text-(--fg-muted)"
                                />
                                {formatTime(cineFunction.startsAt)}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <MapPin
                                  aria-hidden="true"
                                  className="size-3.5 text-(--fg-muted)"
                                />
                                {cineFunction.venue}
                              </span>
                            </div>
                            {isUpcoming && (
                              <Link
                                href={`/eventos/${cineFunction.id}`}
                                className="mt-4 inline-flex text-sm text-accent underline decoration-border underline-offset-4 hover:text-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              >
                                Ver detalle y crear butaca
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
