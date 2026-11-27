"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, UserRound } from "lucide-react";
import { Tabs } from "@base-ui/react/tabs";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-provider";
import { FollowButton } from "@/components/profile/follow-button";
import { tmdbMovieRepository } from "@/lib/data/movies";
import {
  authRepository,
  type PublicProfile,
} from "@/lib/data/auth-repository";

type PublicProfileState =
  | { status: "loading" }
  | { status: "ready"; profile: PublicProfile }
  | { status: "not-found" }
  | { status: "error"; message: string };

type ProfileBackdropState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "ready"; backdropPath: string };

export function PublicProfilePage({ userId }: { userId: string }) {
  const { state: session } = useSession();
  const [profileState, setProfileState] = useState<PublicProfileState>({
    status: "loading",
  });
  const [retryCount, setRetryCount] = useState(0);
  const [backdropResult, setBackdropResult] = useState<{
    requestKey: string;
    state: ProfileBackdropState;
  } | null>(null);
  const [backdropRetryCount, setBackdropRetryCount] = useState(0);
  const backdropRequestKey = `${userId}:${backdropRetryCount}`;
  const backdropState =
    backdropResult?.requestKey === backdropRequestKey
      ? backdropResult.state
      : null;

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

  useEffect(() => {
    if (profileState.status !== "ready") return;

    const controller = new AbortController();
    let active = true;

    async function loadBackdrop() {
      const trendingResult = await tmdbMovieRepository.getTrending(
        controller.signal,
      );
      if (!active || controller.signal.aborted) return;
      if (!trendingResult.ok) {
        if (trendingResult.reason !== "aborted") {
          setBackdropResult({
            requestKey: backdropRequestKey,
            state: { status: "error" },
          });
        }
        return;
      }

      const featuredMovie = trendingResult.movies[0];
      if (!featuredMovie) {
        setBackdropResult({
          requestKey: backdropRequestKey,
          state: { status: "empty" },
        });
        return;
      }

      const detailsResult = await tmdbMovieRepository.getMovieDetails(
        featuredMovie.id,
        controller.signal,
      );
      if (!active || controller.signal.aborted) return;
      if (!detailsResult.ok) {
        if (detailsResult.reason !== "aborted") {
          setBackdropResult({
            requestKey: backdropRequestKey,
            state: { status: "error" },
          });
        }
        return;
      }

      setBackdropResult({
        requestKey: backdropRequestKey,
        state: detailsResult.movie.backdropPath
          ? {
              status: "ready",
              backdropPath: detailsResult.movie.backdropPath,
            }
          : { status: "empty" },
      });
    }

    void loadBackdrop();

    return () => {
      active = false;
      controller.abort();
    };
  }, [backdropRequestKey, profileState.status]);

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
    <Tabs.Root defaultValue="yo" className="-mt-9 w-full sm:-mt-12">
      <div className="relative isolate left-1/2 -ml-[50vw] w-screen overflow-hidden bg-(--surface)">
        {backdropState?.status === "ready" && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${backdropState.backdropPath}`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
            onError={() =>
              setBackdropResult({
                requestKey: backdropRequestKey,
                state: { status: "error" },
              })
            }
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,20,24,0.9)_0%,rgba(19,20,24,0.55)_15%,rgba(19,20,24,0)_50%,rgba(19,20,24,0.55)_85%,rgba(19,20,24,0.9)_100%)]"
        />
        <div className="relative mx-auto flex min-h-64 w-full max-w-220 flex-col px-4 pt-9 sm:min-h-80 sm:px-6 sm:pt-12">
          <div className="mb-3 flex justify-end">
            {isOwnProfile ? (
              <Link
                href="/perfil"
                aria-label="Ajustes de la cuenta"
                title="Ajustes de la cuenta"
                className="grid size-10 shrink-0 place-items-center text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Pencil
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.5}
                />
              </Link>
            ) : (
              <FollowButton
                key={profileState.profile.id}
                targetUserId={profileState.profile.id}
              />
            )}
          </div>

          <header className="flex flex-col items-center text-center">
            <div
              role="img"
              aria-label={`Foto de perfil de ${profileState.profile.firstName} ${profileState.profile.lastName}`}
              className="grid size-20 place-items-center rounded-full border border-border bg-(--surface-elevated) text-(--fg-secondary) sm:size-24"
            >
              <UserRound
                aria-hidden="true"
                className="size-10 sm:size-12"
                strokeWidth={1.5}
              />
            </div>
            <h1
              id="public-profile-name"
              className="mt-4 break-words font-(family-name:--font-title) text-3xl font-semibold leading-tight text-(--fg) sm:text-4xl"
            >
              {profileState.profile.firstName} {profileState.profile.lastName}
            </h1>
          </header>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="h-6"
      />

      <Tabs.List
        aria-label={`Secciones del perfil de ${profileState.profile.firstName}`}
        className="-mx-4 flex justify-center gap-5 border-b border-border px-4 sm:-mx-6 sm:px-6"
      >
        <Tabs.Tab
          value="yo"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Yo
        </Tabs.Tab>
        <Tabs.Tab
          value="peliculas"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Películas
        </Tabs.Tab>
        <Tabs.Tab
          value="lista-para-ver"
          className="profile-tab-trigger min-h-11 border-b border-transparent bg-transparent px-1 pb-1 text-sm text-(--fg-secondary) transition-colors hover:text-(--fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent data-[active]:border-accent data-[active]:text-(--fg)"
        >
          Lista para ver
        </Tabs.Tab>
      </Tabs.List>

      {backdropState?.status === "error" && (
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-sm text-(--error)" role="alert">
            No pudimos cargar el banner de película.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBackdropRetryCount((count) => count + 1)}
          >
            Reintentar
          </Button>
        </div>
      )}

      <div className="-mx-4 px-4 sm:-mx-6 sm:px-6">
        <Tabs.Panel value="yo" className="pt-6 sm:pt-8">
          <section
            aria-labelledby="favorite-movies-title"
            className="border-b border-border pb-6 sm:pb-8"
          >
            <h2
              id="favorite-movies-title"
              className="font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
            >
              Mis preferidas
            </h2>
            <div
              aria-hidden="true"
              className="mx-auto mt-5 grid max-w-96 grid-cols-3 gap-4"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-2/3 border border-border bg-(--surface)"
                />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="recent-movies-title"
            className="pt-6 sm:pt-8"
          >
            <h2
              id="recent-movies-title"
              className="mb-5 font-(family-name:--font-title) text-2xl font-semibold text-(--fg)"
            >
              Las que vi hace nada
            </h2>
            <div
              aria-hidden="true"
              className="flex gap-4 overflow-x-auto pb-2 sm:gap-6 lg:justify-center lg:gap-4 lg:overflow-x-visible"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-2/3 w-36 shrink-0 border border-border bg-(--surface) sm:w-44 lg:w-[calc((100%_-_5rem)/6)] lg:max-w-44"
                />
              ))}
            </div>
          </section>
        </Tabs.Panel>

        <Tabs.Panel value="peliculas" className="pt-6 sm:pt-8">
          <div className="border border-border bg-(--surface)/60 px-5 py-8 text-center sm:px-7">
            <p className="text-sm text-(--fg-secondary)" role="status">
              Aún sin películas
            </p>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="lista-para-ver" className="pt-6 sm:pt-8">
          <div className="border border-border bg-(--surface)/60 px-5 py-8 text-center sm:px-7">
            <p className="text-sm text-(--fg-secondary)" role="status">
              Ninguna para ver
            </p>
          </div>
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
