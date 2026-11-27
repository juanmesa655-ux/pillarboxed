"use client";

import Link from "next/link";
import { Popover } from "@base-ui/react/popover";
import { Bell } from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { FullPageNavigationLink } from "@/components/errors/full-page-navigation-link";
import {
  NotificationList,
  useNotificationFeed,
} from "@/components/notifications/notification-feed";

export function NotificationBell({
  fullPageNavigation = false,
}: {
  fullPageNavigation?: boolean;
}) {
  const { state } = useSession();

  if (state.status !== "ready" || state.user === null) return null;

  return (
    <NotificationBellForUser
      key={state.user.id}
      userId={state.user.id}
      userName={`${state.user.firstName} ${state.user.lastName}`}
      fullPageNavigation={fullPageNavigation}
    />
  );
}

function NotificationBellForUser({
  userId,
  userName,
  fullPageNavigation,
}: {
  userId: string;
  userName: string;
  fullPageNavigation: boolean;
}) {
  const feed = useNotificationFeed(userId, userName);
  const unreadCount =
    feed.state.status === "ready"
      ? feed.state.notifications.filter((notification) => !notification.isRead)
          .length
      : 0;
  const triggerLabel =
    unreadCount === 0
      ? "Notificaciones"
      : `Notificaciones, ${unreadCount} sin leer`;

  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={triggerLabel}
        title={triggerLabel}
        className="relative grid size-9 place-items-center text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Bell aria-hidden="true" className="size-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-(--highlight) px-1 text-[9px] font-semibold text-(--bg-pillar)"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="end"
          sideOffset={8}
          className="z-50"
        >
          <Popover.Popup className="max-h-[min(70vh,34rem)] w-[min(27rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-(--surface-elevated) text-(--fg) shadow-lg outline-none">
            <div className="border-b border-border px-4 py-3">
              <Popover.Title className="font-(family-name:--font-title) text-xl font-semibold text-(--fg)">
                Notificaciones
              </Popover.Title>
              <Popover.Description className="mt-1 text-xs leading-5 text-(--fg-secondary)">
                Avisos de esta cuenta de prueba.
              </Popover.Description>
            </div>
            <div className="auth-registration-scroll max-h-[calc(70vh-8rem)] overflow-y-auto p-2">
              <NotificationList
                feed={feed}
                limit={6}
                fullPageNavigation={fullPageNavigation}
              />
            </div>
            <div className="border-t border-border px-4 py-3">
              {fullPageNavigation ? (
                <FullPageNavigationLink
                  href="/notificaciones"
                  className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ver todas
                </FullPageNavigationLink>
              ) : (
                <Link
                  href="/notificaciones"
                  className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ver todas
                </Link>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
