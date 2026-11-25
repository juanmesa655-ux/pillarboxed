"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  curationRepository,
  type CurationData,
  type CuratedVotingCycle,
  type VotingCycleInput,
} from "@/lib/data/curation-repository";
import {
  getCurationErrorMessage,
  toDateTimeLocal,
} from "@/components/curation/curation-messages";

type CycleForm = Omit<VotingCycleInput, "candidates"> & {
  candidatesText: string;
};

const emptyForm: CycleForm = {
  title: "",
  description: "",
  opensAt: "",
  closesAt: "",
  candidatesText: "",
  publicationStatus: "draft",
};

const statusLabels = {
  open: "Abierto",
  upcoming: "Próximamente",
  closed: "Cerrado",
} as const;

function formatCycleDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function CuratorCycleManager() {
  const [data, setData] = useState<CurationData | null>(null);
  const [form, setForm] = useState<CycleForm>(emptyForm);
  const [closureReasons, setClosureReasons] = useState<Record<string, string>>(
    {},
  );
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

  function submitCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const result = curationRepository.saveCycle({
      id: form.id,
      title: form.title,
      description: form.description,
      opensAt: form.opensAt,
      closesAt: form.closesAt,
      candidates: form.candidatesText.split(/\r?\n/),
      publicationStatus: form.publicationStatus,
    });
    if (!result.ok) {
      setError(getCurationErrorMessage(result.reason));
      return;
    }

    setData(result.data);
    setForm(emptyForm);
    setNotice(form.id ? "Se guardaron los cambios del ciclo." : "Se creó el ciclo.");
  }

  function editCycle(cycle: CuratedVotingCycle) {
    setForm({
      id: cycle.id,
      title: cycle.title,
      description: cycle.description,
      opensAt: toDateTimeLocal(cycle.opensAt),
      closesAt: toDateTimeLocal(cycle.closesAt),
      candidatesText: cycle.candidates.join("\n"),
      publicationStatus: cycle.publicationStatus,
    });
    setError("");
    setNotice("");
  }

  function closeCycle(cycle: CuratedVotingCycle) {
    setError("");
    setNotice("");
    const result = curationRepository.closeCycle(
      cycle.id,
      closureReasons[cycle.id] ?? "",
    );
    if (!result.ok) {
      setError(getCurationErrorMessage(result.reason));
      return;
    }

    setData(result.data);
    setNotice(`Se cerró el ciclo «${cycle.title}».`);
  }

  function publishResults(cycle: CuratedVotingCycle) {
    setError("");
    setNotice("");
    const result = curationRepository.publishCycleResults(cycle.id);
    if (!result.ok) {
      setError(getCurationErrorMessage(result.reason));
      return;
    }

    setData(result.data);
    setNotice(`Se marcaron como publicados los resultados de «${cycle.title}».`);
  }

  if (loading) {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando ciclos...
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
          className="py-3 text-sm text-(--fg-secondary) hover:text-(--fg)"
        >
          Eventos
        </Link>
        <Link
          href="/curaduria/ciclos"
          aria-current="page"
          className="border-b-2 border-accent py-3 text-sm text-(--fg)"
        >
          Ciclos de votación
        </Link>
      </nav>

      <section aria-labelledby="cycle-form-heading">
        <h2
          id="cycle-form-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          {form.id ? "Editar ciclo" : "Crear ciclo"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
          Cada ciclo debe tener al menos dos candidatas con nombres distintos.
          Un ciclo cerrado no se puede editar ni reabrir.
        </p>
        <form
          onSubmit={submitCycle}
          className="mt-5 grid gap-4 border-y border-border py-6 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label
              htmlFor="cycle-title"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Título
            </label>
            <input
              id="cycle-title"
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
              htmlFor="cycle-description"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Descripción
            </label>
            <textarea
              id="cycle-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              maxLength={1000}
              rows={3}
              className="w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 py-2 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="cycle-opens-at"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Apertura de votación
            </label>
            <input
              id="cycle-opens-at"
              type="datetime-local"
              value={form.opensAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  opensAt: event.target.value,
                }))
              }
              required
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="cycle-closes-at"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Cierre de votación
            </label>
            <input
              id="cycle-closes-at"
              type="datetime-local"
              value={form.closesAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  closesAt: event.target.value,
                }))
              }
              required
              className="h-11 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="cycle-candidates"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Candidatas (una por línea)
            </label>
            <textarea
              id="cycle-candidates"
              value={form.candidatesText}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  candidatesText: event.target.value,
                }))
              }
              required
              rows={5}
              aria-describedby="cycle-candidates-help"
              className="w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 py-2 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
            <p
              id="cycle-candidates-help"
              className="mt-2 text-xs leading-5 text-(--fg-muted)"
            >
              Agrega dos o más nombres únicos. Los cambios se guardan en este
              navegador.
            </p>
          </div>
          <div>
            <label
              htmlFor="cycle-publication"
              className="mb-2 block text-sm text-(--fg-secondary)"
            >
              Visibilidad
            </label>
            <select
              id="cycle-publication"
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
              {form.id ? "Guardar cambios" : "Crear ciclo"}
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

      <section aria-labelledby="cycle-list-heading">
        <h2
          id="cycle-list-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Ciclos existentes
        </h2>
        <p className="mt-2 text-xs leading-5 text-(--fg-muted)">
          La publicación de resultados es una marca de demostración; el prototipo
          no calcula ganadores reales.
        </p>
        {data.cycles.length === 0 ? (
          <p className="border-y border-border py-8 text-sm text-(--fg-secondary)">
            Aún no hay ciclos. Crea el primero desde el formulario.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {data.cycles.map((cycle) => (
              <li key={cycle.id} className="space-y-4 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-medium text-(--fg)">{cycle.title}</h3>
                      <span className="border border-border px-2 py-0.5 text-xs text-(--fg-secondary)">
                        {statusLabels[cycle.status]}
                      </span>
                      <span className="border border-border px-2 py-0.5 text-xs text-(--fg-secondary)">
                        {cycle.publicationStatus === "published"
                          ? "Publicado"
                          : "Borrador"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-(--fg-secondary)">
                      {cycle.candidates.length} candidatas · abre{" "}
                      {formatCycleDate(cycle.opensAt)} · cierra{" "}
                      {formatCycleDate(cycle.closesAt)}
                    </p>
                    {cycle.closureReason && (
                      <p className="mt-2 text-xs text-(--fg-muted)">
                        Motivo de cierre: {cycle.closureReason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cycle.status !== "closed" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => editCycle(cycle)}
                      >
                        Editar
                      </Button>
                    )}
                    {cycle.status === "closed" && !cycle.resultsPublished && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => publishResults(cycle)}
                      >
                        Marcar resultados publicados
                      </Button>
                    )}
                  </div>
                </div>
                {cycle.status === "open" && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label
                        htmlFor={`closure-reason-${cycle.id}`}
                        className="mb-2 block text-sm text-(--fg-secondary)"
                      >
                        Causa para cerrar antes de tiempo
                      </label>
                      <input
                        id={`closure-reason-${cycle.id}`}
                        value={closureReasons[cycle.id] ?? ""}
                        onChange={(event) =>
                          setClosureReasons((current) => ({
                            ...current,
                            [cycle.id]: event.target.value,
                          }))
                        }
                        maxLength={500}
                        className="h-10 w-full rounded-[3px] border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => closeCycle(cycle)}
                    >
                      Cerrar ciclo
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
