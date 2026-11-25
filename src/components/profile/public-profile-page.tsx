"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-provider";
import { FollowButton } from "@/components/profile/follow-button";
import {
  authRepository,
  type PublicProfile,
} from "@/lib/data/auth-repository";

type PublicProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: PublicProfile }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function PublicProfilePage({ userId }: { userId: string }) {
  const { state: session } = useSession();
  const [profileState, setProfileState] = useState<PublicProfileState>({
    status: "loading",
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (session.status === "loading") return;

    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (session.status === "error") {
        setProfileState({
          status: "error",
          message:
            "No pudimos comprobar tu sesión. Habilita el almacenamiento local y vuelve a intentarlo.",
        });
        return;
      }
      if (session.user === null) {
        setProfileState({
          status: "error",
          message: "Inicia sesión para consultar perfiles públicos.",
        });
        return;
      }

      const result = authRepository.readPublicProfile(userId);
      if (!result.ok) {
        setProfileState({
          status: "error",
          message:
            result.reason === "unauthenticated"
              ? "Inicia sesión para consultar perfiles públicos."
              : result.reason === "invalid-data"
                ? "No pudimos leer las cuentas guardadas. Revisa los datos e inténtalo de nuevo."
                : "El almacenamiento local no está disponible. Inténtalo de nuevo.",
        });
        return;
      }

      setProfileState(
        result.profile
          ? { status: "ready", profile: result.profile }
          : { status: "not-found" },
      );
    });

    return () => {
      active = false;
    };
  }, [retryCount, session, userId]);

  if (profileState.status === "loading") {
    return (
      <p className="py-10 text-sm text-(--fg-secondary)" role="status">
        Cargando perfil...
      </p>
    );
  }

  if (profileState.status === "error") {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-sm text-(--error)" role="alert">
          {profileState.message}
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

  if (profileState.status === "not-found") {
    return (
      <p className="mt-8 border-y border-border py-8 text-sm text-(--fg-secondary)" role="status">
        No encontramos este perfil o la cuenta ya no está activa.
      </p>
    );
  }

  const isOwnProfile =
    session.status === "ready" &&
    session.user !== null &&
    session.user.id === profileState.profile.id;

  return (
    <section
      className="mt-8 max-w-160 border border-border bg-(--surface)/60 p-6 sm:p-8"
      aria-labelledby="public-profile-name"
    >
      <div className="flex items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <div
            role="img"
            aria-label={`Foto de perfil de ${profileState.profile.firstName} ${profileState.profile.lastName}`}
            className="grid size-20 shrink-0 place-items-center rounded-full border border-border bg-(--surface-elevated) text-(--fg-secondary) sm:size-24"
          >
            <UserRound aria-hidden="true" className="size-10 sm:size-12" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1
              id="public-profile-name"
              className="break-words font-(family-name:--font-title) text-3xl font-semibold leading-tight text-(--fg) sm:text-4xl"
            >
              {profileState.profile.firstName} {profileState.profile.lastName}
            </h1>
          </div>
        </div>
        {isOwnProfile ? (
          <Link
            href="/perfil"
            aria-label="Editar información personal"
            title="Editar información personal"
            className="grid size-10 shrink-0 place-items-center border border-border text-(--fg-secondary) hover:border-accent hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Settings aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </Link>
        ) : (
          <FollowButton
            key={profileState.profile.id}
            targetUserId={profileState.profile.id}
          />
        )}
      </div>
      <p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-(--fg-muted)">
        Este perfil muestra únicamente el nombre y los apellidos de la persona.
        El correo institucional, la carrera y el semestre permanecen privados.
      </p>
    </section>
  );
}
