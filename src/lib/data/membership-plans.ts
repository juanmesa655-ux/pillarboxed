import { authRepository } from "@/lib/data/auth-repository";

export const DEFAULT_DEMO_PLAN_PRICE_COP = 20_000;
export const MEMBERSHIP_PLAN_DURATION_MONTHS = 6;

export const COLLABORATOR_PLAN_BENEFITS = [
  "Voto con peso x2",
  "Crear butacas compartidas",
  "Personalizar el perfil",
  "Insignia de verificación «Colaborador»",
];

export type MembershipPlan = {
  id: string;
  name: string;
  priceCop: number;
  durationMonths: typeof MEMBERSHIP_PLAN_DURATION_MONTHS;
  version: number;
  status: "vigente" | "retirado";
  createdAt: string;
};

type PlanFailureReason =
  | "forbidden"
  | "invalid-data"
  | "not-found"
  | "unauthenticated"
  | "unavailable";

export type CurrentPlanResult =
  | { ok: true; plan: MembershipPlan | null }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type PlanListResult =
  | { ok: true; plans: MembershipPlan[] }
  | { ok: false; reason: PlanFailureReason };

export type PlanWriteResult =
  | { ok: true; plans: MembershipPlan[] }
  | { ok: false; reason: PlanFailureReason };

export interface MembershipPlanRepository {
  getCurrentPlan(): CurrentPlanResult;
  listForAdmin(): PlanListResult;
  publishVersion(name: string, priceCop: number): PlanWriteResult;
  activate(planId: string): PlanWriteResult;
  retireCurrent(): PlanWriteResult;
}

type StoredPlans = {
  version: 1;
  plans: MembershipPlan[];
};

const storageKey = "pillarboxed.demo-membership-plans";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMembershipPlan(value: unknown): value is MembershipPlan {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.length <= 80 &&
    typeof value.priceCop === "number" &&
    Number.isInteger(value.priceCop) &&
    value.priceCop > 0 &&
    value.priceCop <= 1_000_000_000 &&
    value.durationMonths === MEMBERSHIP_PLAN_DURATION_MONTHS &&
    typeof value.version === "number" &&
    Number.isInteger(value.version) &&
    value.version > 0 &&
    (value.status === "vigente" || value.status === "retirado") &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt))
  );
}

function defaultPlans(): MembershipPlan[] {
  return [
    {
      id: "miembro-colaborador-v1",
      name: "Miembro colaborador",
      priceCop: DEFAULT_DEMO_PLAN_PRICE_COP,
      durationMonths: MEMBERSHIP_PLAN_DURATION_MONTHS,
      version: 1,
      status: "vigente",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];
}

function readPlans():
  | { ok: true; plans: MembershipPlan[] }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  let serialized: string | null;
  try {
    serialized = window.localStorage.getItem(storageKey);
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (serialized === null) return { ok: true, plans: defaultPlans() };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== 1 ||
    !Array.isArray(parsed.plans) ||
    !parsed.plans.every(isMembershipPlan) ||
    new Set(parsed.plans.map((plan) => plan.id)).size !== parsed.plans.length ||
    parsed.plans.filter((plan) => plan.status === "vigente").length > 1
  ) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, plans: parsed.plans };
}

function savePlans(plans: MembershipPlan[]):
  | { ok: true }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
  if (
    plans.some((plan) => !isMembershipPlan(plan)) ||
    new Set(plans.map((plan) => plan.id)).size !== plans.length ||
    plans.filter((plan) => plan.status === "vigente").length > 1
  ) {
    return { ok: false, reason: "invalid-data" };
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ version: 1, plans } satisfies StoredPlans),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function authorizeAdmin():
  | { ok: true }
  | { ok: false; reason: "forbidden" | "unauthenticated" | "unavailable" | "invalid-data" } {
  const session = authRepository.readSession();
  if (!session.ok) return session;
  if (!session.user) return { ok: false, reason: "unauthenticated" };
  if (session.user.role !== "administrador") {
    return { ok: false, reason: "forbidden" };
  }
  return { ok: true };
}

function createPlanId():
  | { ok: true; id: string }
  | { ok: false; reason: "unavailable" } {
  try {
    return { ok: true, id: globalThis.crypto.randomUUID() };
  } catch (error) {
    if (error instanceof DOMException || error instanceof TypeError) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }
}

function writeAndReturn(plans: MembershipPlan[]): PlanWriteResult {
  const saved = savePlans(plans);
  if (!saved.ok) return saved;
  return { ok: true, plans };
}

export const membershipPlanRepository: MembershipPlanRepository = {
  getCurrentPlan() {
    const stored = readPlans();
    if (!stored.ok) return stored;

    return {
      ok: true,
      plan: stored.plans.find((plan) => plan.status === "vigente") ?? null,
    };
  },

  listForAdmin() {
    const authorization = authorizeAdmin();
    if (!authorization.ok) return authorization;
    return readPlans();
  },

  publishVersion(nameInput, priceCop) {
    const authorization = authorizeAdmin();
    if (!authorization.ok) return authorization;

    const name = nameInput.trim();
    if (
      !name ||
      name.length > 80 ||
      !Number.isInteger(priceCop) ||
      priceCop <= 0 ||
      priceCop > 1_000_000_000
    ) {
      return { ok: false, reason: "invalid-data" };
    }

    const stored = readPlans();
    if (!stored.ok) return stored;
    const id = createPlanId();
    if (!id.ok) return id;
    const version =
      Math.max(0, ...stored.plans.map((plan) => plan.version)) + 1;
    const now = new Date().toISOString();
    const newPlan: MembershipPlan = {
      id: id.id,
      name,
      priceCop,
      durationMonths: MEMBERSHIP_PLAN_DURATION_MONTHS,
      version,
      status: "vigente",
      createdAt: now,
    };
    const plans = [
      ...stored.plans.map((plan) =>
        plan.status === "vigente" ? { ...plan, status: "retirado" as const } : plan,
      ),
      newPlan,
    ];

    return writeAndReturn(plans);
  },

  activate(planId) {
    const authorization = authorizeAdmin();
    if (!authorization.ok) return authorization;

    const stored = readPlans();
    if (!stored.ok) return stored;
    if (!stored.plans.some((plan) => plan.id === planId)) {
      return { ok: false, reason: "not-found" };
    }

    const plans = stored.plans.map((plan) => ({
      ...plan,
      status: plan.id === planId ? ("vigente" as const) : ("retirado" as const),
    }));
    return writeAndReturn(plans);
  },

  retireCurrent() {
    const authorization = authorizeAdmin();
    if (!authorization.ok) return authorization;

    const stored = readPlans();
    if (!stored.ok) return stored;
    if (!stored.plans.some((plan) => plan.status === "vigente")) {
      return { ok: false, reason: "not-found" };
    }

    const plans = stored.plans.map((plan) => ({
      ...plan,
      status: "retirado" as const,
    }));
    return writeAndReturn(plans);
  },
};
