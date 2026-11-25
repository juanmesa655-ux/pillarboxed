"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  accessRequestRepository,
  type AccessRequest,
  type AccessRequestStatus,
} from "@/lib/data/access-request-repository";

type RequestState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; requests: AccessRequest[] };

function getErrorMessage(reason: string) {
  switch (reason) {
    case "forbidden":
      return "No tienes permisos para revisar solicitudes.";
    case "unauthenticated":
      return "Inicia sesión con una cuenta administradora.";
    case "not-found":
      return "No encontramos esa solicitud. Actualiza la lista.";
    case "already-reviewed":
      return "La solicitud ya fue revisada. Actualiza la lista.";
    case "invalid-data":
      return "Los datos de las solicitudes locales no son válidos.";
    default:
      return "No pudimos consultar las solicitudes. Intenta de nuevo.";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

const statusLabels: Record<AccessRequestStatus, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
};

export function AccessRequestManager() {
  const [state, setState] = useState<RequestState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    AccessRequestStatus | "todas"
  >("todas");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = accessRequestRepository.listForAdmin();
      setState(
        result.ok
          ? { status: "ready", requests: result.requests }
          : { status: "error", message: getErrorMessage(result.reason) },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount]);

  function decide(
    request: AccessRequest,
    status: Exclude<AccessRequestStatus, "pendiente">,
  ) {
    setSavingId(request.id);
    setError("");
    setMessage("");
    const result = accessRequestRepository.decide(request.id, status);
    setSavingId(null);
    if (!result.ok) {
      setError(getErrorMessage(result.reason));
      return;
    }

    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            requests: current.requests.map((item) =>
              item.id === result.request.id ? result.request : item,
            ),
          }
        : current,
    );
    setMessage(
      `La solicitud de ${result.request.fullName} quedó ${statusLabels[status].toLowerCase()}.`,
    );
  }

  if (state.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando solicitudes...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {state.message}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => {
            setState({ status: "loading" });
            setRetryCount((count) => count + 1);
          }}
        >
          Intentar de nuevo
        </Button>
      </section>
    );
  }

  const requests = state.requests.filter(
    (request) => statusFilter === "todas" || request.status === statusFilter,
  );

  return (
    <div>
      <aside className="mb-6 border-l-2 border-(--info) bg-(--info)/10 px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        Las solicitudes contienen datos personales y se guardan solo en este
        navegador. Aprobar o rechazar aquí registra una decisión de prueba:
        no crea una cuenta ni envía correos.
      </aside>

      {error && (
        <p className="mb-4 text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 text-sm text-(--success)" role="status">
          {message}
        </p>
      )}

      <div className="mb-5 max-w-sm space-y-2">
        <label htmlFor="access-request-status" className="text-sm font-medium">
          Estado de la solicitud
        </label>
        <select
          id="access-request-status"
          value={statusFilter}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (
              value === "todas" ||
              value === "pendiente" ||
              value === "aprobada" ||
              value === "rechazada"
            ) {
              setStatusFilter(value);
            }
          }}
          className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <p className="border-y border-border py-8 text-sm text-(--fg-secondary)" role="status">
          {state.requests.length === 0
            ? "Todavía no hay solicitudes guardadas en este navegador."
            : "No hay solicitudes que coincidan con este filtro."}
        </p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {requests.map((request) => (
            <li key={request.id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium text-(--fg)">
                    {request.fullName}
                  </h2>
                  <a
                    href={`mailto:${request.email}`}
                    className="mt-1 inline-block text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {request.email}
                  </a>
                </div>
                <span
                  className={`text-sm font-medium ${
                    request.status === "pendiente"
                      ? "text-(--warning)"
                      : request.status === "aprobada"
                        ? "text-(--success)"
                        : "text-(--error)"
                  }`}
                >
                  {statusLabels[request.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-(--fg-muted)">
                    Relación con la institución
                  </dt>
                  <dd className="mt-1 text-(--fg-secondary)">
                    {request.relationship === "egresado"
                      ? "Egresado/a"
                      : "Trabajador/a"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-(--fg-muted)">
                    Fecha de solicitud
                  </dt>
                  <dd className="mt-1 text-(--fg-secondary)">
                    {formatDate(request.createdAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-(--fg-muted)">
                    Motivo
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-6 text-(--fg-secondary)">
                    {request.reason}
                  </dd>
                </div>
                {request.reviewedAt && (
                  <div>
                    <dt className="text-sm text-(--fg-muted)">
                      Fecha de revisión
                    </dt>
                    <dd className="mt-1 text-(--fg-secondary)">
                      {formatDate(request.reviewedAt)}
                    </dd>
                  </div>
                )}
              </dl>

              {request.status === "pendiente" && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={savingId === request.id}
                    onClick={() => decide(request, "aprobada")}
                  >
                    {savingId === request.id ? "Guardando..." : "Aprobar"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={savingId === request.id}
                    onClick={() => decide(request, "rechazada")}
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
