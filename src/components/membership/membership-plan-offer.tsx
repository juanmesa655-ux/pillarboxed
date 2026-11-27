"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MembershipLoginAction } from "@/components/membership/membership-login-action";
import {
  membershipPlanRepository,
  type MembershipPlan,
} from "@/lib/data/membership-plans";

type PlanState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; plan: MembershipPlan | null };

function formatAmount(amount: number) {
  return new Intl.NumberFormat("es-CO").format(amount);
}

export function MembershipPlanOffer({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlanState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = membershipPlanRepository.getCurrentPlan();
      setState(
        result.ok
          ? { status: "ready", plan: result.plan }
          : { status: "error" },
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <article className="rounded-lg border border-(--accent)/60 bg-(--surface) p-6 sm:p-8">
      {state.status === "loading" ? (
        <p className="py-6 text-sm text-(--fg-secondary)" role="status">
          Cargando el plan vigente...
        </p>
      ) : state.status === "error" ? (
        <p className="py-6 text-sm text-(--error)" role="alert">
          No pudimos consultar el plan vigente en este navegador.
        </p>
      ) : state.plan === null ? (
        <div className="py-6">
          <h2 className="font-(family-name:--font-title) text-3xl font-semibold text-(--fg)">
            Miembro colaborador
          </h2>
          <p className="mt-4 text-sm leading-6 text-(--fg-secondary)" role="status">
            No hay un plan vigente disponible en este momento.
          </p>
        </div>
      ) : (
        <>
          <header>
            <h2 className="font-(family-name:--font-title) text-3xl font-semibold text-(--fg)">
              {state.plan.name}
            </h2>
          </header>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4">
            <div>
              <dt className="text-xs text-(--fg-muted)">Precio provisional</dt>
              <dd className="mt-1 text-lg font-semibold text-(--fg)">
                ${formatAmount(state.plan.priceCop)} COP
              </dd>
            </div>
            <div>
              <dt className="text-xs text-(--fg-muted)">Duración</dt>
              <dd className="mt-1 text-sm text-(--fg)">Un semestre</dd>
            </div>
          </dl>

          {children}

          <div className="mt-6">
            <MembershipLoginAction />
          </div>
        </>
      )}
    </article>
  );
}
