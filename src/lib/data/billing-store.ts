import type { MembershipSubscription } from "@/lib/data/membership";
import type {
  PaymentMethod,
  PaymentTransaction,
  TransactionKind,
  TransactionStatus,
} from "@/lib/data/transactions";

export type BillingRecord = {
  version: 1;
  subscription: MembershipSubscription | null;
  transactions: PaymentTransaction[];
};

export type BillingStoreResult =
  | { ok: true; record: BillingRecord }
  | { ok: false; reason: "invalid-data" | "unavailable" };

export type BillingStoreWriteResult =
  | { ok: true }
  | { ok: false; reason: "invalid-data" | "unavailable" };

const storageKeyPrefix = "pillarboxed.demo-billing.";
const legacySubscriptionKeyPrefix = "pillarboxed.demo-subscription.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isSubscription(value: unknown): value is MembershipSubscription {
  return (
    isRecord(value) &&
    (value.status === "activa" ||
      value.status === "vencida" ||
      value.status === "cancelada") &&
    isValidDate(value.periodEndsAt)
  );
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "tarjeta" || value === "pse" || value === "nequi";
}

function isTransactionStatus(value: unknown): value is TransactionStatus {
  return value === "pendiente" || value === "aprobada" || value === "rechazada";
}

function isTransactionKind(value: unknown): value is TransactionKind {
  return value === "purchase" || value === "renewal";
}

function isPaymentTransaction(value: unknown): value is PaymentTransaction {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    !isValidDate(value.createdAt) ||
    typeof value.amount !== "number" ||
    !Number.isInteger(value.amount) ||
    value.amount <= 0 ||
    !isPaymentMethod(value.method) ||
    !isTransactionStatus(value.status) ||
    !isTransactionKind(value.kind)
  ) {
    return false;
  }

  if (
    value.planVersion !== undefined &&
    (typeof value.planVersion !== "number" ||
      !Number.isInteger(value.planVersion) ||
      value.planVersion <= 0)
  ) {
    return false;
  }

  if (value.status === "aprobada") return isValidDate(value.periodEndsAt);
  return value.periodEndsAt === null;
}

function isBillingRecord(value: unknown): value is BillingRecord {
  return (
    isRecord(value) &&
    value.version === 1 &&
    (value.subscription === null || isSubscription(value.subscription)) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isPaymentTransaction) &&
    new Set(value.transactions.map((transaction) => transaction.id)).size ===
      value.transactions.length
  );
}

function parseJson(serialized: string):
  | { ok: true; value: unknown }
  | { ok: false; reason: "invalid-data" } {
  try {
    return { ok: true, value: JSON.parse(serialized) };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }
}

export function readBillingRecord(userId: string): BillingStoreResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  let serialized: string | null;
  let legacySubscription: string | null = null;
  try {
    serialized = window.localStorage.getItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
    );
    if (serialized === null) {
      legacySubscription = window.localStorage.getItem(
        `${legacySubscriptionKeyPrefix}${encodeURIComponent(userId)}`,
      );
    }
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  if (serialized !== null) {
    const parsed = parseJson(serialized);
    if (!parsed.ok) return parsed;
    if (!isBillingRecord(parsed.value)) {
      return { ok: false, reason: "invalid-data" };
    }
    return { ok: true, record: parsed.value };
  }

  if (legacySubscription === null) {
    return {
      ok: true,
      record: { version: 1, subscription: null, transactions: [] },
    };
  }

  const parsedLegacy = parseJson(legacySubscription);
  if (!parsedLegacy.ok) return parsedLegacy;
  if (!isSubscription(parsedLegacy.value)) {
    return { ok: false, reason: "invalid-data" };
  }

  return {
    ok: true,
    record: {
      version: 1,
      subscription: parsedLegacy.value,
      transactions: [],
    },
  };
}

export function writeBillingRecord(
  userId: string,
  record: BillingRecord,
): BillingStoreWriteResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }
  if (!isBillingRecord(record)) {
    return { ok: false, reason: "invalid-data" };
  }

  try {
    window.localStorage.setItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      JSON.stringify(record),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}
