"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, CircleX, Clock3 } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  getMembershipTier,
  membershipRepository,
} from "@/lib/data/membership";
import {
  transactionRepository,
  type CreateTransactionResult,
  type PaymentMethod,
  type TransactionStatus,
} from "@/lib/data/transactions";
import { membershipPlanRepository } from "@/lib/data/membership-plans";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "pse", label: "PSE" },
  { value: "nequi", label: "Nequi" },
  { value: "tarjeta", label: "Tarjeta (solo simulación)" },
];

const outcomes: { value: TransactionStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("es-CO").format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function isTransactionStatus(value: string): value is TransactionStatus {
  return value === "pendiente" || value === "aprobada" || value === "rechazada";
}

function getErrorMessage(
  reason:
    | "invalid-data"
    | "plan-unavailable"
    | "unauthenticated"
    | "unavailable",
) {
  switch (reason) {
    case "invalid-data":
      return "No pudimos leer los datos de membresía o transacciones. Revisa los datos locales e inténtalo de nuevo.";
    case "plan-unavailable":
      return "No hay un plan vigente disponible para registrar esta simulación.";
    case "unauthenticated":
      return "Inicia sesión con la cuenta que deseas usar para esta simulación.";
    case "unavailable":
      return "El almacenamiento local no está disponible. Habilítalo e inténtalo de nuevo.";
  }
}

export function PaymentCheckout() {
  const { state } = useSession();

  if (state.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Comprobando tu sesión...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="py-8 text-sm text-(--error)" role="alert">
        No pudimos comprobar tu sesión. Habilita el almacenamiento local y
        recarga la página.
      </p>
    );
  }

  if (state.user === null) {
    return (
      <p className="py-8 text-sm text-(--error)" role="alert">
        Inicia sesión para continuar con la simulación.
      </p>
    );
  }

  return (
    <PaymentCheckoutForUser key={state.user.id} userId={state.user.id} />
  );
}

function PaymentCheckoutForUser({ userId }: { userId: string }) {
  const [membershipState, setMembershipState] =
    useState<ReturnType<typeof membershipRepository.getSubscription> | null>(
      null,
    );
  const [planState, setPlanState] =
    useState<ReturnType<typeof membershipPlanRepository.getCurrentPlan> | null>(
      null,
    );
  const [method, setMethod] = useState<PaymentMethod>("pse");
  const [outcome, setOutcome] = useState<TransactionStatus>("pendiente");
  const [understandsSimulation, setUnderstandsSimulation] = useState(false);
  const [completedPayment, setCompletedPayment] =
    useState<Extract<CreateTransactionResult, { ok: true }> | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setMembershipState(membershipRepository.getSubscription(userId));
        setPlanState(membershipPlanRepository.getCurrentPlan());
      }
    });

    return () => {
      active = false;
    };
  }, [loadAttempt, userId]);

  function retryLoad() {
    setMembershipState(null);
    setPlanState(null);
    setLoadAttempt((attempt) => attempt + 1);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = transactionRepository.simulatePayment(
      userId,
      method,
      outcome,
    );
    setIsSubmitting(false);

    if (!result.ok) {
      setError(getErrorMessage(result.reason));
      return;
    }

    setCompletedPayment(result);
  }

  if (membershipState === null || planState === null) {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando los datos de tu membresía...
      </p>
    );
  }

  if (!membershipState.ok) {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {getErrorMessage(membershipState.reason)}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={retryLoad}>
          Intentar de nuevo
        </Button>
      </section>
    );
  }

  if (!planState.ok) {
    return (
      <section className="border-y border-border py-8">
        <p className="text-sm text-(--error)" role="alert">
          {getErrorMessage(planState.reason)}
        </p>
        <Button type="button" variant="outline" className="mt-4" onClick={retryLoad}>
          Intentar de nuevo
        </Button>
      </section>
    );
  }

  if (!planState.plan) {
    return (
      <p className="border-y border-border py-8 text-sm text-(--fg-secondary)" role="status">
        No hay un plan de membresía vigente disponible en este momento.
      </p>
    );
  }

  if (completedPayment) {
    return (
      <PaymentResult
        result={completedPayment}
        onSimulateAnother={() => {
          setCompletedPayment(null);
          setError("");
          setUnderstandsSimulation(false);
        }}
      />
    );
  }

  const subscription = membershipState.subscription;
  const benefitsRemain =
    subscription !== null &&
    getMembershipTier(subscription) === "colaborador";

  return (
    <div className="space-y-6">
      <aside className="border-l-2 border-(--info) bg-(--info)/10 px-4 py-4 text-sm leading-6 text-(--fg-secondary)">
        <p className="font-medium text-(--fg)">
          Pago simulado. No se realizará ningún cobro.
        </p>
        <p className="mt-1">
          Este flujo guarda escenarios de prueba solo en este navegador. No
          ingreses datos reales: no se conecta con bancos, pasarelas ni servicios
          de pago.
        </p>
      </aside>

      <section
        className="border border-border bg-(--surface)/60 p-5 sm:p-7"
        aria-labelledby="payment-terms-heading"
      >
        <h2
          id="payment-terms-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Resumen y condiciones
        </h2>
        <dl className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Precio provisional
            </dt>
            <dd className="mt-1 text-base font-medium text-(--fg)">
              COP {formatAmount(planState.plan.priceCop)} por semestre
            </dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Vigencia
            </dt>
            <dd className="mt-1 text-sm leading-6 text-(--fg-secondary)">
              Seis meses desde la aprobación simulada. Si tienes beneficios
              vigentes, el nuevo periodo se suma al final del actual.
            </dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Condiciones
            </dt>
            <dd className="mt-1 text-sm leading-6 text-(--fg-secondary)">
              Solo el resultado aprobado activa o renueva la membresía. Un
              resultado pendiente o rechazado no cambia tu nivel.
            </dd>
          </div>
          <div>
            <dt className="text-sm text-(--fg-muted)">
              Reembolsos y cancelación
            </dt>
            <dd className="mt-1 text-sm leading-6 text-(--fg-secondary)">
              Esta simulación no genera cobros ni reembolsos. No hay reembolso
              automático al cancelar; cualquier política aplicable a pagos
              reales está pendiente de aprobación institucional.
            </dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-sm text-(--fg-muted)">
            Reclamos y retracto
          </p>
          <p className="mt-1 text-sm leading-6 text-(--fg-secondary)">
            No existe un canal PQR activo en este prototipo. El canal de
            reclamos y la aplicación del derecho de retracto están pendientes
            de revisión institucional y se definirán antes de habilitar pagos
            reales. Consulta{" "}
            <Link
              href="/ayuda"
              className="text-(--fg) underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ayuda
            </Link>{" "}
            y los{" "}
            <Link
              href="/terminos-de-uso"
              className="text-(--fg) underline decoration-border underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              términos en borrador
            </Link>
            .
          </p>
        </div>
      </section>

      <form
        className="space-y-6 border border-border bg-(--surface)/60 p-5 sm:p-7"
        onSubmit={handleSubmit}
      >
        <div>
          <h2 className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)">
            Preparar escenario de prueba
          </h2>
          <p className="mt-2 text-sm leading-6 text-(--fg-secondary)">
            Elige un método y un resultado para revisar cómo respondería la
            plataforma. Esto no representa la respuesta de una entidad de pago.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-(--fg)">
            Método (solo para el registro de prueba)
          </legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {paymentMethods.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 border px-3 py-2 text-sm transition-colors ${
                  method === option.value
                    ? "border-accent text-(--fg)"
                    : "border-border text-(--fg-secondary)"
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={option.value}
                  checked={method === option.value}
                  onChange={() => setMethod(option.value)}
                  className="size-4 accent-(--accent)"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label
            htmlFor="simulation-outcome"
            className="block text-sm font-medium text-(--fg)"
          >
            Resultado que quieres probar
          </label>
          <select
            id="simulation-outcome"
            value={outcome}
            onChange={(event) => {
              const value = event.target.value;
              if (isTransactionStatus(value)) setOutcome(value);
            }}
            className="h-11 w-full max-w-sm border border-(--border-strong) bg-(--bg-center) px-3 text-sm text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)"
          >
            {outcomes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm leading-6 text-(--fg-secondary)">
          <input
            type="checkbox"
            required
            checked={understandsSimulation}
            onChange={(event) =>
              setUnderstandsSimulation(event.target.checked)
            }
            className="mt-1 size-4 shrink-0 accent-(--accent)"
          />
          Entiendo que esto es solo una simulación local, no es una compra y no
          se realizará ningún cobro.
        </label>

        {error && (
          <p className="text-sm text-(--error)" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-sm text-(--fg-secondary)">
            Total de prueba:{" "}
            <span className="font-medium text-(--fg)">
              COP {formatAmount(planState.plan.priceCop)}
            </span>
          </p>
          <Button type="submit" disabled={!understandsSimulation || isSubmitting}>
            {isSubmitting ? "Guardando..." : "Registrar simulación"}
          </Button>
        </div>
        {benefitsRemain && (
          <p className="text-xs leading-5 text-(--fg-muted)">
            Tu periodo vigente no se modificará si el escenario queda pendiente
            o rechazado.
          </p>
        )}
      </form>
    </div>
  );
}

function PaymentResult({
  result,
  onSimulateAnother,
}: {
  result: Extract<CreateTransactionResult, { ok: true }>;
  onSimulateAnother: () => void;
}) {
  const transaction = result.transaction;
  const isApproved = transaction.status === "aprobada";
  const isPending = transaction.status === "pendiente";
  const StatusIcon = isApproved ? CheckCircle2 : isPending ? Clock3 : CircleX;
  const statusLabel = isApproved
    ? "Aprobada"
    : isPending
      ? "Pendiente"
      : "Rechazada";
  const statusColor = isApproved
    ? "text-(--success)"
    : isPending
      ? "text-(--warning)"
      : "text-(--error)";

  return (
    <section
      className="border border-border bg-(--surface)/60 p-5 sm:p-7"
      aria-labelledby="payment-result-heading"
    >
      <p className="text-sm text-(--fg-muted)">
        Resultado guardado · Demostración
      </p>
      <div className="mt-3 flex items-center gap-3">
        <StatusIcon
          aria-hidden="true"
          className={`size-6 ${statusColor}`}
          strokeWidth={1.5}
        />
        <h2
          id="payment-result-heading"
          className={`font-(family-name:--font-title) text-3xl font-semibold ${statusColor}`}
        >
          {statusLabel}
        </h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-(--fg-secondary)" role="status">
        {isApproved
          ? "El escenario aprobado activó o renovó tu membresía de prueba en este navegador. No se realizó ningún cobro."
          : isPending
            ? "El escenario pendiente no cambia tu membresía. No se realizó ningún cobro."
            : "El escenario rechazado no cambia tu membresía. No se realizó ningún cobro."}
      </p>
      <dl className="mt-6 grid gap-4 border-y border-border py-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-(--fg-muted)">Fecha</dt>
          <dd className="mt-1 text-sm text-(--fg-secondary)">
            {formatDate(transaction.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-(--fg-muted)">Monto de prueba</dt>
          <dd className="mt-1 text-sm text-(--fg-secondary)">
            COP {formatAmount(transaction.amount)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-(--fg-muted)">Método seleccionado</dt>
          <dd className="mt-1 text-sm text-(--fg-secondary)">
            {paymentMethods.find((item) => item.value === transaction.method)
              ?.label ?? transaction.method}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-(--fg-muted)">Vigencia registrada</dt>
          <dd className="mt-1 text-sm text-(--fg-secondary)">
            {transaction.periodEndsAt
              ? `Hasta ${formatDate(transaction.periodEndsAt)}`
              : "No se modificó"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-(--fg-muted)">Identificador de prueba</dt>
          <dd className="mt-1 break-all font-mono text-xs text-(--fg-secondary)">
            {transaction.id}
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/perfil?tab=suscripcion"
          className="inline-flex min-h-10 items-center border border-accent bg-accent px-4 text-sm font-medium text-(--accent-fg) hover:bg-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ver mi suscripción
        </Link>
        <Link
          href="/mis-transacciones"
          className="inline-flex min-h-10 items-center border border-(--border-strong) px-4 text-sm text-(--fg-secondary) hover:border-accent hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ver mis transacciones
        </Link>
        <Button type="button" variant="ghost" onClick={onSimulateAnother}>
          Probar otro escenario
        </Button>
      </div>
    </section>
  );
}
