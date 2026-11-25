import { authRepository } from "@/lib/data/auth-repository";
import { curationRepository } from "@/lib/data/curation-repository";
import {
  getMembershipTier,
  membershipRepository,
} from "@/lib/data/membership";
import { sharedSeatRepository } from "@/lib/data/shared-seats";
import { transactionRepository } from "@/lib/data/transactions";

export type NotificationType =
  | "payment-approved"
  | "payment-rejected"
  | "membership-expiring"
  | "voting-results"
  | "seat-invitation";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  isRead: boolean;
  isDemo: boolean;
};

export type NotificationFailureReason =
  | "invalid-data"
  | "not-found"
  | "unauthenticated"
  | "unavailable";

export type NotificationReadResult =
  | { ok: true; notifications: AppNotification[] }
  | { ok: false; reason: Exclude<NotificationFailureReason, "not-found"> };

export type NotificationWriteResult =
  | { ok: true; notifications: AppNotification[] }
  | { ok: false; reason: NotificationFailureReason };

export interface NotificationRepository {
  getNotifications(userId: string, userName: string): NotificationReadResult;
  markAsRead(
    userId: string,
    userName: string,
    notificationId: string,
  ): NotificationWriteResult;
  markAllAsRead(userId: string, userName: string): NotificationWriteResult;
}

const storageKeyPrefix = "pillarboxed.demo-notifications-read.";
const membershipExpiryWindowMs = 30 * 24 * 60 * 60 * 1000;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0) &&
    new Set(value).size === value.length
  );
}

function readReadIds(userId: string):
  | { ok: true; ids: string[] }
  | { ok: false; reason: "invalid-data" | "unavailable" } {
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

  if (serialized === null) return { ok: true, ids: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, reason: "invalid-data" };
    }
    throw error;
  }

  if (!isStringArray(parsed)) {
    return { ok: false, reason: "invalid-data" };
  }

  return { ok: true, ids: parsed };
}

function saveReadIds(
  userId: string,
  ids: string[],
): { ok: true } | { ok: false; reason: "unavailable" } {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(
      `${storageKeyPrefix}${encodeURIComponent(userId)}`,
      JSON.stringify(ids),
    );
  } catch (error) {
    if (error instanceof DOMException) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }

  return { ok: true };
}

function verifySession(userId: string):
  | { ok: true }
  | {
      ok: false;
      reason: "invalid-data" | "unauthenticated" | "unavailable";
    } {
  const session = authRepository.readSession();
  if (!session.ok) return session;
  if (session.user === null || session.user.id !== userId) {
    return { ok: false, reason: "unauthenticated" };
  }

  return { ok: true };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}

export const notificationRepository: NotificationRepository = {
  getNotifications(userId, userName) {
    const session = verifySession(userId);
    if (!session.ok) return session;

    const readIds = readReadIds(userId);
    if (!readIds.ok) return readIds;

    const membership = membershipRepository.getSubscription(userId);
    if (!membership.ok) return membership;

    const seats = sharedSeatRepository.getOverview(userId, userName);
    if (!seats.ok) {
      return {
        ok: false,
        reason: seats.reason === "invalid-data" ? "invalid-data" : "unavailable",
      };
    }
    const cycles = curationRepository.getPublicCycles();
    if (!cycles.ok) return cycles;

    const now = new Date();
    const notifications: Omit<AppNotification, "isRead">[] = [];

    const transactions = transactionRepository.getTransactions(userId);
    if (!transactions.ok) return transactions;

    for (const transaction of transactions.transactions) {
      if (transaction.status === "pendiente") continue;

      const isApproved = transaction.status === "aprobada";
      notifications.push({
        id: `payment:${transaction.id}`,
        type: isApproved ? "payment-approved" : "payment-rejected",
        title: isApproved ? "Simulación de pago aprobada" : "Simulación rechazada",
        message: `El escenario de COP ${new Intl.NumberFormat("es-CO").format(transaction.amount)} quedó ${isApproved ? "aprobado" : "rechazado"}.`,
        href: "/mis-transacciones",
        isDemo: true,
      });
    }

    if (
      membership.subscription &&
      getMembershipTier(membership.subscription, now) === "colaborador"
    ) {
      const expiry = Date.parse(membership.subscription.periodEndsAt);
      const timeLeft = expiry - now.getTime();
      if (timeLeft > 0 && timeLeft <= membershipExpiryWindowMs) {
        notifications.push({
          id: `membership-expiring:${membership.subscription.periodEndsAt}`,
          type: "membership-expiring",
          title: "Tu membresía vence pronto",
          message: `El periodo pagado termina el ${formatDate(membership.subscription.periodEndsAt)}.`,
          href: "/perfil?tab=suscripcion",
          isDemo: true,
        });
      }
    }

    for (const invitation of seats.overview.invitations) {
      if (invitation.status !== "pending") continue;
      notifications.push({
        id: `seat-invitation:${invitation.id}`,
        type: "seat-invitation",
        title: "Nueva invitación a butaca compartida",
        message: `${invitation.inviterName} te invitó a compartir una butaca para «${invitation.eventTitle}».`,
        href: "/eventos?tab=butacas",
        isDemo: true,
      });
    }

    for (const cycle of cycles.cycles) {
      if (cycle.status !== "closed" || !cycle.resultsPublished) continue;
      notifications.push({
        id: `voting-results:${cycle.id}`,
        type: "voting-results",
        title: "Resultados de votación disponibles",
        message: `Ya se publicaron los resultados de «${cycle.title}».`,
        href: "/eventos?tab=votaciones",
        isDemo: true,
      });
    }

    return {
      ok: true,
      notifications: notifications.map((notification) => ({
        ...notification,
        isRead: readIds.ids.includes(notification.id),
      })),
    };
  },

  markAsRead(userId, userName, notificationId) {
    const current = this.getNotifications(userId, userName);
    if (!current.ok) return current;

    const notification = current.notifications.find(
      (item) => item.id === notificationId,
    );
    if (!notification) return { ok: false, reason: "not-found" };
    if (notification.isRead) return current;

    const readIds = readReadIds(userId);
    if (!readIds.ok) return readIds;
    const saved = saveReadIds(userId, [...readIds.ids, notificationId]);
    if (!saved.ok) return saved;

    return this.getNotifications(userId, userName);
  },

  markAllAsRead(userId, userName) {
    const current = this.getNotifications(userId, userName);
    if (!current.ok) return current;

    const readIds = readReadIds(userId);
    if (!readIds.ok) return readIds;

    const allIds = new Set([
      ...readIds.ids,
      ...current.notifications.map((notification) => notification.id),
    ]);
    const saved = saveReadIds(userId, Array.from(allIds));
    if (!saved.ok) return saved;

    return this.getNotifications(userId, userName);
  },
};
