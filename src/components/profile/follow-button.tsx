"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  socialRepository,
  type FollowFailureReason,
} from "@/lib/data/social";

type FollowState =
  | { status: "loading" }
  | { status: "ready"; isFollowing: boolean }
  | { status: "error"; message: string };

function getErrorMessage(reason: FollowFailureReason): string {
  switch (reason) {
    case "cannot-follow-self":
      return "No puedes seguir tu propio perfil.";
    case "not-found":
      return "No encontramos ese perfil.";
    case "invalid-data":
      return "No pudimos leer tus seguimientos. Revisa los datos e inténtalo de nuevo.";
    case "unauthenticated":
      return "Inicia sesión para seguir perfiles.";
    case "unavailable":
      return "El almacenamiento local no está disponible. Inténtalo de nuevo.";
  }

  const unexpectedReason: never = reason;
  return unexpectedReason;
}

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { state: session } = useSession();
  const [followState, setFollowState] = useState<FollowState>({
    status: "loading",
  });
  const [retryCount, setRetryCount] = useState(0);
  const currentUserId =
    session.status === "ready" ? session.user?.id ?? null : null;

  useEffect(() => {
    if (session.status === "loading") return;

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (session.status === "error") {
        setFollowState({
          status: "error",
          message:
            "No pudimos comprobar tu sesión. Recarga la página e inténtalo de nuevo.",
        });
        return;
      }
      if (session.user === null) {
        setFollowState({
          status: "error",
          message: "Inicia sesión para consultar este perfil.",
        });
        return;
      }
      if (session.user.id === targetUserId) {
        setFollowState({ status: "ready", isFollowing: false });
        return;
      }

      const result = socialRepository.getFollowStatus(targetUserId);
      setFollowState(
        result.ok
          ? { status: "ready", isFollowing: result.isFollowing }
          : { status: "error", message: getErrorMessage(result.reason) },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount, session, targetUserId]);

  function handleFollowChange() {
    if (followState.status !== "ready") return;

    const result = followState.isFollowing
      ? socialRepository.unfollow(targetUserId)
      : socialRepository.follow(targetUserId);

    if (!result.ok) {
      setFollowState({
        status: "error",
        message: getErrorMessage(result.reason),
      });
      return;
    }

    setFollowState({ status: "ready", isFollowing: result.isFollowing });
  }

  if (currentUserId === targetUserId) {
    return (
      <Link
        href="/perfil"
        className="text-sm text-(--fg-secondary) underline decoration-border underline-offset-4 hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Editar mi perfil
      </Link>
    );
  }

  if (followState.status === "loading") {
    return (
      <p className="text-sm text-(--fg-secondary)" role="status">
        Comprobando seguimiento...
      </p>
    );
  }

  if (followState.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-(--error)" role="alert">
          {followState.message}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {followState.isFollowing && (
        <span className="text-sm text-(--fg-secondary)" role="status">
          Siguiendo
        </span>
      )}
      <Button
        type="button"
        variant={followState.isFollowing ? "outline" : "default"}
        aria-pressed={followState.isFollowing}
        onClick={handleFollowChange}
      >
        {followState.isFollowing ? "Dejar de seguir" : "Seguir"}
      </Button>
    </div>
  );
}
