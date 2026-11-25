import { authRepository } from "@/lib/data/auth-repository";
import {
  readBillingRecord,
  writeBillingRecord,
} from "@/lib/data/billing-store";
import {
  getMembershipPeriodEndDate,
  getMembershipTier,
  type MembershipSubscription,
} from "@/lib/data/membership";
import { membershipPlanRepository } from "@/lib/data/membership-plans";

export type PaymentMethod = "tarjeta" | "pse" | "nequi";
export type TransactionStatus = "pendiente" | "aprobada" | "rechazada";
export type TransactionKind = "purchase" | "renewal";

export type PaymentTransaction = {
  id: string;
  createdAt: string;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  kind: TransactionKind;
  periodEndsAt: string | null;
  planVersion?: number;
};

export type TransactionFailureReason =
  | "invalid-data"
  | "unauthenticated"
  | "unavailable";
export type CreateTransactionFailureReason =
  | TransactionFailureReason
  | "plan-unavailable";

export type TransactionListResult =
  | { ok: true; transactions: PaymentTransaction[] }
  | { ok: false; reason: TransactionFailureReason };

export type CreateTransactionResult =
  | {
      ok: true;
      transaction: PaymentTransaction;
      subscription: MembershipSubscription | null;
    }
  | { ok: false; reason: CreateTransactionFailureReason };

export type AdminPaymentTransaction = PaymentTransaction & {
  userId: string;
  userName: string;
  userEmail: string;
};

export type AdminTransactionListResult =
  | { ok: true; transactions: AdminPaymentTransaction[] }
  | {
      ok: false;
      reason:
        | "forbidden"
        | "invalid-data"
        | "unauthenticated"
        | "unavailable";
    };

export interface TransactionRepository {
  getTransactions(userId: string): TransactionListResult;
  listAllTransactions(): AdminTransactionListResult;
  simulatePayment(
    userId: string,
    method: PaymentMethod,
    outcome: TransactionStatus,
  ): CreateTransactionResult;
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "tarjeta" || value === "pse" || value === "nequi";
}

function isTransactionStatus(value: unknown): value is TransactionStatus {
  return value === "pendiente" || value === "aprobada" || value === "rechazada";
}

function verifySession(userId: string):
  | { ok: true }
  | { ok: false; reason: TransactionFailureReason } {
  const session = authRepository.readSession();
  if (!session.ok) return session;
  if (session.user === null || session.user.id !== userId) {
    return { ok: false, reason: "unauthenticated" };
  }

  return { ok: true };
}

function createTransactionId():
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

export const transactionRepository: TransactionRepository = {
  getTransactions(userId) {
    const session = verifySession(userId);
    if (!session.ok) return session;

    const billing = readBillingRecord(userId);
    if (!billing.ok) return billing;

    return {
      ok: true,
      transactions: [...billing.record.transactions].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    };
  },

  listAllTransactions() {
    const managedUsers = authRepository.listUsersForRoleManagement();
    if (!managedUsers.ok) return managedUsers;

    const transactions: AdminPaymentTransaction[] = [];
    for (const user of managedUsers.users) {
      const billing = readBillingRecord(user.id);
      if (!billing.ok) return billing;
      transactions.push(
        ...billing.record.transactions.map((transaction) => ({
          ...transaction,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
        })),
      );
    }

    return {
      ok: true,
      transactions: transactions.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    };
  },

  simulatePayment(userId, method, outcome) {
    const session = verifySession(userId);
    if (!session.ok) return session;
    if (!isPaymentMethod(method) || !isTransactionStatus(outcome)) {
      return { ok: false, reason: "invalid-data" };
    }

    const billing = readBillingRecord(userId);
    if (!billing.ok) return billing;
    const currentPlan = membershipPlanRepository.getCurrentPlan();
    if (!currentPlan.ok) return currentPlan;
    if (!currentPlan.plan) {
      return { ok: false, reason: "plan-unavailable" };
    }

    const id = createTransactionId();
    if (!id.ok) return id;

    const now = new Date();
    const currentSubscription = billing.record.subscription;
    let updatedSubscription = currentSubscription;
    let periodEndsAt: string | null = null;

    if (outcome === "aprobada") {
      const currentBenefitsRemain =
        currentSubscription !== null &&
        getMembershipTier(currentSubscription, now) === "colaborador";
      const periodStartsAt =
        currentBenefitsRemain && currentSubscription
          ? new Date(currentSubscription.periodEndsAt)
          : now;
      periodEndsAt = getMembershipPeriodEndDate(periodStartsAt).toISOString();
      updatedSubscription = { status: "activa", periodEndsAt };
    }

    const transaction: PaymentTransaction = {
      id: id.id,
      createdAt: now.toISOString(),
      amount: currentPlan.plan.priceCop,
      method,
      status: outcome,
      kind: currentSubscription === null ? "purchase" : "renewal",
      periodEndsAt,
      planVersion: currentPlan.plan.version,
    };
    const saved = writeBillingRecord(userId, {
      ...billing.record,
      subscription: updatedSubscription,
      transactions: [transaction, ...billing.record.transactions],
    });
    if (!saved.ok) return saved;

    return {
      ok: true,
      transaction,
      subscription: updatedSubscription,
    };
  },
};
