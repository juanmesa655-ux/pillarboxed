"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { curationRepository } from "@/lib/data/curation-repository";
import type { CineFunction } from "@/lib/data/events";

type Period = "upcoming" | "past" | "all";

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-CO", {
    ...options,
    timeZone: "America/Bogota",
  }).format(new Date(value));
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

function formatTime(value: string) {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}

export function CineFunctionList({
  initialFunctions,
  period,
  date,
}: {
  initialFunctions: CineFunction[];
  period: Period;
  date: string;
}) {
  const [functions, setFunctions] = useState(initialFunctions);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const result = curationRepository.getPublicEvents();
      if (!result.ok) {
        setError(
          result.reason === "invalid-data"
            ? "No pudimos leer las funciones guardadas. Revisa los datos locales e inténtalo de nuevo."
            : "No pudimos cargar las funciones. Habilita el almacenamiento local e inténtalo de nuevo.",
        );
        return;
      }

      setFunctions(result.events);
      setError("");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredFunctions = useMemo(
    () =>
      functions
        .filter((cineFunction) => {
          const matchesPeriod =
            period === "all" || cineFunction.period === period;
          const matchesDate =
            !date ||
            new Intl.DateTimeFormat("en-CA", {
              timeZone: "America/Bogota",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(cineFunction.startsAt)) === date;
          return matchesPeriod && matchesDate;
        })
        .sort((a, b) => {
          const difference =
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
          return period === "past" ? -difference : difference;
        }),
    [date, functions, period],
  );

  return (
    <>
      {error && (
        <p
          className="mb-5 border border-(--error)/30 bg-(--error)/10 px-4 py-3 text-sm text-(--error)"
          role="alert"
        >
          {error}
        </p>
      )}
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
                    <span className="mt-1 text-xs text-(--accent)">
                      {dateParts.month}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
  );
}
