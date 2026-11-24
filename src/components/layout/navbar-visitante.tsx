"use client";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { useSession } from "@/components/auth/session-provider";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";
import { NavbarSesion } from "@/components/layout/navbar-sesion";

export function NavbarVisitante() {
  const { state } = useSession();

  if (state.status === "ready" && state.user !== null) {
    return <NavbarSesion />;
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/70 bg-[linear-gradient(180deg,rgba(5,5,6,0.98),rgba(5,5,6,0.82))]">
      <nav
        className="mx-auto flex h-full max-w-300 items-center justify-between px-6"
        aria-label="Navegación principal"
      >
        <PillarboxedLogo />
        <div className="flex items-center gap-5">
          {state.status !== "loading" && <AuthDialog />}
        </div>
      </nav>
    </header>
  );
}
