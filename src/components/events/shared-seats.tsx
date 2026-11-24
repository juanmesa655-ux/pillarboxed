"use client";

import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "@/components/auth/session-provider";
import {
  sharedSeatRepository,
  type SeatInvitation,
  type SeatInvitationStatus,
  type SharedSeatFailureReason,
  type SharedSeatOverview,
} from "@/lib/data/shared-seats";

type ResponseAction = "accepted" | "declined";

const responseLabels: Record<SeatInvitationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptaste",
  declined: "Rechazaste",
};

const participantLabels: Record<SeatInvitationStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptó",
  declined: "Rechazó",
};

function formatSeatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function formatSeatTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function statusClassName(status: SeatInvitationStatus) {
  if (status === "accepted") {
    return "border-(--success)/30 bg-(--success)/10 text-(--success)";
  }
  if (status === "declined") {
    return "border-(--error)/30 bg-(--error)/10 text-(--error)";
  }
  return "border-(--warning)/30 bg-(--warning)/10 text-(--warning)";
}

function getLoadErrorMessage(reason: SharedSeatFailureReason) {
  return reason === "invalid-data"
    ? "No pudimos leer tus butacas guardadas. Revisa los datos locales e inténtalo de nuevo."
    : "No pudimos cargar tus butacas. Habilita el almacenamiento local e inténtalo de nuevo.";
}

function InvitationCard({
  invitation,
  onRespond,
}: {
  invitation: SeatInvitation;
  onRespond: (invitationId: string, response: ResponseAction) => void;
}) {
  return (
    <li className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:py-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.12em] text-(--fg-muted)">
            Invitación de {invitation.inviterName}
          </p>
          <span
            className={`border px-2 py-0.5 text-xs ${statusClassName(invitation.status)}`}
          >
            {responseLabels[invitation.status]}
          </span>
        </div>
        <h3 className="mt-2 font-(family-name:--font-title) text-xl font-semibold text-(--fg) sm:text-2xl">
          {invitation.eventTitle}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--fg-secondary)">
          <span className="inline-flex items-center gap-2">
            <CalendarDays
              aria-hidden="true"
              className="size-3.5 text-(--fg-muted)"
            />
            {formatSeatDate(invitation.startsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3
              aria-hidden="true"
              className="size-3.5 text-(--fg-muted)"
            />
            {formatSeatTime(invitation.startsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin
              aria-hidden="true"
              className="size-3.5 text-(--fg-muted)"
            />
            {invitation.venue}
          </span>
        </div>
      </div>

      {invitation.status === "pending" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRespond(invitation.id, "accepted")}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-accent bg-accent px-4 text-sm font-medium text-(--accent-fg) hover:bg-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
          >
            <Check aria-hidden="true" className="size-4" />
            Aceptar
          </button>
          <button
            type="button"
            onClick={() => onRespond(invitation.id, "declined")}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-(--border-strong) px-4 text-sm text-(--fg-secondary) hover:border-(--error) hover:text-(--error) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
          >
            <X aria-hidden="true" className="size-4" />
            Rechazar
          </button>
        </div>
      )}
    </li>
  );
}

export function SharedSeats() {
  const { state: session } = useSession();
  if (session.status !== "ready" || !session.user) {
    return (
      <p className="py-12 text-center text-sm text-(--fg-secondary)" role="status">
        Cargando tus butacas...
      </p>
    );
  }

  return (
    <SharedSeatsForUser
      key={session.user.id}
      userId={session.user.id}
      userName={`${session.user.firstName} ${session.user.lastName}`}
    />
  );
}

function SharedSeatsForUser({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [initialState] = useState(() => {
    const result = sharedSeatRepository.getOverview(userId, userName);
    return result.ok
      ? { overview: result.overview, error: "" }
      : { overview: null, error: getLoadErrorMessage(result.reason) };
  });
  const [overview, setOverview] = useState<SharedSeatOverview | null>(
    initialState.overview,
  );
  const [error, setError] = useState(initialState.error);
  const [notice, setNotice] = useState("");

  function handleResponse(
    invitationId: string,
    response: ResponseAction,
  ) {
    setError("");
    setNotice("");
    const result = sharedSeatRepository.respondToInvitation(
      userId,
      userName,
      invitationId,
      response,
    );

    if (!result.ok) {
      setError(
        result.reason === "unavailable"
          ? "No pudimos guardar tu respuesta. Habilita el almacenamiento local e inténtalo de nuevo."
          : result.reason === "invalid-data"
            ? "No pudimos leer tus butacas guardadas. Revisa los datos locales e inténtalo de nuevo."
            : result.reason === "already-responded"
              ? "Esta invitación ya tiene una respuesta."
              : "No encontramos esta invitación. Actualiza la lista e inténtalo de nuevo.",
      );
      return;
    }

    setOverview(result.overview);
    setNotice(
      response === "accepted"
        ? "Aceptaste la invitación. Tu respuesta quedó guardada en este navegador."
        : "Rechazaste la invitación. Tu respuesta quedó guardada en este navegador.",
    );
  }

  function retryLoad() {
    const result = sharedSeatRepository.getOverview(userId, userName);
    if (!result.ok) {
      setOverview(null);
      setError(getLoadErrorMessage(result.reason));
      return;
    }

    setOverview(result.overview);
    setError("");
  }

  if (!overview) {
    return (
      <section className="border-y border-border py-10 text-center">
        <p className="text-sm text-(--error)" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={retryLoad}
          className="mt-4 border border-border px-4 py-2 text-sm text-(--fg) hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Intentar de nuevo
        </button>
      </section>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <p className="mb-6 border border-(--info)/30 bg-(--info)/10 px-3 py-2 text-xs leading-5 text-(--fg-secondary)">
        Las invitaciones y respuestas son de demostración y se guardan solo en
        este navegador. Aceptar o rechazar no envía notificaciones reales.
      </p>

      {error && (
        <p className="mb-4 text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 text-sm text-(--success)" role="status">
          {notice}
        </p>
      )}

      <section aria-labelledby="seat-invitations-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="seat-invitations-heading"
            className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
          >
            Invitaciones recibidas
          </h2>
          <p className="font-mono text-xs tabular-nums text-(--fg-muted)">
            {overview.invitations.length}{" "}
            {overview.invitations.length === 1
              ? "invitación"
              : "invitaciones"}
          </p>
        </div>

        {overview.invitations.length === 0 ? (
          <div className="border-y border-border py-8">
            <p className="font-(family-name:--font-title) text-xl text-(--fg)">
              No tienes invitaciones por ahora.
            </p>
            <p className="mt-2 text-sm text-(--fg-secondary)">
              Cuando alguien te invite a una butaca compartida, podrás responder
              desde aquí.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {overview.invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onRespond={handleResponse}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="seat-groups-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="seat-groups-heading"
            className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
          >
            Grupos que organizas
          </h2>
          <p className="font-mono text-xs tabular-nums text-(--fg-muted)">
            {overview.groups.length}{" "}
            {overview.groups.length === 1 ? "grupo" : "grupos"}
          </p>
        </div>

        {overview.groups.length === 0 ? (
          <div className="border-y border-border py-8">
            <p className="font-(family-name:--font-title) text-xl text-(--fg)">
              Todavía no organizas una butaca compartida.
            </p>
            <p className="mt-2 text-sm text-(--fg-secondary)">
              Revisa las próximas funciones para encontrar una que quieras
              compartir.
            </p>
            <Link
              href="/eventos"
              className="mt-4 inline-flex text-sm text-accent underline decoration-border underline-offset-4 hover:text-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver funciones
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {overview.groups.map((group) => (
              <li key={group.id} className="py-5 sm:py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-(--fg-muted)">
                      Función compartida
                    </p>
                    <h3 className="mt-2 font-(family-name:--font-title) text-xl font-semibold text-(--fg) sm:text-2xl">
                      {group.eventTitle}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-(--fg-secondary)">
                    <Users aria-hidden="true" className="size-4" />
                    {group.participants.length}{" "}
                    {group.participants.length === 1
                      ? "persona invitada"
                      : "personas invitadas"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--fg-secondary)">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays
                      aria-hidden="true"
                      className="size-3.5 text-(--fg-muted)"
                    />
                    {formatSeatDate(group.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3
                      aria-hidden="true"
                      className="size-3.5 text-(--fg-muted)"
                    />
                    {formatSeatTime(group.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin
                      aria-hidden="true"
                      className="size-3.5 text-(--fg-muted)"
                    />
                    {group.venue}
                  </span>
                </div>

                {group.participants.length > 0 && (
                  <ul
                    className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-(--fg-secondary)"
                    aria-label={`Respuestas para ${group.eventTitle}`}
                  >
                    {group.participants.map((participant) => (
                      <li
                        key={participant.id}
                        className="inline-flex items-center gap-2"
                      >
                        <span>{participant.name}</span>
                        <span
                          className={`border px-2 py-0.5 ${statusClassName(participant.status)}`}
                        >
                          {participantLabels[participant.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
