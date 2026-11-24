"use client";

import { useState } from "react";
import { useSession } from "@/components/auth/session-provider";
import {
  getMembershipTier,
  membershipRepository,
  type MembershipSubscription,
  type MembershipTier,
} from "@/lib/data/membership";

function formatEndDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function getSubscriptionLabel(
  subscription: MembershipSubscription,
  tier: MembershipTier,
) {
  if (subscription.status === "cancelada") {
    return tier === "colaborador"
      ? "Cancelada, beneficios vigentes"
      : "Cancelada, beneficios vencidos";
  }
  if (subscription.status === "vencida" || tier === "miembro") {
    return "Vencida";
  }
  return "Activa";
}

export function DemoMembershipControl() {
  const { state: session } = useSession();
  if (session.status !== "ready" || !session.user) {
    return (
      <p className="text-sm text-(--fg-secondary)" role="status">
        Comprobando tu sesión...
      </p>
    );
  }

  return (
    <DemoMembershipControlForUser
      key={session.user.id}
      userId={session.user.id}
    />
  );
}

function DemoMembershipControlForUser({ userId }: { userId: string }) {
  const [membershipState, setMembershipState] = useState(() =>
    membershipRepository.getSubscription(userId),
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function activateDemoMembership() {
    setError("");
    setNotice("");
    const result = membershipRepository.activateDemoMembership(userId);
    if (!result.ok) {
      if (result.reason === "already-collaborator") {
        setError("Esta cuenta ya tiene beneficios de Miembro colaborador.");
        setMembershipState(membershipRepository.getSubscription(userId));
        return;
      }
      setError(
        result.reason === "invalid-data"
          ? "No pudimos leer la membresía guardada. Revisa los datos locales e inténtalo de nuevo."
          : "No pudimos guardar la membresía de prueba. Habilita el almacenamiento local e inténtalo de nuevo.",
      );
      return;
    }

    setMembershipState({ ok: true, subscription: result.subscription });
    setNotice(
      "Membresía colaboradora de prueba activada para esta cuenta en este navegador. No se realizó ningún cobro.",
    );
  }

  function resetToMember() {
    setError("");
    setNotice("");
    const result = membershipRepository.resetToMember(userId);
    if (!result.ok) {
      setError(
        result.reason === "invalid-data"
          ? "No pudimos leer la membresía guardada. Revisa los datos locales e inténtalo de nuevo."
          : "No pudimos restablecer la cuenta. Habilita el almacenamiento local e inténtalo de nuevo.",
      );
      return;
    }

    setMembershipState({ ok: true, subscription: null });
    setNotice("La cuenta volvió al nivel Miembro de prueba.");
  }

  function retryLoad() {
    setMembershipState(membershipRepository.getSubscription(userId));
    setError("");
  }

  if (!membershipState.ok) {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {membershipState.reason === "invalid-data"
            ? "No pudimos leer el estado de tu membresía. Revisa los datos locales e inténtalo de nuevo."
            : "No pudimos consultar tu membresía. Habilita el almacenamiento local e inténtalo de nuevo."}
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

  const subscription = membershipState.subscription;
  const tier = getMembershipTier(subscription);

  return (
    <div>
      <aside className="border-l-2 border-(--info) bg-(--info)/10 px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        Esta herramienta es solo para demostraciones. No realiza cobros, no crea
        transacciones ni envía notificaciones; el cambio se guarda únicamente en
        este navegador y afecta solo a esta cuenta.
      </aside>

      <section
        className="mt-6 border border-border bg-(--surface) p-5 sm:p-7"
        aria-labelledby="membership-status-heading"
      >
        <p className="text-xs uppercase tracking-[0.12em] text-(--fg-muted)">
          Nivel de membresía
        </p>
        <h2
          id="membership-status-heading"
          className="mt-2 font-(family-name:--font-title) text-3xl font-semibold text-(--fg)"
        >
          {tier === "colaborador" ? "Miembro colaborador" : "Miembro"}
        </h2>
        {subscription ? (
          <dl className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-(--fg-muted)">
                Estado de la suscripción de prueba
              </dt>
              <dd className="mt-1 text-sm text-(--fg-secondary)">
                {getSubscriptionLabel(subscription, tier)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-(--fg-muted)">
                Vigencia registrada
              </dt>
              <dd className="mt-1 text-sm text-(--fg-secondary)">
                Hasta {formatEndDate(subscription.periodEndsAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-(--fg-secondary)">
            Esta cuenta no tiene una suscripción de prueba activa.
          </p>
        )}

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

        <div className="mt-6 flex flex-wrap gap-3">
          {tier === "colaborador" ? (
            <button
              type="button"
              onClick={resetToMember}
              className="min-h-10 border border-(--border-strong) px-4 text-sm text-(--fg-secondary) hover:border-accent hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Restablecer a Miembro
            </button>
          ) : (
            <button
              type="button"
              onClick={activateDemoMembership}
              className="min-h-10 border border-accent bg-accent px-4 text-sm font-medium text-(--accent-fg) hover:bg-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Activar Miembro colaborador de prueba
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
