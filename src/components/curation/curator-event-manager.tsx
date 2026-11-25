"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  curationRepository,
  type CurationData,
  type CuratedEvent,
  type EventInput,
} from "@/lib/data/curation-repository";
import {
  getCurationErrorMessage,
  toDateTimeLocal,
} from "@/components/curation/curation-messages";

const emptyForm: EventInput = {
  title: "",
  description: "",
  startsAt: "",
  venue: "",
  publicationStatus: "draft",
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function CuratorEventManager() {
  const [data, setData] = useState<CurationData | null>(null);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const result = curationRepository.getManagementData();
      if (!result.ok) {
        setError(getCurationErrorMessage(result.reason));
        setLoading(false);
        return;
      }

      setData(result.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = curationRepository.saveEvent(form);
    if (!result.ok) {
      setError(getCurationErrorMessage(result.reason));
      return;
    }

    setData(result.data);
    setForm(emptyForm);
    setNotice(form.id ? "Se guardaron los cambios de la función." : "Se creó la función.");
  }

  function editEvent(event: CuratedEvent) {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: toDateTimeLocal(event.startsAt),
      venue: event.venue,
      publicationStatus: event.publicationStatus,
    });
    setError("");
    setNotice("");
  }

  function togglePublication(event: CuratedEvent) {
    setError("");
    setNotice("");
    const publicationStatus =
      event.publicationStatus === "published" ? "draft" : "published";
    const result = curationRepository.setEventPublication(
      event.id,
      publicationStatus,
    );
    if (!result.ok) {
      setError(getCurationErrorMessage(result.reason));
      return;
    }

    setData(result.data);
    setNotice(
      publicationStatus === "published"
        ? "La función ya está visible en Eventos."
        : "La función volvió a borrador y ya no aparece en Eventos.",
    );
  }

  if (loading) {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando funciones...
      </p>
    );
  }

  if (!data) {
    return (
      <p className="border-y border-border py-8 text-sm text-(--error)" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <nav
        className="flex flex-wrap gap-5 border-b border-border"
        aria-label="Herramientas de curaduría"
      >
        <Link
          href="/curaduria/eventos"
          aria-current="page"
          className="border-b-2 border-accent py-3 text-sm text-(--fg)"
        >
          Eventos
        </Link>
        <Link
          href="/curaduria/ciclos"
          className="py-3 text-sm text-(--fg-secondary) hover:text-(--fg)"
        >
          Ciclos de votación
        </Link>
      </nav>

      <section aria-labelledby="event-form-heading">
        <h2
          id="event-form-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          {form.id ? "Editar función" : "Crear función"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-4 border-y border-border py-6 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="event-title"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Título
            </label>
            <input
              id="event-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
              maxLength={120}
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="event-description"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Descripción
            </label>
            <textarea
              id="event-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              maxLength={1000}
              rows={4}
              className="w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 py-2 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="event-starts-at"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Fecha y hora
            </label>
            <input
              id="event-starts-at"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
              required
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="event-venue"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Lugar
            </label>
            <input
              id="event-venue"
              value={form.venue}
              onChange={(event) =>
                setForm((current) => ({ ...current, venue: event.target.value }))
              }
              required
              maxLength={120}
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="event-publication"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Visibilidad
            </label>
            <select
              id="event-publication"
              value={form.publicationStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  publicationStatus:
                    event.target.value === "published" ? "published" : "draft",
                }))
              }
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button type="submit">
              {form.id ? "Guardar cambios" : "Crear función"}
            </Button>
            {form.id && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm(emptyForm)}
              >
                Cancelar edición
              </Button>
            )}
          </div>
        </form>
        {error && (
          <p className="mt-4 text-sm text-(--error)" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 text-sm text-(--success)" role="status">
            {notice}
          </p>
        )}
      </section>

      <section aria-labelledby="event-list-heading">
        <h2
          id="event-list-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Funciones existentes
        </h2>
        {data.events.length === 0 ? (
          <p className="border-y border-border py-8 text-sm text-(--fg-secondary)">
            Aún no hay funciones. Crea la primera desde el formulario.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {data.events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-medium text-(--fg)">{event.title}</h3>
                    <span className="border border-border px-2 py-0.5 text-xs text-(--fg-secondary)">
                      {event.publicationStatus === "published"
                        ? "Publicado"
                        : "Borrador"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-(--fg-secondary)">
                    {formatEventDate(event.startsAt)} · {event.venue}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editEvent(event)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => togglePublication(event)}
                  >
                    {event.publicationStatus === "published"
                      ? "Volver a borrador"
                      : "Publicar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
