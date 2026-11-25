"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";
import type { UserRole } from "@/lib/data/auth-repository";

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { state } = useSession();
  const isForbidden =
    state.status === "ready" &&
    state.user !== null &&
    !allowedRoles.includes(state.user.role);

  useEffect(() => {
    if (isForbidden) router.replace("/403");
  }, [isForbidden, router]);

  if (state.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-sm text-(--fg-secondary)" role="status">
          Comprobando tus permisos...
        </p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="max-w-lg text-center text-sm leading-6 text-(--error)" role="alert">
          No pudimos comprobar tus permisos. Habilita el almacenamiento local y
          recarga la página.
        </p>
      </main>
    );
  }

  if (isForbidden) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="max-w-lg text-center">
          <p className="text-sm text-(--fg-secondary)" role="status">
            Redirigiendo a la página de acceso denegado...
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/403"
              className="text-accent underline underline-offset-4 hover:text-(--accent-hover)"
            >
              Continuar
            </Link>
            <Link
              href="/"
              className="text-(--fg-secondary) underline underline-offset-4 hover:text-(--fg)"
            >
              Ir al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!state.user) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="max-w-lg text-center">
          <h1 className="font-(family-name:--font-title) text-3xl text-(--fg)">
            No tienes acceso a esta sección
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--fg-secondary)">
            Esta herramienta está disponible solo para las personas autorizadas.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex text-sm text-accent underline underline-offset-4 hover:text-(--accent-hover)"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
