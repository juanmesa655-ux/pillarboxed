"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CircleDot,
  Clock3,
  CreditCard,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullPageNavigationLink } from "@/components/errors/full-page-navigation-link";
import {
  notificationRepository,
  type AppNotification,
  type NotificationFailureReason,
  type NotificationType,
} from "@/lib/data/notifications";

export type NotificationFeedState =
  | { status: "loading" }
  | { status: "ready"; notifications: AppNotification[] }
  | { status: "error"; message: string };

export type NotificationFeedController = {
  state: NotificationFeedState;
  actionError: string;
  retry: () => void;
  markAsRead: (notificationId: string) => boolean;
  markAllAsRead: () => void;
};

const notificationIcons: Record<NotificationType, LucideIcon> = {
  "payment-approved": CreditCard,
  "payment-rejected": CreditCard,
  "membership-expiring": Clock3,
  "voting-results": Trophy,
  "seat-invitation": Users,
};

const notificationLabels: Record<NotificationType, string> = {
  "payment-approved": "Pago aprobado",
  "payment-rejected": "Pago rechazado",
  "membership-expiring": "Vencimiento de membresía",
  "voting-results": "Resultados de votación",
  "seat-invitation": "Invitación a butaca",
};

function getErrorMessage(reason: NotificationFailureReason) {
  switch (reason) {
    case "invalid-data":
      return "No pudimos leer las notificaciones guardadas. Revisa los datos e inténtalo de nuevo.";
    case "not-found":
      return "La notificación seleccionada ya no está disponible.";
    case "unauthenticated":
      return "Inicia sesión para consultar tus notificaciones.";
    case "unavailable":
      return "El almacenamiento local no está disponible. Inténtalo de nuevo.";
  }
}

export function useNotificationFeed(
  userId: string,
  userName: string,
): NotificationFeedController {
  const [state, setState] = useState<NotificationFeedState>({
    status: "loading",
  });
  const [actionError, setActionError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;

      const result = notificationRepository.getNotifications(userId, userName);
      setState(
        result.ok
          ? { status: "ready", notifications: result.notifications }
          : { status: "error", message: getErrorMessage(result.reason) },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount, userId, userName]);

  function retry() {
    setActionError("");
    setState({ status: "loading" });
    setRetryCount((count) => count + 1);
  }

  function markAsRead(notificationId: string) {
    if (state.status !== "ready") return false;

    const result = notificationRepository.markAsRead(
      userId,
      userName,
      notificationId,
    );
    if (!result.ok) {
      setActionError(getErrorMessage(result.reason));
      return false;
    }

    setActionError("");
    setState({ status: "ready", notifications: result.notifications });
    return true;
  }

  function markAllAsRead() {
    if (state.status !== "ready") return;

    const result = notificationRepository.markAllAsRead(userId, userName);
    if (!result.ok) {
      setActionError(getErrorMessage(result.reason));
      return;
    }

    setActionError("");
    setState({ status: "ready", notifications: result.notifications });
  }

  return { state, actionError, retry, markAsRead, markAllAsRead };
}

export function NotificationList({
  feed,
  limit,
  fullPageNavigation = false,
}: {
  feed: NotificationFeedController;
  limit?: number;
  fullPageNavigation?: boolean;
}) {
  const { state, actionError, markAsRead, markAllAsRead, retry } = feed;

  if (state.status === "loading") {
    return (
      <p className="py-6 text-center text-sm text-(--fg-secondary)" role="status">
        Cargando notificaciones...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3 py-5">
        <p className="text-sm text-(--error)" role="alert">
          {state.message}
        </p>
        <Button type="button" variant="outline" onClick={retry}>
          Reintentar
        </Button>
      </div>
    );
  }

  const unreadCount = state.notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const notifications = limit
    ? state.notifications.slice(0, limit)
    : state.notifications;

  return (
    <div>
      <div className="flex min-h-9 items-center justify-between gap-3">
        {state.notifications.length > 0 && (
          <p className="text-xs text-(--fg-secondary)" role="status">
            {unreadCount === 0
            ? "Todas las notificaciones están leídas."
              : `${unreadCount} sin leer`}
          </p>
        )}
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs text-(--accent)"
            onClick={markAllAsRead}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {actionError && (
        <p className="py-2 text-sm text-(--error)" role="alert">
          {actionError}
        </p>
      )}

      {notifications.length === 0 ? (
        <div className="border-y border-border py-8 text-center">
          <Bell
            aria-hidden="true"
            className="mx-auto size-5 text-(--fg-muted)"
            strokeWidth={1.5}
          />
          <p className="mt-3 text-sm text-(--fg-secondary)" role="status">
            No tienes notificaciones por ahora.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {notifications.map((notification) => {
            const NotificationIcon = notificationIcons[notification.type];
            const ReadIcon = notification.isRead ? CheckCircle2 : CircleDot;
            const notificationLabel = notificationLabels[notification.type];

            return (
              <li key={notification.id}>
                {fullPageNavigation ? (
                  <FullPageNavigationLink
                    href={notification.href}
                    onClick={(event) => {
                      if (!markAsRead(notification.id)) event.preventDefault();
                    }}
                    className={`block rounded-lg px-3 py-4 transition-colors hover:bg-(--surface) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                      notification.isRead ? "" : "bg-(--accent)/5"
                    }`}
                  >
                    {notificationContent(
                      NotificationIcon,
                      ReadIcon,
                      notification,
                      notificationLabel,
                    )}
                  </FullPageNavigationLink>
                ) : (
                  <Link
                    href={notification.href}
                    onClick={(event) => {
                      if (!markAsRead(notification.id)) event.preventDefault();
                    }}
                    className={`block rounded-lg px-3 py-4 transition-colors hover:bg-(--surface) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                      notification.isRead ? "" : "bg-(--accent)/5"
                    }`}
                  >
                    {notificationContent(
                      NotificationIcon,
                      ReadIcon,
                      notification,
                      notificationLabel,
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function notificationContent(
  NotificationIcon: LucideIcon,
  ReadIcon: LucideIcon,
  notification: AppNotification,
  notificationLabel: string,
) {
  return (
    <div className="flex items-start gap-3">
      <NotificationIcon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-accent"
        strokeWidth={1.5}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h3 className="text-sm font-medium text-(--fg)">
            {notification.title}
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-(--fg-muted)">
            <ReadIcon aria-hidden="true" className="size-3" />
            {notification.isRead ? "Leída" : "Sin leer"}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-(--fg-secondary)">
          {notification.message}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--fg-muted)">
          <span>{notificationLabel}</span>
          {notification.isDemo && <span>Demostración</span>}
        </div>
      </div>
    </div>
  );
}
