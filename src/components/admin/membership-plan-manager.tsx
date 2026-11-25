"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  COLLABORATOR_PLAN_BENEFITS,
  DEFAULT_DEMO_PLAN_PRICE_COP,
  MEMBERSHIP_PLAN_DURATION_MONTHS,
  membershipPlanRepository,
  type MembershipPlan,
} from "@/lib/data/membership-plans";

type PlanState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; plans: MembershipPlan[] };

function formatAmount(amount: number) {
  return `COP ${new Intl.NumberFormat("es-CO").format(amount)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

function getErrorMessage(reason: string) {
  switch (reason) {
    case "forbidden":
      return "No tienes permisos para administrar planes.";
    case "unauthenticated":
      return "Inicia sesión con una cuenta administradora.";
    case "not-found":
      return "No encontramos ese plan. Actualiza la lista.";
    case "invalid-data":
      return "Los datos del plan no son válidos.";
    default:
      return "No pudimos acceder a los planes locales. Intenta de nuevo.";
  }
}

export function MembershipPlanManager() {
  const [state, setState] = useState<PlanState>({ status: "loading" });
  const [name, setName] = useState("");
  const [price, setPrice] = useState(String(DEFAULT_DEMO_PLAN_PRICE_COP));
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingRetirement, setPendingRetirement] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = membershipPlanRepository.listForAdmin();
      if (!result.ok) {
        setState({ status: "error", message: getErrorMessage(result.reason) });
        return;
      }

      const current = result.plans.find((plan) => plan.status === "vigente");
      setName(current?.name ?? "Miembro colaborador");
      setPrice(String(current?.priceCop ?? DEFAULT_DEMO_PLAN_PRICE_COP));
      setState({ status: "ready", plans: result.plans });
    });

    return () => {
      active = false;
    };
  }, [retryCount]);

  function applyResult(
    result: ReturnType<typeof membershipPlanRepository.publishVersion>,
    successMessage: string,
  ) {
    setIsSaving(false);
    setError("");
    if (!result.ok) {
      setError(getErrorMessage(result.reason));
      return;
    }

    setState({ status: "ready", plans: result.plans });
    const current = result.plans.find((plan) => plan.status === "vigente");
    if (current) {
      setName(current.name);
      setPrice(String(current.priceCop));
    }
    setMessage(successMessage);
    setPendingRetirement(false);
  }

  function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");
    const result = membershipPlanRepository.publishVersion(
      name,
      Number(price),
    );
    applyResult(result, "Se publicó la nueva versión del plan.");
  }

  function handleActivate(plan: MembershipPlan) {
    setIsSaving(true);
    setError("");
    setMessage("");
    const result = membershipPlanRepository.activate(plan.id);
    applyResult(result, `Se activó la versión ${plan.version} del plan.`);
  }

  function handleRetire() {
    setIsSaving(true);
    setError("");
    setMessage("");
    const result = membershipPlanRepository.retireCurrent();
    applyResult(result, "Se retiró el plan vigente.");
  }

  if (state.status === "loading") {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Cargando planes...
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

  const currentPlan = state.plans.find((plan) => plan.status === "vigente");
  const retiredPlans = state.plans
    .filter((plan) => plan.status === "retirado")
    .sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-8">
      <aside className="border-l-2 border-(--info) bg-(--info)/10 px-4 py-3 text-sm leading-6 text-(--fg-secondary)">
        En esta fase el plan es de demostración: no se realizan cobros reales.
        Solo puede haber un plan vigente. Cada publicación conserva la versión
        anterior en el historial; la duración es fija de seis meses y los
        beneficios corresponden a las funciones implementadas.
      </aside>

      {error && (
        <p className="text-sm text-(--error)" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-(--success)" role="status">
          {message}
        </p>
      )}

      <section
        aria-labelledby="current-plan-heading"
        className="border border-border bg-(--surface)/60 p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="current-plan-heading"
              className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
            >
              {currentPlan ? "Plan vigente" : "No hay un plan vigente"}
            </h2>
            {currentPlan && (
              <p className="mt-2 text-sm text-(--fg-secondary)">
                Versión {currentPlan.version} · vigente desde{" "}
                {formatDate(currentPlan.createdAt)}
              </p>
            )}
          </div>
          {currentPlan && !pendingRetirement && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSaving}
              onClick={() => setPendingRetirement(true)}
            >
              Retirar plan
            </Button>
          )}
        </div>

        {pendingRetirement && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-sm text-(--fg-secondary)">
              Al retirarlo, dejará de aparecer como oferta y no se podrán
              registrar nuevas simulaciones con este plan.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
                onClick={handleRetire}
              >
                Confirmar retiro
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setPendingRetirement(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {currentPlan && (
          <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-(--fg-muted)">
                Nombre
              </dt>
              <dd className="mt-1 font-medium text-(--fg)">{currentPlan.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-(--fg-muted)">
                Precio provisional
              </dt>
              <dd className="mt-1 font-medium text-(--fg)">
                {formatAmount(currentPlan.priceCop)} por semestre
              </dd>
            </div>
            <div>
              <dt className="text-sm text-(--fg-muted)">
                Duración
              </dt>
              <dd className="mt-1 text-sm text-(--fg-secondary)">
                {MEMBERSHIP_PLAN_DURATION_MONTHS} meses
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section aria-labelledby="edit-plan-heading">
        <h2
          id="edit-plan-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          {currentPlan ? "Publicar nueva versión" : "Crear plan vigente"}
        </h2>
        <p className="mt-2 max-w-180 text-sm leading-6 text-(--fg-secondary)">
          Guardar crea una nueva versión con el nombre y precio configurados.
          Las transacciones anteriores conservan su monto y periodo registrados.
        </p>

        <form
          className="mt-5 grid gap-5 border-y border-border py-5 sm:grid-cols-2"
          onSubmit={handlePublish}
        >
          <div className="space-y-2">
            <label htmlFor="plan-name" className="block text-sm font-medium">
              Nombre del plan
            </label>
            <input
              id="plan-name"
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="plan-price" className="block text-sm font-medium">
              Precio provisional (COP)
            </label>
            <input
              id="plan-price"
              type="number"
              required
              min={1}
              max={1_000_000_000}
              step={1}
              value={price}
              onChange={(event) => setPrice(event.currentTarget.value)}
              className="h-11 w-full border border-(--border-strong) bg-(--bg-center) px-3 text-base text-(--fg) outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-(--fg)">
              Beneficios asociados
            </legend>
            <ul className="mt-3 grid gap-2 text-sm text-(--fg-secondary) sm:grid-cols-2">
              {COLLABORATOR_PLAN_BENEFITS.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-5 text-(--fg-muted)">
              Los beneficios se mantienen fijos para corresponder con las
              funciones disponibles del prototipo.
            </p>
          </fieldset>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar nueva versión"}
            </Button>
          </div>
        </form>
      </section>

      <section aria-labelledby="plan-history-heading">
        <h2
          id="plan-history-heading"
          className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
        >
          Historial de versiones
        </h2>
        {retiredPlans.length === 0 ? (
          <p className="mt-4 border-y border-border py-6 text-sm text-(--fg-secondary)">
            Todavía no hay versiones retiradas.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {retiredPlans.map((plan) => (
              <li
                key={plan.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <h3 className="font-medium text-(--fg)">
                    {plan.name} · versión {plan.version}
                  </h3>
                  <p className="mt-1 text-sm text-(--fg-secondary)">
                    {formatAmount(plan.priceCop)} por semestre ·{" "}
                    {formatDate(plan.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => handleActivate(plan)}
                >
                  Activar versión
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
