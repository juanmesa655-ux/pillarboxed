"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Film } from "lucide-react";
import type {
  VotingCycle,
  VotingCycleStatus,
} from "@/lib/data/voting-cycles";
import { curationRepository } from "@/lib/data/curation-repository";

const cycleGroups: {
  status: VotingCycleStatus;
  title: string;
}[] = [
  { status: "open", title: "Abiertas para votar" },
  { status: "upcoming", title: "Próximamente" },
  { status: "closed", title: "Ciclos cerrados" },
];

const statusLabels: Record<VotingCycleStatus, string> = {
  open: "Abierta",
  upcoming: "Próximamente",
  closed: "Cerrada",
};

function formatCycleDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  })
    .format(new Date(value))
    .replace(".", "");
}

function formatCycleTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function VotingCycles({ cycles }: { cycles: VotingCycle[] }) {
  const [publicCycles, setPublicCycles] = useState(cycles);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const result = curationRepository.getPublicCycles();
      if (!result.ok) {
        setError(
          result.reason === "invalid-data"
            ? "No pudimos leer los ciclos guardados. Revisa los datos locales e inténtalo de nuevo."
            : "No pudimos cargar los ciclos. Habilita el almacenamiento local e inténtalo de nuevo.",
        );
        return;
      }

      setPublicCycles(result.cycles);
      setError("");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (publicCycles.length === 0) {
    return (
      <section
        className="border-y border-border py-12 text-center"
        aria-live="polite"
      >
        <Film aria-hidden="true" className="mx-auto size-6 text-(--fg-muted)" />
        <h2 className="mt-3 font-(family-name:--font-title) text-xl text-(--fg)">
          Aún no hay ciclos de votación.
        </h2>
        <p className="mt-2 text-sm text-(--fg-secondary)">
          Vuelve pronto para elegir las próximas películas del cineclub.
        </p>
        {error && (
          <p className="mt-3 text-sm text-(--error)" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <p className="mb-6 inline-flex items-center gap-2 border border-(--info)/30 bg-(--info)/10 px-3 py-2 text-xs leading-5 text-(--fg-secondary)">
        Las votaciones son de demostración. Un voto por ciclo: pesa x1 sin
        suscripción activa y x2 con una activa; el peso queda guardado al votar.
      </p>
      {error && (
        <p className="mb-5 text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-9" aria-live="polite">
        {cycleGroups.map((group) => {
          const groupCycles = publicCycles.filter(
            (cycle) => cycle.status === group.status,
          );
          if (groupCycles.length === 0) return null;

          return (
            <section key={group.status} aria-labelledby={`cycles-${group.status}`}>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2
                  id={`cycles-${group.status}`}
                  className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
                >
                  {group.title}
                </h2>
                <p className="font-mono text-xs tabular-nums text-(--fg-muted)">
                  {groupCycles.length}{" "}
                  {groupCycles.length === 1 ? "ciclo" : "ciclos"}
                </p>
              </div>

              <ul className="divide-y divide-border border-y border-border">
                {groupCycles.map((cycle) => (
                  <li
                    key={cycle.id}
                    className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm text-(--fg-muted)">
                          Ciclo de votación
                        </p>
                        <span
                          className={
                            cycle.status === "open"
                              ? "border border-(--success)/30 bg-(--success)/10 px-2 py-0.5 text-xs text-(--success)"
                              : cycle.status === "upcoming"
                                ? "border border-(--warning)/30 bg-(--warning)/10 px-2 py-0.5 text-xs text-(--warning)"
                                : "border border-border bg-(--surface) px-2 py-0.5 text-xs text-(--fg-muted)"
                          }
                        >
                          {statusLabels[cycle.status]}
                        </span>
                      </div>
                      <h3 className="mt-2 font-(family-name:--font-title) text-xl font-semibold text-(--fg) sm:text-2xl">
                        {cycle.title}
                      </h3>
                      <p className="mt-2 max-w-180 text-sm leading-6 text-(--fg-secondary)">
                        {cycle.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--fg-secondary)">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays
                            aria-hidden="true"
                            className="size-3.5 text-(--fg-muted)"
                          />
                          {cycle.status === "upcoming" ? "Abre" : "Abrió"}{" "}
                          {formatCycleDate(cycle.opensAt)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3
                            aria-hidden="true"
                            className="size-3.5 text-(--fg-muted)"
                          />
                          {cycle.status === "closed" ? "Cerró" : "Cierra"}{" "}
                          {formatCycleDate(cycle.closesAt)} ·{" "}
                          {formatCycleTime(cycle.closesAt)}
                        </span>
                        <span>
                          {cycle.candidates.length}{" "}
                          {cycle.candidates.length === 1
                            ? "candidata"
                            : "candidatas"}
                        </span>
                      </div>
                    </div>

                    <p
                      className="border-l-2 border-border pl-3 text-xs leading-5 text-(--fg-secondary) sm:max-w-44"
                      role="status"
                    >
                      {cycle.resultsPublished
                        ? "Resultados publicados"
                        : "Resultados ocultos hasta el cierre"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
