"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-provider";
import { PillarboxedLogo } from "@/components/layout/pillarboxed-logo";
import { MovieSearchBar } from "@/components/movies/movie-search-bar";

const navigationItems = [
  { label: "Inicio", href: "/" },
  { label: "Películas", href: "/peliculas" },
  { label: "Eventos", href: "/eventos" },
];

export function NavbarSesion() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, signOut } = useSession();
  const [error, setError] = useState("");

  if (state.status !== "ready" || state.user === null) return null;

  function handleSignOut() {
    const result = signOut();
    if (!result.ok) {
      setError("No pudimos cerrar la sesión de prueba. Intenta de nuevo.");
      return;
    }
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[linear-gradient(180deg,rgba(5,5,6,0.98),rgba(5,5,6,0.82))]">
      <nav
        className="mx-auto flex min-h-16 max-w-300 items-center justify-between gap-3 px-4 sm:px-6"
        aria-label="Navegación principal"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-8">
          <PillarboxedLogo />
          <ul className="flex items-center gap-3 text-xs sm:gap-5 sm:text-sm">
            {navigationItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "border-b border-accent pb-1 text-(--fg)"
                        : "text-(--fg-secondary) hover:text-(--fg)"
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <MovieSearchBar />
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden max-w-36 truncate text-sm text-(--fg-secondary) md:inline">
            {state.user.firstName}
          </span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-1 text-xs text-(--fg-secondary) sm:text-sm"
            onClick={handleSignOut}
          >
            <span className="sm:hidden">Salir</span>
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </nav>
      {error && (
        <p className="mx-auto max-w-300 px-4 pb-2 text-sm text-(--error) sm:px-6" role="alert">
          {error}
        </p>
      )}
    </header>
  );
}
