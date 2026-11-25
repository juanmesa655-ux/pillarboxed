"use client";

import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function MembershipLoginAction() {
  const { state } = useSession();

  if (state.status === "loading") return null;

  if (state.status === "error") {
    return (
      <p className="text-sm leading-6 text-(--error)" role="alert">
        No pudimos comprobar tu sesión de prueba.
      </p>
    );
  }

  if (state.user) {
    return (
      <div>
        <p className="text-sm leading-6 text-(--fg-secondary)" role="status">
          Consulta tu nivel de membresía y accede al flujo de demostración
          desde tu perfil.
        </p>
        <Link
          href="/perfil?tab=suscripcion"
          className="mt-3 inline-flex text-sm text-accent underline decoration-border underline-offset-4 hover:text-(--accent-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Ir a Mi suscripción
        </Link>
      </div>
    );
  }

  return (
    <AuthDialog
      loginOnly
      loginLabel="Inicia sesión para continuar"
      loginButton
    />
  );
}
