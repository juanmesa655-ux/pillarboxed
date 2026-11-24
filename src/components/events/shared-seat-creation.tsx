"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSession } from "@/components/auth/session-provider";
import {
  getMembershipTier,
  membershipRepository,
  type MembershipTier,
} from "@/lib/data/membership";
import {
  sharedSeatRepository,
  type SeatInvitee,
  type SharedSeatFailureReason,
} from "@/lib/data/shared-seats";
import type { CineFunction } from "@/lib/data/events";

type CreatorData =
  | { ok: true; tier: MembershipTier; invitees: SeatInvitee[] }
  | { ok: false; message: string };

function readCreatorData(userId: string): CreatorData {
  const membership = membershipRepository.getSubscription(userId);
  if (!membership.ok) {
    return {
      ok: false,
      message:
        membership.reason === "invalid-data"
          ? "No pudimos leer el estado de tu membresía. Revisa los datos locales e inténtalo de nuevo."
          : "No pudimos consultar tu membresía. Habilita el almacenamiento local e inténtalo de nuevo.",
    };
  }

  return {
    ok: true,
    tier: getMembershipTier(membership.subscription),
    invitees: sharedSeatRepository.getInvitees(),
  };
}

function getCreationErrorMessage(reason: SharedSeatFailureReason) {
  switch (reason) {
    case "membership-required":
      return "Crear una butaca compartida está disponible para Miembros colaboradores con beneficios vigentes.";
    case "invalid-event":
      return "No encontramos esta función.";
    case "event-closed":
      return "Solo puedes crear una butaca para una función próxima.";
    case "no-invitees":
      return "Selecciona al menos una persona para invitar.";
    case "invalid-invitees":
      return "Selecciona personas de la lista de seguidores.";
    case "invalid-data":
      return "No pudimos leer tus butacas guardadas. Revisa los datos locales e inténtalo de nuevo.";
    case "unavailable":
      return "No pudimos guardar la butaca. Habilita el almacenamiento local e inténtalo de nuevo.";
    case "already-responded":
    case "not-found":
      return "No pudimos completar la acción. Actualiza la página e inténtalo de nuevo.";
  }
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export function SharedSeatCreation({
  cineFunction,
}: {
  cineFunction: CineFunction;
}) {
  const { state: session } = useSession();
  if (session.status !== "ready" || !session.user) {
    return (
      <p className="py-12 text-center text-sm text-(--fg-secondary)" role="status">
        Comprobando tu sesión...
      </p>
    );
  }

  return (
    <SharedSeatCreationForUser
      key={session.user.id}
      userId={session.user.id}
      userName={`${session.user.firstName} ${session.user.lastName}`}
      cineFunction={cineFunction}
    />
  );
}

function SharedSeatCreationForUser({
  userId,
  userName,
  cineFunction,
}: {
  userId: string;
  userName: string;
  cineFunction: CineFunction;
}) {
  const [creatorData, setCreatorData] = useState(() => readCreatorData(userId));
  const [selectedInviteeIds, setSelectedInviteeIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isUpcoming = cineFunction.period === "upcoming";

  function retryLoad() {
    setCreatorData(readCreatorData(userId));
  }

  function handleInviteeChange(inviteeId: string, checked: boolean) {
    setSelectedInviteeIds((current) =>
      checked
        ? [...current, inviteeId]
        : current.filter((id) => id !== inviteeId),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (selectedInviteeIds.length === 0) {
      setError("Selecciona al menos una persona para invitar.");
      return;
    }

    const result = sharedSeatRepository.createGroup(
      userId,
      userName,
      cineFunction.id,
      selectedInviteeIds,
    );

    if (!result.ok) {
      setError(getCreationErrorMessage(result.reason));
      return;
    }

    setSelectedInviteeIds([]);
    setNotice(
      "La butaca y las invitaciones de demostración se guardaron en este navegador.",
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <section
        aria-labelledby="seat-event-heading"
        className="border-y border-border py-6 sm:py-8"
      >
        <p className="text-xs uppercase tracking-[0.12em] text-(--fg-muted)">
          Detalle de función
        </p>
        <h2
          id="seat-event-heading"
          className="mt-2 font-(family-name:--font-title) text-3xl font-semibold text-(--fg) sm:text-4xl"
        >
          {cineFunction.title}
        </h2>
        <p className="mt-3 max-w-180 text-sm leading-6 text-(--fg-secondary)">
          {cineFunction.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-(--fg-secondary)">
          <span className="inline-flex items-center gap-2">
            <CalendarDays
              aria-hidden="true"
              className="size-4 text-(--fg-muted)"
            />
            {formatEventDate(cineFunction.startsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 aria-hidden="true" className="size-4 text-(--fg-muted)" />
            {formatEventTime(cineFunction.startsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 text-(--fg-muted)" />
            {cineFunction.venue}
          </span>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="create-seat-heading">
        <h2
          id="create-seat-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Crear una butaca compartida
        </h2>
        <p className="mt-2 max-w-180 text-sm leading-6 text-(--fg-secondary)">
          Invita a personas que sigues para organizar su asistencia a esta
          función. Las invitaciones de esta versión son de demostración.
        </p>

        <p className="mt-5 border border-(--info)/30 bg-(--info)/10 px-3 py-2 text-xs leading-5 text-(--fg-secondary)">
          La función y las invitaciones son simuladas. No se envían
          notificaciones reales ni se reserva un asiento en la sala.
        </p>

        {!isUpcoming ? (
          <p className="mt-6 border-y border-border py-6 text-sm text-(--fg-secondary)">
            Solo puedes crear una butaca compartida para una función próxima.
          </p>
        ) : !creatorData.ok ? (
          <div className="mt-6 border-y border-border py-6">
            <p className="text-sm text-(--error)" role="alert">
              {creatorData.message}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-4 border border-border px-4 py-2 text-sm text-(--fg) hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : creatorData.tier !== "colaborador" ? (
          <aside className="mt-6 border-l-2 border-accent bg-(--surface) px-4 py-4">
            <p className="font-medium text-(--fg)">
              Disponible para Miembros colaboradores
            </p>
            <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
              Para crear una butaca necesitas beneficios de membresía vigentes.
              Consultar y responder invitaciones sigue disponible para todos.
            </p>
            <Link
              href="/membresia"
              className="mt-3 inline-flex text-sm text-accent underline decoration-border underline-offset-4 hover:text-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Conocer la membresía
            </Link>
          </aside>
        ) : creatorData.invitees.length === 0 ? (
          <div className="mt-6 border-y border-border py-6">
            <p className="text-sm text-(--fg-secondary)">
              No tienes personas seguidas para invitar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <fieldset className="space-y-3">
              <legend className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-(--fg)">
                <Users aria-hidden="true" className="size-4 text-accent" />
                Personas que sigues
              </legend>
              <p className="mb-4 text-xs text-(--fg-muted)">
                Lista de seguidores de demostración.
              </p>
              <ul className="divide-y divide-border border-y border-border">
                {creatorData.invitees.map((invitee) => (
                  <li key={invitee.id}>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 py-3 text-sm text-(--fg-secondary) hover:text-(--fg)">
                      <input
                        type="checkbox"
                        checked={selectedInviteeIds.includes(invitee.id)}
                        onChange={(event) =>
                          handleInviteeChange(invitee.id, event.target.checked)
                        }
                        className="size-4 accent-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      />
                      <span>{invitee.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            {error && (
              <p className="mt-4 text-sm text-(--error)" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <div className="mt-4 border-l-2 border-(--success) bg-(--success)/10 px-4 py-3">
                <p className="text-sm text-(--success)" role="status">
                  {notice}
                </p>
                <Link
                  href="/eventos?tab=butacas"
                  className="mt-2 inline-flex text-sm text-(--fg) underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ver Mis butacas
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 text-sm font-semibold text-(--accent-fg) hover:bg-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Crear butaca e invitar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
