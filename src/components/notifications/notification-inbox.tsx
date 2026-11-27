"use client";

import { useSession } from "@/components/auth/session-provider";
import {
  NotificationList,
  useNotificationFeed,
} from "@/components/notifications/notification-feed";

export function NotificationInbox() {
  const { state } = useSession();

  if (state.status !== "ready" || state.user === null) {
    return (
      <p className="py-8 text-sm text-(--fg-secondary)" role="status">
        Comprobando tu sesión...
      </p>
    );
  }

  return (
    <NotificationInboxForUser
      key={state.user.id}
      userId={state.user.id}
      userName={`${state.user.firstName} ${state.user.lastName}`}
    />
  );
}

function NotificationInboxForUser({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const feed = useNotificationFeed(userId, userName);

  return (
    <div className="rounded-lg border border-border bg-(--surface)/60 p-4 sm:p-6">
      <NotificationList feed={feed} />
    </div>
  );
}
