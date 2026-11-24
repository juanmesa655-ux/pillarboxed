"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";

const publicPaths = new Set([
  "/",
  "/acerca-de",
  "/acceso",
  "/ayuda",
  "/membresia",
  "/politica-de-privacidad",
  "/solicitar-acceso",
  "/terminos-de-uso",
]);

export function SessionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSession();
  const hadAuthenticatedSession = useRef(false);
  const isPublicPath = pathname !== null && publicPaths.has(pathname);
  const isAccessPath = pathname === "/acceso";

  useEffect(() => {
    if (state.status !== "ready") return;

    if (state.user) {
      hadAuthenticatedSession.current = true;
      if (isAccessPath) router.replace("/");
      return;
    }

    if (!isPublicPath) {
      router.replace(hadAuthenticatedSession.current ? "/" : "/acceso");
    }
  }, [isAccessPath, isPublicPath, router, state]);

  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando tu sesión...
        </p>
      </main>
    );
  }

  if (isPublicPath && !(isAccessPath && state.status === "ready" && state.user)) {
    return children;
  }

  if (state.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="max-w-lg text-center text-sm leading-6 text-(--error)" role="alert">
          No pudimos comprobar tu sesión de prueba. Habilita el almacenamiento
          local del navegador y recarga la página.
        </p>
      </main>
    );
  }

  if (state.status === "ready" && state.user === null) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando tu sesión...
        </p>
      </main>
    );
  }

  if (isAccessPath) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Ya iniciaste sesión. Volviendo al inicio...
        </p>
      </main>
    );
  }

  return children;
}
