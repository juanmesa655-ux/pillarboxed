export type MembershipTier = "miembro" | "colaborador";
export type SubscriptionStatus = "activa" | "vencida" | "cancelada";

export type MembershipSubscription = {
  status: SubscriptionStatus;
  periodEndsAt: string;
};

export type MembershipReadResult =
  | { ok: true; subscription: MembershipSubscription | null }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type MembershipWriteResult =
  | { ok: true; subscription: MembershipSubscription | null }
  | {
      ok: false;
      reason: "already-collaborator" | "invalid-data" | "unavailable";
    };

export interface MembershipRepository {
  getSubscription(userId: string): MembershipReadResult;
  activateDemoMembership(userId: string): MembershipWriteResult;
  resetToMember(userId: string): MembershipWriteResult;
}

const storageKeyPrefix = "pillarboxed.demo-subscription.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return value === "activa" || value === "vencida" || value === "cancelada";
}

function isMembershipSubscription(
  value: unknown,
): value is MembershipSubscription {
  return (
    isRecord(value) &&
    isSubscriptionStatus(value.status) &&
    typeof value.periodEndsAt === "string" &&
    !Number.isNaN(Date.parse(value.periodEndsAt))
  );
}

function getSemesterEndDate(start: Date): Date {
  const end = new Date(start);
  const startDay = end.getDate();
  end.setDate(1);
  end.setMonth(end.getMonth() + 6);
  const lastDayOfMonth = new Date(
    end.getFullYear(),
    end.getMonth() + 1,
    0,
  ).getDate();
  end.setDate(Math.min(startDay, lastDayOfMonth));
  return end;
}

function saveSubscription(
  userId: string,
  subscription: MembershipSubscription,
): { ok: true } | { ok: false; reason: "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      JSON.stringify(subscription),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

export function getMembershipTier(
  subscription: MembershipSubscription | null,
  now: Date = new Date(),
): MembershipTier {
  if (!subscription) return "miembro";

  const paidThrough = Date.parse(subscription.periodEndsAt);
  const benefitsRemain =
    (subscription.status === "activa" ||
      subscription.status === "cancelada") &&
    paidThrough >= now.getTime();

  return benefitsRemain ? "colaborador" : "miembro";
}

export const membershipRepository: MembershipRepository = {
  getSubscription(userId) {
    if (typeof window === "undefined") {
      return { ok: false, reason: "unavailable" };
    }

    let serialized: string | null;
    try {
      serialized = window.localStorage.getItem(
        `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      );
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    if (serialized === null) {
      return { ok: true, subscription: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(serialized);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, reason: "invalid-data" };
      }
      throw error;
    }

    if (!isMembershipSubscription(parsed)) {
      return { ok: false, reason: "invalid-data" };
    }

    return { ok: true, subscription: parsed };
  },

  activateDemoMembership(userId) {
    const current = this.getSubscription(userId);
    if (!current.ok) return current;
    if (getMembershipTier(current.subscription) === "colaborador") {
      return { ok: false, reason: "already-collaborator" };
    }

    const subscription: MembershipSubscription = {
      status: "activa",
      periodEndsAt: getSemesterEndDate(new Date()).toISOString(),
    };
    const saved = saveSubscription(userId, subscription);
    if (!saved.ok) return saved;

    return { ok: true, subscription };
  },

  resetToMember(userId) {
    const current = this.getSubscription(userId);
    if (!current.ok) return current;
    if (typeof window === "undefined") {
      return { ok: false, reason: "unavailable" };
    }

    try {
      window.localStorage.removeItem(
        `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      );
    } catch (error) {
      if (error instanceof DOMException) {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }

    return { ok: true, subscription: null };
  },
};
