import { readBillingRecord } from "@/lib/data/billing-store";

export type MembershipTier = "miembro" | "colaborador";
export type SubscriptionStatus = "activa" | "vencida" | "cancelada";

export type MembershipSubscription = {
  status: SubscriptionStatus;
  periodEndsAt: string;
};

export type MembershipReadResult =
  | { ok: true; subscription: MembershipSubscription | null }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export interface MembershipRepository {
  getSubscription(userId: string): MembershipReadResult;
}

export function getMembershipPeriodEndDate(start: Date): Date {
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
    const billing = readBillingRecord(userId);
    if (!billing.ok) return billing;

    return { ok: true, subscription: billing.record.subscription };
  },
};
